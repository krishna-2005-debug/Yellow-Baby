"""URL routes for the orders app."""

from django.urls import path
from .views import (
    CheckoutView, OrderListView, OrderDetailView,
    CancelOrderView, InvoiceDownloadView,
)
from .coupon_views import ValidateCouponView
from .payment_views import CreateRazorpayOrderView, VerifyRazorpayPaymentView
from .admin_views import AdminDashboardView, AdminOrderListView, AdminOrderUpdateView

urlpatterns = [
    # ── Customer endpoints ─────────────────────────────────────────────────────
    path('', OrderListView.as_view(), name='order-list'),
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('<int:pk>/invoice/', InvoiceDownloadView.as_view(), name='order-invoice'),

    # ── Razorpay payment ───────────────────────────────────────────────────────
    path('payment/create-order/', CreateRazorpayOrderView.as_view(), name='payment-create-order'),
    path('payment/verify/', VerifyRazorpayPaymentView.as_view(), name='payment-verify'),

    # ── Admin APIs ─────────────────────────────────────────────────────────────
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderUpdateView.as_view(), name='admin-order-update'),
]
