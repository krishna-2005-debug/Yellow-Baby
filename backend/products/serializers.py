"""Serializers for product catalog."""

from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'stock', 'sku', 'is_in_stock']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product list view."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'category_name',
            'gender', 'age_group', 'is_active', 'primary_image',
            'total_stock', 'created_at',
        ]

    def get_primary_image(self, obj):
        # Use prefetched cache — avoids N+1 queries
        images = list(obj.images.all())
        primary = next((i for i in images if i.is_primary), None) or (images[0] if images else None)
        if primary:
            request = self.context.get('request')
            return request.build_absolute_uri(primary.image.url) if request else primary.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer with variants and all images."""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category',
            'gender', 'age_group', 'is_active', 'images', 'variants',
            'total_stock', 'created_at', 'updated_at',
        ]
