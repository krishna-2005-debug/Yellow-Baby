"""Root URL configuration for Yellow Baby Backend."""

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ── Custom Admin Site ──────────────────────────────────────────────────────────
from yellow_baby_backend.admin_site import yellow_baby_admin
from analytics.views import analytics_dashboard
from .views import health

urlpatterns = [
    # Analytics dashboard MUST come before admin/ so it isn't swallowed
    path('admin/analytics/', analytics_dashboard, name='analytics-dashboard'),
    path('admin/', yellow_baby_admin.urls),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/content/', include('content.urls')),
    path('health/', health),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
