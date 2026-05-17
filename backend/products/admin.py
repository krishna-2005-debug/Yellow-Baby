import csv
from django.contrib.admin import ModelAdmin, TabularInline, action
from django.http import HttpResponse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from yellow_baby_backend.admin_site import yellow_baby_admin
from .models import Category, Product, ProductVariant, ProductImage, Wishlist, ProductReview


# ── Inlines ────────────────────────────────────────────────────────────────────

class ProductVariantInline(TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['size', 'stock', 'sku', 'stock_indicator']
    readonly_fields = ['stock_indicator']

    def stock_indicator(self, obj):
        if not obj or not obj.pk:
            return '—'
        if obj.stock == 0:
            color, label = '#DC143C', '✗ Out of stock'
        elif obj.stock < 5:
            color, label = '#FFA500', f'⚠ Low ({obj.stock})'
        else:
            color, label = '#2E8B57', f'✓ OK ({obj.stock})'
        return format_html('<span style="color:{};font-weight:700;font-size:12px;">{}</span>', color, label)
    stock_indicator.short_description = 'Stock Status'


class ProductImageInline(TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'image_preview', 'alt_text', 'is_primary', 'order']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" width="70" height="70" style="object-fit:cover;border-radius:6px;'
                'border:2px solid #fde0d0;" />',
                obj.image.url,
            )
        return '—'
    image_preview.short_description = 'Preview'


# ── Category Admin ────────────────────────────────────────────────────────────

class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'product_count', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('products')

    def product_count(self, obj):
        count = len([p for p in obj.products.all() if p.is_active])
        return format_html('<strong>{}</strong> products', count)
    product_count.short_description = 'Active Products'


# ── Product Admin ─────────────────────────────────────────────────────────────

class ProductAdmin(ModelAdmin):
    list_display = [
        'thumbnail', 'name', 'category', 'price_display',
        'gender_badge', 'age_group', 'stock_display',
        'is_active', 'created_at',
    ]
    list_filter = ['is_active', 'gender', 'age_group', 'category']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
    list_per_page = 20
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductVariantInline, ProductImageInline]
    actions = [
        'enable_products', 'disable_products', 'export_products_csv',
    ]

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'description', 'price', 'category'),
        }),
        ('Classification', {
            'fields': ('gender', 'age_group', 'is_active'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category').prefetch_related('images', 'variants')

    def thumbnail(self, obj):
        images = list(obj.images.all())
        img = next((i for i in images if i.is_primary), None) or (images[0] if images else None)
        if img:
            return format_html(
                '<img src="{}" width="52" height="52" style="object-fit:cover;border-radius:8px;'
                'border:2px solid #fde0d0;box-shadow:0 1px 4px rgba(0,0,0,0.1);" />',
                img.image.url,
            )
        return mark_safe(
            '<div style="width:52px;height:52px;background:#fde0d0;border-radius:8px;'
            'display:flex;align-items:center;justify-content:center;font-size:20px;">&#128085;</div>'
        )
    thumbnail.short_description = ''

    def price_display(self, obj):
        return format_html('<strong style="color:#FF6B35;">₹{}</strong>', obj.price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'

    def gender_badge(self, obj):
        icons = {'boys': '💙', 'girls': '💗', 'unisex': '💛'}
        icon = icons.get(obj.gender, '—')
        return format_html('{} {}', icon, obj.get_gender_display())
    gender_badge.short_description = 'Gender'

    def stock_display(self, obj):
        total = obj.total_stock
        variants = list(obj.variants.all())
        out_of_stock = len([v for v in variants if v.stock == 0])
        low_stock = len([v for v in variants if 0 < v.stock < 5])

        if total == 0:
            return format_html('<span style="color:#DC143C;font-weight:700;">✗ Out of stock</span>')
        elif low_stock > 0:
            return format_html(
                '<span style="color:#FFA500;font-weight:700;" title="{} variant(s) low">⚠ {} ({} low)</span>',
                low_stock, total, low_stock,
            )
        return format_html('<span style="color:#2E8B57;font-weight:700;">✓ {}</span>', total)
    stock_display.short_description = 'Stock'

    @action(description='✅ Enable selected products')
    def enable_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} product(s) enabled.')

    @action(description='🚫 Disable selected products')
    def disable_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} product(s) disabled.')

    @action(description='⬇️ Export selected products to CSV')
    def export_products_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="yellow_baby_products.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Name', 'Category', 'Price (₹)', 'Gender',
            'Age Group', 'Total Stock', 'Active', 'Created',
        ])
        for p in queryset.select_related('category'):
            writer.writerow([
                p.id, p.name,
                p.category.name if p.category else '',
                float(p.price), p.gender, p.age_group,
                p.total_stock,
                'Yes' if p.is_active else 'No',
                p.created_at.strftime('%d-%m-%Y'),
            ])
        return response


