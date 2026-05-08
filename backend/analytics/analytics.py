"""Analytics helper functions for the admin dashboard."""

from django.db.models import Sum, Count, F, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta


def get_sales_summary():
    """Returns total sales for today, this week, and this month."""
    from orders.models import Order

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    delivered_orders = Order.objects.filter(status='delivered')

    return {
        'today': delivered_orders.filter(created_at__gte=today_start).aggregate(
            total=Sum('total_amount'), count=Count('id')
        ),
        'this_week': delivered_orders.filter(created_at__gte=week_start).aggregate(
            total=Sum('total_amount'), count=Count('id')
        ),
        'this_month': delivered_orders.filter(created_at__gte=month_start).aggregate(
            total=Sum('total_amount'), count=Count('id')
        ),
        'all_time': delivered_orders.aggregate(
            total=Sum('total_amount'), count=Count('id')
        ),
    }


def get_order_status_distribution():
    """Count of orders grouped by status."""
    from orders.models import Order
    return list(
        Order.objects.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )


def get_top_selling_products(limit=10):
    """Top-selling products by total quantity sold."""
    from orders.models import OrderItem
    return list(
        OrderItem.objects.filter(order__status__in=['pending', 'packed', 'shipped', 'delivered'])
        .values('product_name')
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum(F('price') * F('quantity')))
        .order_by('-total_qty')[:limit]
    )


def get_low_stock_products(threshold=5):
    """Products with total stock below the threshold."""
    from products.models import ProductVariant
    return list(
        ProductVariant.objects.filter(stock__lt=threshold)
        .select_related('product')
        .values('product__name', 'size', 'stock')
        .order_by('stock')
    )


def get_category_wise_sales():
    """Sales broken down by product category."""
    from orders.models import OrderItem
    return list(
        OrderItem.objects.filter(order__status__in=['pending', 'packed', 'shipped', 'delivered'])
        .values(category=F('product__category__name'))
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum(F('price') * F('quantity')))
        .order_by('-total_revenue')
    )
