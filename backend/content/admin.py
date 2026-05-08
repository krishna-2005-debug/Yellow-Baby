"""
Content Admin — manage homepage sections from the Yellow Baby admin panel.
"""

from django.contrib.admin import ModelAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from yellow_baby_backend.admin_site import yellow_baby_admin
from .models import HeroSlide, QuickCategory, AgeGroup, TrustItem, FeatureCard, StoreInfo, FooterLink


# ── Hero Slides ────────────────────────────────────────────────────────────────

class HeroSlideAdmin(ModelAdmin):
    list_display = ['order', 'slide_preview', 'title', 'tag', 'cta_label', 'cta_url', 'is_active']
    list_editable = ['order', 'is_active']
    list_display_links = ['slide_preview', 'title']
    ordering = ['order']
    list_per_page = 10

    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle', 'tag', 'image'),
        }),
        ('Call to Action', {
            'fields': ('cta_label', 'cta_url'),
        }),
        ('Design (Tailwind classes)', {
            'fields': ('bg_from', 'bg_via', 'bg_to', 'accent_from', 'accent_to', 'decor_bg'),
            'classes': ('collapse',),
            'description': 'Use Tailwind color names like amber-50, yellow-400, pink-500 etc.',
        }),
        ('Display', {
            'fields': ('order', 'is_active'),
        }),
    )

    def slide_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" style="object-fit:contain;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;" />', obj.image.url)
        return mark_safe('<span style="color:#999;">No image</span>')
    slide_preview.short_description = ''


# ── Quick Categories ───────────────────────────────────────────────────────────

class QuickCategoryAdmin(ModelAdmin):
    list_display = ['order', 'image_preview', 'label', 'search_filter', 'gender_filter', 'is_active']
    list_editable = ['order', 'label', 'search_filter', 'gender_filter', 'is_active']
    list_display_links = ['image_preview']
    ordering = ['order']
    list_per_page = 20

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="40" height="40" style="object-fit:cover;border-radius:50%;" />', obj.image.url)
        return mark_safe('<span style="color:#999;font-size:12px;">No image</span>')
    image_preview.short_description = ''


# ── Age Groups ─────────────────────────────────────────────────────────────────

class AgeGroupAdmin(ModelAdmin):
    list_display = ['order', 'emoji_preview', 'label', 'age_range', 'color_preview', 'is_active']
    list_editable = ['order', 'label', 'age_range', 'is_active']
    list_display_links = ['emoji_preview']
    ordering = ['order']

    def emoji_preview(self, obj):
        return format_html('<span style="font-size:24px;">{}</span>', obj.emoji)
    emoji_preview.short_description = ''

    def color_preview(self, obj):
        # Show the class names as a styled snippet
        return format_html(
            '<span style="font-size:11px;background:#f8f8f8;padding:2px 8px;border-radius:6px;'
            'font-family:monospace;color:#555;">{}</span>',
            obj.bg_color,
        )
    color_preview.short_description = 'Colors'


# ── Trust Items ────────────────────────────────────────────────────────────────

class TrustItemAdmin(ModelAdmin):
    list_display = ['order', 'icon_preview', 'text', 'is_active']
    list_editable = ['order', 'text', 'is_active']
    list_display_links = ['icon_preview']
    ordering = ['order']

    def icon_preview(self, obj):
        return format_html('<span style="font-size:24px;">{}</span>', obj.icon)
    icon_preview.short_description = ''


# ── Feature Cards ──────────────────────────────────────────────────────────────

class FeatureCardAdmin(ModelAdmin):
    list_display = ['order', 'icon_preview', 'title', 'description', 'is_active']
    list_editable = ['order', 'title', 'description', 'is_active']
    list_display_links = ['icon_preview']
    ordering = ['order']

    def icon_preview(self, obj):
        return format_html('<span style="font-size:24px;">{}</span>', obj.icon)
    icon_preview.short_description = ''


# ── Store Info (Singleton) ─────────────────────────────────────────────────────

class StoreInfoAdmin(ModelAdmin):
    fieldsets = (
        ('Brand Tagline', {
            'fields': ('tagline',),
        }),
        ('Contact Details', {
            'fields': ('address', 'phone', 'email'),
        }),
        ('Social Links', {
            'fields': ('instagram', 'facebook', 'twitter'),
        }),
    )

    def has_add_permission(self, request):
        # Prevent adding a second record
        return not StoreInfo.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deletion


# ── Footer Links ───────────────────────────────────────────────────────────────

class FooterLinkAdmin(ModelAdmin):
    list_display = ['section_name', 'order', 'label', 'url', 'is_active']
    list_editable = ['order', 'label', 'url', 'is_active']
    list_display_links = ['section_name']
    list_filter = ['section_name', 'is_active']
    ordering = ['section_name', 'order']


# ── Register All ───────────────────────────────────────────────────────────────

yellow_baby_admin.register(HeroSlide, HeroSlideAdmin)
yellow_baby_admin.register(QuickCategory, QuickCategoryAdmin)
yellow_baby_admin.register(AgeGroup, AgeGroupAdmin)
yellow_baby_admin.register(TrustItem, TrustItemAdmin)
yellow_baby_admin.register(FeatureCard, FeatureCardAdmin)
yellow_baby_admin.register(StoreInfo, StoreInfoAdmin)
yellow_baby_admin.register(FooterLink, FooterLinkAdmin)
