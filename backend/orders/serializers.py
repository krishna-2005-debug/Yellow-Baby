"""Serializers for orders."""

from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusLog


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size', 'quantity', 'price', 'subtotal']


class OrderStatusLogSerializer(serializers.ModelSerializer):
    changed_by_mobile = serializers.CharField(source='changed_by.mobile', default='System', read_only=True)

    class Meta:
        model = OrderStatusLog
        fields = ['id', 'old_status', 'new_status', 'note', 'changed_by_mobile', 'changed_at']


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    coupon_code = serializers.CharField(source='coupon.code', default=None, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'subtotal', 'discount_amount', 'total_amount',
            'coupon_code', 'status', 'payment_method',
            'payment_status', 'item_count', 'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_logs = OrderStatusLogSerializer(many=True, read_only=True)
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', default=None, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_mobile', 'address_snapshot', 'items', 'status_logs',
            'subtotal', 'discount_amount', 'coupon_code', 'total_amount',
            'status', 'payment_method', 'payment_status',
            'notes', 'created_at', 'updated_at',
        ]


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['cod', 'upi'])
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True)
