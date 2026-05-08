"""Custom Django Admin Site for Yellow Baby with live stats on every page."""

from django.contrib.admin import AdminSite
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta


class YellowBabyAdminSite(AdminSite):
    site_header = '🍼 Yellow Baby Admin'
    site_title = 'Yellow Baby Admin Portal'
    index_title = 'Dashboard'

    def _get_dashboard_stats(self):
        """Fetch key metrics to inject into admin context."""
        try:
            from orders.models import Order
            from products.models import Product, ProductVariant
            from content.models import HeroSlide, QuickCategory, AgeGroup, TrustItem, FeatureCard, StoreInfo

            now = timezone.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            delivered = Order.objects.filter(status='delivered')
            all_orders = Order.objects.all()

            # Recent orders (last 8)
            recent_orders = list(
                all_orders.order_by('-created_at')
                .values('id', 'user__mobile', 'total_amount', 'status')[:8]
            )

            # Low stock (< 5)
            low_stock = list(
                ProductVariant.objects.filter(stock__lt=5)
                .select_related('product')
                .values('product__name', 'size', 'stock')
                .order_by('stock')[:8]
            )

            return {
                'sales': {
                    'today': delivered.filter(created_at__gte=today_start).aggregate(
                        total=Sum('total_amount'), count=Count('id')
                    ),
                    'this_month': delivered.filter(created_at__gte=month_start).aggregate(
                        total=Sum('total_amount'), count=Count('id')
                    ),
                    'all_time': delivered.aggregate(
                        total=Sum('total_amount'), count=Count('id')
                    ),
                },
                'recent_orders': recent_orders,
                'low_stock': low_stock,
                'low_stock_count': ProductVariant.objects.filter(stock__lt=5).count(),
                'total_products': Product.objects.count(),
                'active_products': Product.objects.filter(is_active=True).count(),
                'content_stats': {
                    'hero_slides': HeroSlide.objects.filter(is_active=True).count(),
                    'categories': QuickCategory.objects.filter(is_active=True).count(),
                    'age_groups': AgeGroup.objects.filter(is_active=True).count(),
                    'trust_items': TrustItem.objects.filter(is_active=True).count(),
                    'features': FeatureCard.objects.filter(is_active=True).count(),
                }
            }
        except Exception:
            return {}

    def each_context(self, request):
        context = super().each_context(request)
        if request.user.is_authenticated and request.user.is_staff:
            context['stats'] = self._get_dashboard_stats()
        return context


# Singleton instance — used in urls.py instead of default admin.site
yellow_baby_admin = YellowBabyAdminSite(name='admin')
