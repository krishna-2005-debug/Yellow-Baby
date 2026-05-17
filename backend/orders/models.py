"""Order, OrderItem, Coupon, and OrderStatusLog models."""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from products.models import Product, ProductVariant
from users.models import Address


class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Percentage (%)'),
        ('flat', 'Flat Amount (₹)'),
    ]

    code = models.CharField(max_length=20, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=12, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(1)],
    )
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Max discount cap for percentage coupons (leave blank for no cap)'
    )
    max_uses = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Leave blank for unlimited uses'
    )
    used_count = models.PositiveIntegerField(default=0, editable=False)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Coupon'
        verbose_name_plural = 'Coupons'
        ordering = ['-created_at']

    def __str__(self):
        if self.discount_type == 'percentage':
            return f'{self.code} — {self.discount_value}% off'
        return f'{self.code} — ₹{self.discount_value} off'

    def save(self, *args, **kwargs):
        self.code = self.code.upper().strip()
        super().save(*args, **kwargs)

    def is_valid(self):
        if not self.is_active:
            return False, 'Coupon is inactive.'
        if self.expires_at and timezone.now() > self.expires_at:
            return False, 'Coupon has expired.'
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False, 'Coupon usage limit reached.'
        return True, 'Valid'

    def calculate_discount(self, order_total):
        """Return the discount amount to deduct from order_total."""
        if order_total < self.min_order_amount:
            return 0
        if self.discount_type == 'percentage':
            discount = order_total * self.discount_value / 100
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
        else:
            discount = min(self.discount_value, order_total)
        return round(discount, 2)


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('upi', 'UPI'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders'
    )
    address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True
    )
    coupon = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    # Snapshot of address at time of order
    address_snapshot = models.JSONField(default=dict)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.user}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot at time of order
    # Snapshot of product details
    product_name = models.CharField(max_length=255)
    size = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.size})"

    @property
    def subtotal(self):
        return self.price * self.quantity


class OrderStatusLog(models.Model):
    """Tracks every status change for an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_logs')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='+'
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Order Status Log'
        verbose_name_plural = 'Order Status Logs'
        ordering = ['-changed_at']

    def __str__(self):
        return f'Order #{self.order_id}: {self.old_status} → {self.new_status}'
