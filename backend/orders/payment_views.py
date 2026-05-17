"""
Razorpay payment integration views.

Flow:
  1. POST /api/orders/payment/create-order/
       → Creates Razorpay order, returns order_id + amount
  2. Frontend opens Razorpay checkout with the order_id
  3. On success frontend calls:
     POST /api/orders/payment/verify/
       → Verifies signature, marks order as paid

Env vars required:
  RAZORPAY_KEY_ID      – from Razorpay dashboard
  RAZORPAY_KEY_SECRET  – from Razorpay dashboard
"""

import hmac
import hashlib
import logging

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Order

logger = logging.getLogger(__name__)


def _get_razorpay_client():
    """Return an authenticated Razorpay client or None if not configured."""
    try:
        import razorpay
        key_id     = getattr(settings, 'RAZORPAY_KEY_ID', None)
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
        if not key_id or not key_secret:
            return None
        return razorpay.Client(auth=(key_id, key_secret))
    except ImportError:
        logger.warning('[Razorpay] razorpay package not installed.')
        return None


class CreateRazorpayOrderView(APIView):
    """
    POST /api/orders/payment/create-order/
    Body: { "order_id": <internal order pk> }

    Creates a Razorpay order for an existing internal order.
    Returns the Razorpay order_id so the frontend can open checkout.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'message': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, pk=order_id, user=request.user)

        if order.payment_status == 'paid':
            return Response({'message': 'This order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        client = _get_razorpay_client()
        if not client:
            return Response(
                {'message': 'Payment gateway not configured. Please use Cash on Delivery.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Razorpay amounts are in paise (1 INR = 100 paise)
        amount_paise = int(float(order.total_amount) * 100)

        try:
            rz_order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'receipt': f'order_{order.id}',
                'notes': {
                    'internal_order_id': str(order.id),
                    'customer_mobile': order.user.mobile,
                },
            })
        except Exception as exc:
            logger.exception(f'[Razorpay] Failed to create order: {exc}')
            return Response({'message': 'Payment gateway error. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            'razorpay_order_id': rz_order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
            'internal_order_id': order.id,
            'name': 'Yellow Baby',
            'description': f'Order #{order.id}',
            'prefill': {
                'contact': order.user.mobile,
                'name': order.address_snapshot.get('name', ''),
            },
        }, status=status.HTTP_200_OK)


class VerifyRazorpayPaymentView(APIView):
    """
    POST /api/orders/payment/verify/
    Body: {
        "order_id": <internal order pk>,
        "razorpay_order_id": "order_xxx",
        "razorpay_payment_id": "pay_xxx",
        "razorpay_signature": "..."
    }

    Verifies the HMAC-SHA256 signature Razorpay sends after successful payment.
    Marks the internal order as paid.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rz_order_id   = request.data.get('razorpay_order_id', '')
        rz_payment_id = request.data.get('razorpay_payment_id', '')
        rz_signature  = request.data.get('razorpay_signature', '')
        internal_id   = request.data.get('order_id')

        if not all([rz_order_id, rz_payment_id, rz_signature, internal_id]):
            return Response({'message': 'Missing payment verification fields.'}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, pk=internal_id, user=request.user)

        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        if not key_secret:
            return Response({'message': 'Payment gateway not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Verify signature: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
        payload  = f'{rz_order_id}|{rz_payment_id}'.encode()
        expected = hmac.new(key_secret.encode(), payload, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected, rz_signature):
            logger.warning(f'[Razorpay] Signature mismatch for order #{internal_id}')
            return Response({'message': 'Payment verification failed. Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark order as paid
        order.payment_status = 'paid'
        order.save(update_fields=['payment_status'])

        logger.info(f'[Razorpay] Order #{internal_id} marked as paid (payment: {rz_payment_id})')
        return Response({
            'message': 'Payment verified successfully.',
            'order_id': order.id,
            'payment_id': rz_payment_id,
            'payment_status': 'paid',
        }, status=status.HTTP_200_OK)
