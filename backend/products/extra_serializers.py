"""Serializers for Coupon, Wishlist, and ProductReview."""

from rest_framework import serializers
from .models import Wishlist, ProductReview, Product


class WishlistSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True
    )
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_name', 'product_price', 'primary_image', 'added_at']
        read_only_fields = ['id', 'added_at']

    def get_primary_image(self, obj):
        img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    stars_display = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'user_name', 'rating', 'stars_display',
            'comment', 'is_approved', 'created_at',
        ]
        read_only_fields = ['id', 'user_name', 'stars_display', 'is_approved', 'created_at']

    def get_stars_display(self, obj):
        return obj.stars()

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate(self, data):
        request = self.context.get('request')
        product = data.get('product')
        if request and product:
            # Check if user already reviewed this product
            if ProductReview.objects.filter(user=request.user, product=product).exists():
                raise serializers.ValidationError('You have already reviewed this product.')
        return data
