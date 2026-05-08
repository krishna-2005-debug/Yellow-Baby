"""Upgraded Cart Admin."""

from django.contrib.admin import ModelAdmin, TabularInline
from django.utils.html import format_html
from yellow_baby_backend.admin_site import yellow_baby_admin
from .models import Cart, CartItem


class CartItemInline(TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['product_variant', 'quantity', 'subtotal_display']

    def subtotal_display(self, obj):
        return format_html('<strong>₹{:.2f}</strong>', obj.subtotal)
    subtotal_display.short_description = 'Subtotal'


class CartAdmin(ModelAdmin):
    list_display = ['user_mobile', 'item_count_display', 'total_display', 'updated_at']
    readonly_fields = ['user', 'created_at', 'updated_at']
    inlines = [CartItemInline]
    search_fields = ['user__mobile', 'user__name']

    def user_mobile(self, obj):
        return obj.user.mobile
    user_mobile.short_description = 'Customer'

    def item_count_display(self, obj):
        c = obj.item_count
        return f'{c} item{"s" if c != 1 else ""}'
    item_count_display.short_description = 'Items'

    def total_display(self, obj):
        return format_html('<strong style="color:#FF6B35;">\u20b9{}</strong>', f'{obj.total:.2f}')
    total_display.short_description = 'Cart Total'


yellow_baby_admin.register(Cart, CartAdmin)
