"""API views for the product catalog."""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Category, Product
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer
from .filters import ProductFilter


class CategoryListView(generics.ListAPIView):
    """GET /api/products/categories/"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Supports: filtering (category, gender, age_group, size, price range, in_stock),
              search (name), ordering (price, -price, created_at).
    """
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants')


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/<id>/"""
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants')
