"""Order API views: checkout (with coupon), history, detail, cancel, invoice."""

from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order, OrderItem, Coupon, OrderStatusLog
from .serializers import OrderListSerializer, OrderDetailSerializer, CheckoutSerializer
from .invoice import generate_invoice_pdf
from cart.models import Cart
from users.models import Address


def _log_status(order, old_status, new_status, changed_by=None, note=''):
    """Create an OrderStatusLog entry."""
    OrderStatusLog.objects.create(
        order=order,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        note=note,
    )


class CheckoutView(APIView):
    """POST /api/orders/checkout/ — Place order from cart, optionally with coupon."""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address = get_object_or_404(
            Address, pk=serializer.validated_data['address_id'], user=request.user
        )
        payment_method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')
        coupon_code = serializer.validated_data.get('coupon_code', '').upper().strip()

        cart = Cart.objects.filter(user=request.user).prefetch_related(
            'items__product_variant__product'
        ).first()

        if not cart or not cart.items.exists():
            return Response({'message': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Validate stock ────────────────────────────────────────────────────
        for item in cart.items.all():
            variant = item.product_variant
            if not variant.product.is_active:
                return Response(
                    {'message': f'"{variant.product.name}" is no longer available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if item.quantity > variant.stock:
                return Response(
                    {'message': f'Only {variant.stock} unit(s) of "{variant.product.name}" ({variant.size}) available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        cart_subtotal = cart.total

        # ── Apply Coupon ──────────────────────────────────────────────────────
        coupon = None
        discount_amount = 0

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
            except Coupon.DoesNotExist:
                return Response({'message': f'Coupon "{coupon_code}" not found.'}, status=status.HTTP_400_BAD_REQUEST)

            valid, msg = coupon.is_valid()
            if not valid:
                return Response({'message': msg}, status=status.HTTP_400_BAD_REQUEST)

            if cart_subtotal < coupon.min_order_amount:
                return Response(
                    {'message': f'Minimum order amount for coupon "{coupon_code}" is ₹{coupon.min_order_amount}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            discount_amount = coupon.calculate_discount(float(cart_subtotal))

        final_total = float(cart_subtotal) - float(discount_amount)

        # ── Snapshot address ──────────────────────────────────────────────────
        address_snapshot = {
            'name': address.name,
            'phone': address.phone,
            'address_line': address.address_line,
            'city': address.city,
            'state': address.state,
            'pincode': address.pincode,
        }

        order = Order.objects.create(
            user=request.user,
            address=address,
            address_snapshot=address_snapshot,
            coupon=coupon,
            subtotal=cart_subtotal,
            discount_amount=discount_amount,
            total_amount=round(final_total, 2),
            payment_method=payment_method,
            notes=notes,
        )

        # ── Create order items + deduct stock ─────────────────────────────────
        for item in cart.items.all():
            variant = item.product_variant
            OrderItem.objects.create(
                order=order,
                product=variant.product,
                variant=variant,
                quantity=item.quantity,
                price=variant.product.price,
                product_name=variant.product.name,
                size=variant.size,
            )
            variant.stock -= item.quantity
            variant.save()

        # ── Mark coupon as used ───────────────────────────────────────────────
        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(used_count=coupon.used_count + 1)

        # ── Log initial status ────────────────────────────────────────────────
        _log_status(order, '', 'pending', changed_by=request.user, note='Order placed.')

        # ── Clear cart ────────────────────────────────────────────────────────
        cart.items.all().delete()

        return Response(
            {
                'message': 'Order placed successfully.',
                'discount_applied': float(discount_amount),
                'order': OrderDetailSerializer(order).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OrderListView(generics.ListAPIView):
    """GET /api/orders/ — Order history for logged-in user."""
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/<id>/ — Detailed order view with status timeline."""
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_logs')


class CancelOrderView(APIView):
    """POST /api/orders/<id>/cancel/ — Cancel a pending order and restore stock."""
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)

        if order.status not in ('pending', 'packed'):
            return Response(
                {'message': f'Cannot cancel an order with status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status
        for item in order.items.all():
            if item.variant:
                item.variant.stock += item.quantity
                item.variant.save()

        # Reverse coupon usage
        if order.coupon:
            Coupon.objects.filter(pk=order.coupon_id).update(
                used_count=max(0, order.coupon.used_count - 1)
            )

        order.status = 'cancelled'
        order.save()
        _log_status(order, old_status, 'cancelled', changed_by=request.user, note='Cancelled by customer.')

        return Response({'message': 'Order cancelled successfully.'})


class InvoiceDownloadView(APIView):
    """GET /api/orders/<id>/invoice/ — Download invoice PDF."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status == 'cancelled':
            return Response(
                {'message': 'Invoice not available for cancelled orders.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pdf_bytes = generate_invoice_pdf(order)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_order_{order.id}.pdf"'
        return response
