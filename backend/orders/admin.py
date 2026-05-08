import csv
from django.contrib.admin import ModelAdmin, TabularInline, action
from django.http import HttpResponse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils import timezone
from yellow_baby_backend.admin_site import yellow_baby_admin
from .models import Order, OrderItem, Coupon, OrderStatusLog


# ── Inline ─────────────────────────────────────────────────────────────────────

class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'size', 'quantity', 'price', 'subtotal_display']
    fields = ['product_name', 'size', 'quantity', 'price', 'subtotal_display']
    can_delete = False

    def subtotal_display(self, obj):
        return format_html('₹{}', f'{obj.subtotal:.2f}')
    subtotal_display.short_description = 'Subtotal'


# ── Order Admin ────────────────────────────────────────────────────────────────

class OrderAdmin(ModelAdmin):
    list_display = [
        'order_id', 'user_mobile', 'user_name', 'total_amount_display',
        'status_badge', 'payment_badge', 'payment_method',
        'item_count', 'invoice_link', 'created_at',
    ]
    list_filter = ['status', 'payment_method', 'payment_status', 'created_at']
    search_fields = ['user__mobile', 'user__name', 'id']
    readonly_fields = ['user', 'total_amount', 'address_snapshot', 'created_at', 'updated_at']
    ordering = ['-created_at']
    inlines = [OrderItemInline]
    list_per_page = 25
    actions = [
        'mark_packed', 'mark_shipped', 'mark_delivered', 'mark_cancelled',
        'mark_paid', 'export_orders_csv',
    ]

    fieldsets = (
        ('Order Info', {
            'fields': ('user', 'total_amount', 'status', 'notes', 'created_at', 'updated_at'),
        }),
        ('Payment', {
            'fields': ('payment_method', 'payment_status'),
        }),
        ('Delivery Address', {
            'fields': ('address', 'address_snapshot'),
        }),
    )

    # ── Display Methods ────────────────────────────────────────────────────────

    def order_id(self, obj):
        return format_html('<strong style="color:#FF6B35;">#{}</strong>', obj.id)
    order_id.short_description = 'Order'
    order_id.admin_order_field = 'id'

    def user_mobile(self, obj):
        return obj.user.mobile
    user_mobile.short_description = 'Mobile'

    def user_name(self, obj):
        return obj.user.name or '—'
    user_name.short_description = 'Customer'

    def total_amount_display(self, obj):
        return format_html('<strong>₹{}</strong>', f'{obj.total_amount:.2f}')
    total_amount_display.short_description = 'Total'
    total_amount_display.admin_order_field = 'total_amount'

    def status_badge(self, obj):
        palette = {
            'pending':   ('#FEF3C7', '#92400E'),
            'packed':    ('#DBEAFE', '#1E40AF'),
            'shipped':   ('#EDE9FE', '#5B21B6'),
            'delivered': ('#D1FAE5', '#065F46'),
            'cancelled': ('#FEE2E2', '#991B1B'),
        }
        bg, fg = palette.get(obj.status, ('#eee', '#333'))
        return format_html(
            '<span style="background:{};color:{};padding:3px 10px;border-radius:12px;'
            'font-size:11px;font-weight:700;white-space:nowrap;">{}</span>',
            bg, fg, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def payment_badge(self, obj):
        if obj.payment_status == 'paid':
            return mark_safe(
                '<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;'
                'border-radius:12px;font-size:11px;font-weight:700;">&#10003; Paid</span>'
            )
        return mark_safe(
            '<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;'
            'border-radius:12px;font-size:11px;font-weight:700;">&#8987; Pending</span>'
        )
    payment_badge.short_description = 'Payment'

    def item_count(self, obj):
        c = obj.items.count()
        return format_html('<span style="font-weight:600;">{} item{}</span>', c, 's' if c != 1 else '')
    item_count.short_description = 'Items'

    def invoice_link(self, obj):
        if obj.status == 'cancelled':
            return '—'
        url = f'/api/orders/{obj.id}/invoice/'
        return format_html(
            '<a href="{}" target="_blank" style="color:#FF6B35;font-weight:600;'
            'text-decoration:none;font-size:12px;">📄 PDF</a>', url
        )
    invoice_link.short_description = 'Invoice'

    # ── Model Save Override ────────────────────────────────────────────────────

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = Order.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                # Log status change
                OrderStatusLog.objects.create(
                    order=obj, old_status=old_obj.status, new_status=obj.status,
                    changed_by=request.user, note='Status updated via admin panel.'
                )
                # Handle cancellation (restore stock and coupon)
                if obj.status == 'cancelled' and old_obj.status != 'cancelled':
                    for item in obj.items.all():
                        if item.variant:
                            item.variant.stock += item.quantity
                            item.variant.save()
                    if obj.coupon:
                        Coupon.objects.filter(pk=obj.coupon_id).update(
                            used_count=max(0, obj.coupon.used_count - 1)
                        )
        super().save_model(request, obj, form, change)

    # ── Bulk Actions ───────────────────────────────────────────────────────────

    def _bulk_status_update(self, request, queryset, new_status, allowed_old_statuses=None):
        orders = queryset.all()
        if allowed_old_statuses:
            orders = orders.filter(status__in=allowed_old_statuses)
        
        count = 0
        for order in orders:
            old_status = order.status
            if old_status == new_status:
                continue
            
            order.status = new_status
            order.save(update_fields=['status', 'updated_at'])
            
            OrderStatusLog.objects.create(
                order=order, old_status=old_status, new_status=new_status,
                changed_by=request.user, note='Bulk updated via admin.'
            )
            
            # If cancelling, restore stock
            if new_status == 'cancelled' and old_status != 'cancelled':
                for item in order.items.all():
                    if item.variant:
                        item.variant.stock += item.quantity
                        item.variant.save()
                if order.coupon:
                    Coupon.objects.filter(pk=order.coupon_id).update(
                        used_count=max(0, order.coupon.used_count - 1)
                    )
            count += 1
            
        return count

    @action(description='📦 Mark as Packed')
    def mark_packed(self, request, queryset):
        count = self._bulk_status_update(request, queryset, 'packed', ['pending'])
        self.message_user(request, f'{count} order(s) marked as Packed.')

    @action(description='🚚 Mark as Shipped')
    def mark_shipped(self, request, queryset):
        count = self._bulk_status_update(request, queryset, 'shipped', ['pending', 'packed'])
        self.message_user(request, f'{count} order(s) marked as Shipped.')

    @action(description='✅ Mark as Delivered')
    def mark_delivered(self, request, queryset):
        count = self._bulk_status_update(request, queryset, 'delivered', ['pending', 'packed', 'shipped'])
        self.message_user(request, f'{count} order(s) marked as Delivered.')

    @action(description='🚫 Mark as Cancelled')
    def mark_cancelled(self, request, queryset):
        count = self._bulk_status_update(request, queryset, 'cancelled')
        self.message_user(request, f'{count} order(s) marked as Cancelled (stock restored).')

    @action(description='💳 Mark Payment as Paid')
    def mark_paid(self, request, queryset):
        updated = queryset.update(payment_status='paid')
        self.message_user(request, f'{updated} order(s) marked as Paid.')

    @action(description='⬇️ Export selected orders to CSV')
    def export_orders_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="yellow_baby_orders.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Order ID', 'Customer Mobile', 'Customer Name',
            'Total (₹)', 'Status', 'Payment Method', 'Payment Status',
            'Items', 'Date',
        ])
        for order in queryset.select_related('user').prefetch_related('items'):
            writer.writerow([
                order.id,
                order.user.mobile,
                order.user.name or '',
                float(order.total_amount),
                order.get_status_display(),
                order.get_payment_method_display(),
                order.get_payment_status_display(),
                order.items.count(),
                order.created_at.strftime('%d-%m-%Y %H:%M'),
            ])
        return response