# ── ProductVariant Admin ──────────────────────────────────────────────────────

class ProductVariantAdmin(ModelAdmin):
    list_display = ['product', 'size', 'stock', 'stock_display', 'sku', 'stock_bar']
    list_filter = ['size']
    search_fields = ['product__name', 'sku']
    list_editable = ['stock']
    ordering = ['product', 'size']
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')

    def stock_display(self, obj):
        if obj.stock == 0:
            color = '#DC143C'
        elif obj.stock < 5:
            color = '#FFA500'
        else:
            color = '#2E8B57'
        return format_html('<strong style="color:{};">{}</strong>', color, obj.stock)
    stock_display.short_description = 'Stock'
    stock_display.admin_order_field = 'stock'

    def stock_bar(self, obj):
        capped = min(obj.stock, 100)
        if obj.stock == 0:
            color = '#DC143C'
        elif obj.stock < 5:
            color = '#FFA500'
        else:
            color = '#2E8B57'
        return format_html(
            '<div style="background:#f0f0f0;border-radius:4px;height:10px;width:100px;">'
            '<div style="background:{};width:{}%;height:100%;border-radius:4px;"></div></div>',
            color, capped,
        )
    stock_bar.short_description = 'Level'


# ── Register All ──────────────────────────────────────────────────────────────

yellow_baby_admin.register(Category, CategoryAdmin)
yellow_baby_admin.register(Product, ProductAdmin)
yellow_baby_admin.register(ProductVariant, ProductVariantAdmin)


# ── Wishlist Admin ─────────────────────────────────────────────────────

class WishlistAdmin(ModelAdmin):
    list_display = ['user_mobile', 'product_name', 'product_price', 'added_at']
    search_fields = ['user__mobile', 'product__name']
    list_filter = ['added_at']
    ordering = ['-added_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'product')

    def user_mobile(self, obj):
        return obj.user.mobile
    user_mobile.short_description = 'Customer'

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def product_price(self, obj):
        return format_html('₹{}', obj.product.price)
    product_price.short_description = 'Price'


yellow_baby_admin.register(Wishlist, WishlistAdmin)


# ── ProductReview Admin ───────────────────────────────────────────────────

class ProductReviewAdmin(ModelAdmin):
    list_display = [
        'user_mobile', 'product_name', 'stars_display',
        'comment_preview', 'is_approved', 'created_at',
    ]
    list_filter = ['is_approved', 'rating']
    search_fields = ['user__mobile', 'product__name', 'comment']
    list_editable = ['is_approved']
    ordering = ['-created_at']
    actions = ['approve_reviews', 'reject_reviews']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'product')

    def user_mobile(self, obj):
        return obj.user.mobile
    user_mobile.short_description = 'Customer'

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def stars_display(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        colors = {1: '#DC143C', 2: '#FF6347', 3: '#FFA500', 4: '#9ACD32', 5: '#2E8B57'}
        return format_html(
            '<span style="color:{};font-size:14px;" title="{}/5">{}</span>',
            colors.get(obj.rating, '#FFA500'), obj.rating, stars,
        )
    stars_display.short_description = 'Rating'

    def comment_preview(self, obj):
        return obj.comment[:60] + '...' if len(obj.comment) > 60 else obj.comment
    comment_preview.short_description = 'Comment'

    @action(description='✅ Approve selected reviews')
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} review(s) approved.')

    @action(description='❌ Reject / Hide selected reviews')
    def reject_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} review(s) hidden.')


yellow_baby_admin.register(ProductReview, ProductReviewAdmin)
