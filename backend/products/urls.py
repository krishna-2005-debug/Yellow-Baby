"""URL routes for the products app (including wishlist and reviews)."""

from django.urls import path
from .views import CategoryListView, ProductListView, ProductDetailView
from .extra_views import (
    WishlistView, WishlistToggleView, WishlistStatusView,
    ProductReviewListCreateView,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/toggle/', WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('wishlist/status/<int:product_id>/', WishlistStatusView.as_view(), name='wishlist-status'),
    # Reviews
    path('<int:product_id>/reviews/', ProductReviewListCreateView.as_view(), name='product-reviews'),
]