yellow_baby_admin.register(Order, OrderAdmin)


# ── Coupon Admin ───────────────────────────────────────────────────────────────

class CouponAdmin(ModelAdmin):
    list_display = [
        'code', 'discount_display', 'min_order_amount', 'usage_display',
        'is_active', 'expires_at', 'created_at',
    ]
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['used_count', 'created_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Coupon Code', {
            'fields': ('code', 'description', 'is_active'),
        }),
        ('Discount', {
            'fields': ('discount_type', 'discount_value', 'max_discount_amount', 'min_order_amount'),
        }),
        ('Limits', {
            'fields': ('max_uses', 'used_count', 'expires_at'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def discount_display(self, obj):
        if obj.discount_type == 'percentage':
            cap = f' (max ₹{obj.max_discount_amount})' if obj.max_discount_amount else ''
            return format_html('<strong>{}</strong>% off{}', int(obj.discount_value), cap)
        return format_html('<strong>₹{}</strong> flat off', int(obj.discount_value))
    discount_display.short_description = 'Discount'

    def usage_display(self, obj):
        if obj.max_uses:
            pct = int(obj.used_count / obj.max_uses * 100)
            color = '#DC143C' if pct >= 90 else ('#FFA500' if pct >= 50 else '#2E8B57')
            return format_html(
                '<span style="color:{};"><strong>{}</strong> / {}</span>',
                color, obj.used_count, obj.max_uses,
            )
        return format_html('<strong>{}</strong> uses', obj.used_count)
    usage_display.short_description = 'Usage'


yellow_baby_admin.register(Coupon, CouponAdmin)


# ── Order Status Log Admin ─────────────────────────────────────────────────────

class OrderStatusLogAdmin(ModelAdmin):
    list_display = ['order', 'old_status', 'arrow', 'new_status', 'changed_by', 'note', 'changed_at']
    list_filter = ['new_status', 'changed_at']
    readonly_fields = ['order', 'old_status', 'new_status', 'changed_by', 'changed_at']
    ordering = ['-changed_at']

    def arrow(self, obj):
        return mark_safe('<span style="color:#FF6B35;font-weight:bold;">&rarr;</span>')
    arrow.short_description = ''


yellow_baby_admin.register(OrderStatusLog, OrderStatusLogAdmin)
