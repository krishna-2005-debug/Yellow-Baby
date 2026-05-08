"""Analytics views — enhanced data for chart.js dashboard."""

import json
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .analytics import (
    get_sales_summary,
    get_order_status_distribution,
    get_top_selling_products,
    get_low_stock_products,
    get_category_wise_sales,
)


def get_daily_revenue_chart(days=14):
    """Revenue per day for the last N days."""
    from orders.models import Order
    start = timezone.now() - timedelta(days=days)
    qs = (
        Order.objects.filter(created_at__gte=start, status='delivered')
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(revenue=Sum('total_amount'), count=Count('id'))
        .order_by('day')
    )
    data = {str(r['day']): {'revenue': float(r['revenue'] or 0), 'count': r['count']} for r in qs}
    labels, revenues, counts = [], [], []
    for i in range(days):
        day = (timezone.now() - timedelta(days=days - 1 - i)).date()
        day_str = str(day)
        labels.append(day.strftime('%b %d'))
        revenues.append(data.get(day_str, {}).get('revenue', 0))
        counts.append(data.get(day_str, {}).get('count', 0))
    return {'labels': labels, 'revenues': revenues, 'counts': counts}


@staff_member_required
def analytics_dashboard(request):
    order_status = get_order_status_distribution()
    top_products = get_top_selling_products(10)
    category_sales = get_category_wise_sales()
    daily_chart = get_daily_revenue_chart(14)

    context = {
        'title': 'Analytics Dashboard',
        'sales': get_sales_summary(),
        'order_status': order_status,
        'top_products': top_products,
        'low_stock': get_low_stock_products(5),
        'category_sales': category_sales,
        # JSON for charts
        'daily_labels_json': json.dumps(daily_chart['labels']),
        'daily_revenues_json': json.dumps(daily_chart['revenues']),
        'daily_counts_json': json.dumps(daily_chart['counts']),
        'status_labels_json': json.dumps([r['status'].title() for r in order_status]),
        'status_counts_json': json.dumps([r['count'] for r in order_status]),
        'top_product_labels_json': json.dumps([p['product_name'][:20] for p in top_products]),
        'top_product_qty_json': json.dumps([p['total_qty'] for p in top_products]),
        'cat_labels_json': json.dumps([c['category'] or 'Uncategorized' for c in category_sales]),
        'cat_revenue_json': json.dumps([float(c['total_revenue'] or 0) for c in category_sales]),
    }
    return render(request, 'analytics/dashboard.html', context)
