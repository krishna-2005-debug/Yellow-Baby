"""URL routes for the users app."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RequestOTPView, VerifyOTPView,
    UserProfileView,
    AddressListCreateView, AddressDetailView,
)
from orders.admin_views import AdminCustomerListView

urlpatterns = [
    # ── Authentication ─────────────────────────────────────────────────────────
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # ── Profile ────────────────────────────────────────────────────────────────
    path('profile/', UserProfileView.as_view(), name='user-profile'),

    # ── Addresses ──────────────────────────────────────────────────────────────
    path('addresses/', AddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),

    # ── Admin ──────────────────────────────────────────────────────────────────
    path('admin/', AdminCustomerListView.as_view(), name='admin-customer-list'),
]
