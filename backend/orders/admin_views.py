"""
Admin REST API views — real data endpoints for the React admin panel.

All endpoints require is_staff=True.

Routes (registered in orders/urls.py + users/urls.py):
  GET  /api/orders/admin/dashboard/     → KPI stats + charts
  GET  /api/orders/admin/               → paginated order list
  PATCH /api/orders/admin/<pk>/         → change order status
  GET  /api/orders/admin/customers/     → user list with order stats
  GET  /api/products/admin/             → product list (all, including inactive)
  PATCH /api/products/admin/<pk>/       → toggle active / update stock
"""

from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework import status

from orders.models import Order, OrderItem, OrderStatusLog
from products.models import Product, ProductVariant
from users.models import User


# ── Permission helper ──────────────────────────────────────────────────────────

def _require_staff(request):
    """Return 403 Response if not staff, else None."""
    if not (request.user.is_authenticated and request.user.is_staff):
        return Response({'message': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    return None


# ── Pagination ─────────────────────────────────────────────────────────────────

class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─────────────────────────────────────────────────────────────────────────────
#  DASHBOARD KPI
# ─────────────────────────────────────────────────────────────────────────────

class AdminDashboardView(APIView):
    """GET /api/orders/admin/dashboard/ — real-time KPI data for admin panel."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = _require_staff(request)
        if err:
            return err

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # ── Core KPIs ─────────────────────────────────────────────────────────
        all_orders = Order.objects.all()

        today_revenue = all_orders.filter(
            created_at__gte=today_start
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        today_count = all_orders.filter(created_at__gte=today_start).count()

        month_revenue = all_orders.filter(
            created_at__gte=month_start
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        month_count = all_orders.filter(created_at__gte=month_start).count()

        all_revenue = all_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        all_count   = all_orders.count()

        product_count = Product.objects.count()
        active_count  = Product.objects.filter(is_active=True).count()
        low_stock     = ProductVariant.objects.filter(stock__gt=0, stock__lte=5).count()
        out_of_stock  = ProductVariant.objects.filter(stock=0).count()

        customer_count = User.objects.filter(is_staff=False).count()
        new_this_week  = User.objects.filter(
            created_at__gte=now - timedelta(days=7), is_staff=False
        ).count()

        # ── Order status breakdown ─────────────────────────────────────────────
        status_breakdown = list(
            all_orders.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        # ── Revenue chart (last 7 days) ────────────────────────────────────────
        revenue_chart = []
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end   = day_start + timedelta(days=1)
            day_revenue = all_orders.filter(
                created_at__gte=day_start,
                created_at__lt=day_end,
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            revenue_chart.append({
                'day': day_start.strftime('%a'),
                'revenue': float(day_revenue),
            })

        # ── Recent orders ──────────────────────────────────────────────────────
        recent_orders = list(
            all_orders.select_related('user')
            .order_by('-created_at')[:10]
            .values(
                'id', 'status', 'payment_method', 'total_amount',
                'created_at', 'user__mobile', 'user__name',
            )
        )
        for o in recent_orders:
            o['total_amount'] = float(o['total_amount'])

        # ── Low stock products ─────────────────────────────────────────────────
        low_stock_products = list(
            ProductVariant.objects.filter(stock__lte=5, stock__gt=0)
            .select_related('product')
            .order_by('stock')[:5]
            .values('product__name', 'size', 'stock', 'product__id')
        )

        return Response({
            'kpis': {
                'today_revenue':   float(today_revenue),
                'today_orders':    today_count,
                'month_revenue':   float(month_revenue),
                'month_orders':    month_count,
                'all_revenue':     float(all_revenue),
                'all_orders':      all_count,
                'products':        product_count,
                'active_products': active_count,
                'low_stock':       low_stock,
                'out_of_stock':    out_of_stock,
                'customers':       customer_count,
                'new_customers_week': new_this_week,
            },
            'order_status': status_breakdown,
            'revenue_chart': revenue_chart,
            'recent_orders': recent_orders,
            'low_stock_products': low_stock_products,
        })


# ─────────────────────────────────────────────────────────────────────────────
#  ORDERS
# ─────────────────────────────────────────────────────────────────────────────

class AdminOrderListView(APIView):
    """GET /api/orders/admin/ — All orders, paginated, with search + filter."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = _require_staff(request)
        if err:
            return err

        qs = Order.objects.select_related('user', 'coupon').prefetch_related('items').order_by('-created_at')

        # Filter by status
        s = request.query_params.get('status')
        if s and s != 'all':
            qs = qs.filter(status=s)

        # Search by order id or mobile
        q = request.query_params.get('search', '').strip()
        if q:
            qs = qs.filter(
                Q(id__icontains=q) | Q(user__mobile__icontains=q) | Q(user__name__icontains=q)
            )

        paginator = AdminPagination()
        page = paginator.paginate_queryset(qs, request)

        data = []
        for o in page:
            data.append({
                'id': o.id,
                'user_mobile':   o.user.mobile,
                'user_name':     o.user.name or '',
                'total_amount':  float(o.total_amount),
                'status':        o.status,
                'payment_method': o.payment_method,
                'payment_status': o.payment_status,
                'items_count':   o.items.count(),
                'coupon_code':   o.coupon.code if o.coupon else None,
                'created_at':    o.created_at.isoformat(),
            })

        return paginator.get_paginated_response(data)


class AdminOrderUpdateView(APIView):
    """PATCH /api/orders/admin/<pk>/ — Update order status."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        err = _require_staff(request)
        if err:
            return err

        order = Order.objects.filter(pk=pk).first()
        if not order:
            return Response({'message': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        valid_statuses = dict(Order.STATUS_CHOICES).keys()
        new_status = request.data.get('status')

        if not new_status:
            return Response({'message': 'status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_status not in valid_statuses:
            return Response(
                {'message': f'Invalid status. Choose from: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status
        order.status = new_status
        order.save(update_fields=['status'])

        OrderStatusLog.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            note=f'Updated by admin ({request.user.mobile})',
        )

        return Response({
            'message': f'Order #{pk} updated: {old_status} → {new_status}',
            'id': pk,
            'status': new_status,
        })


# ─────────────────────────────────────────────────────────────────────────────
#  CUSTOMERS
# ─────────────────────────────────────────────────────────────────────────────

class AdminCustomerListView(APIView):
    """GET /api/users/admin/ — All customers with order stats."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = _require_staff(request)
        if err:
            return err

        qs = (
            User.objects.filter(is_staff=False)
            .annotate(
                total_orders=Count('orders'),
                total_spent=Sum('orders__total_amount'),
            )
            .order_by('-id')
        )

        q = request.query_params.get('search', '').strip()
        if q:
            qs = qs.filter(Q(mobile__icontains=q) | Q(name__icontains=q) | Q(email__icontains=q))

        paginator = AdminPagination()
        page = paginator.paginate_queryset(qs, request)

        data = []
        for u in page:
            data.append({
                'id':           u.id,
                'name':         u.name or '',
                'mobile':       u.mobile,
                'email':        u.email or '',
                'total_orders': u.total_orders or 0,
                'total_spent':  float(u.total_spent or 0),
                'is_active':    u.is_active,
                'joined':       u.created_at.isoformat(),
            })

        return paginator.get_paginated_response(data)


# ─────────────────────────────────────────────────────────────────────────────
#  PRODUCTS (admin)
# ─────────────────────────────────────────────────────────────────────────────

class AdminProductListView(APIView):
    """GET /api/products/admin/ — All products (including inactive)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = _require_staff(request)
        if err:
            return err

        qs = (
            Product.objects.select_related('category')
            .prefetch_related('images', 'variants')
            .order_by('-created_at')
        )

        # Filter
        active = request.query_params.get('is_active')
        if active is not None:
            qs = qs.filter(is_active=active.lower() == 'true')

        low_stock = request.query_params.get('low_stock')
        if low_stock == 'true':
            qs = qs.filter(variants__stock__lte=5, variants__stock__gt=0).distinct()

        q = request.query_params.get('search', '').strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(category__name__icontains=q))

        paginator = AdminPagination()
        page = paginator.paginate_queryset(qs, request)

        data = []
        for p in page:
            images = list(p.images.all())
            primary = next((i for i in images if i.is_primary), None) or (images[0] if images else None)
            image_url = request.build_absolute_uri(primary.image.url) if primary and primary.image else None

            variants = [
                {'id': v.id, 'size': v.size, 'stock': v.stock, 'sku': v.sku}
                for v in p.variants.all()
            ]
            total_stock = sum(v['stock'] for v in variants)

            data.append({
                'id':            p.id,
                'name':          p.name,
                'price':         float(p.price),
                'category':      p.category.name if p.category else None,
                'gender':        p.gender,
                'age_group':     p.age_group,
                'is_active':     p.is_active,
                'primary_image': image_url,
                'total_stock':   total_stock,
                'variants':      variants,
                'created_at':    p.created_at.isoformat(),
            })

        return paginator.get_paginated_response(data)


class AdminProductUpdateView(APIView):
    """PATCH /api/products/admin/<pk>/ — Toggle active, update fields."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        err = _require_staff(request)
        if err:
            return err

        product = Product.objects.filter(pk=pk).first()
        if not product:
            return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        updatable = ['is_active', 'price', 'name', 'description']
        changed = []
        for field in updatable:
            if field in request.data:
                setattr(product, field, request.data[field])
                changed.append(field)

        if changed:
            product.save(update_fields=changed + ['updated_at'])

        return Response({
            'message': f'Product #{pk} updated.',
            'id': pk,
            'is_active': product.is_active,
        })
