"""Root URL configuration for Yellow Baby Backend."""

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ── Custom Admin Site ──────────────────────────────────────────────────────────
from django.contrib.auth import views as auth_views
from yellow_baby_backend.admin_site import yellow_baby_admin
from analytics.views import analytics_dashboard
from .views import health, api_root

urlpatterns = [
    path('', api_root),
    path('admin/analytics/', analytics_dashboard, name='analytics-dashboard'),
    
    # Password Reset URLs (needed for admin 'Forgot Password' link)
    path('admin/password_reset/', auth_views.PasswordResetView.as_view(), name='admin_password_reset'),
    path('admin/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    path('admin/', yellow_baby_admin.urls),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/content/', include('content.urls')),
    path('health/', health),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
