"""Coupon serializer and validate-coupon API view."""

from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    discount_display = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'discount_display',
            'expires_at',
        ]

    def get_discount_display(self, obj):
        if obj.discount_type == 'percentage':
            cap = f' (max ₹{obj.max_discount_amount})' if obj.max_discount_amount else ''
            return f'{obj.discount_value}% off{cap}'
        return f'₹{obj.discount_value} flat off'


class ValidateCouponView(APIView):
    """
    POST /api/orders/validate-coupon/
    Body: { "code": "SAVE10", "order_total": 500.00 }
    Returns coupon info and computed discount.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').upper().strip()
        order_total = request.data.get('order_total', 0)

        try:
            order_total = float(order_total)
        except (TypeError, ValueError):
            return Response({'message': 'Invalid order_total.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Coupon not found.'}, status=status.HTTP_404_NOT_FOUND)

        valid, msg = coupon.is_valid()
        if not valid:
            return Response({'valid': False, 'message': msg}, status=status.HTTP_400_BAD_REQUEST)

        if order_total < float(coupon.min_order_amount):
            return Response({
                'valid': False,
                'message': f'Minimum order amount for this coupon is ₹{coupon.min_order_amount}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(order_total)
        final_total = round(order_total - float(discount), 2)

        return Response({
            'valid': True,
            'coupon': CouponSerializer(coupon).data,
            'discount_amount': discount,
            'final_total': final_total,
            'message': f'Coupon applied! You save ₹{discount}.',
        })
