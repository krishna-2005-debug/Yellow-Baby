"""URL routes for the orders app (including coupon validation)."""

from django.urls import path
from .views import (
    CheckoutView, OrderListView, OrderDetailView,
    CancelOrderView, InvoiceDownloadView,
)
from .coupon_views import ValidateCouponView

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('<int:pk>/invoice/', InvoiceDownloadView.as_view(), name='order-invoice'),
]
