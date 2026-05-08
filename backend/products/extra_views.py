"""Wishlist and ProductReview API views."""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Wishlist, ProductReview, Product
from .extra_serializers import WishlistSerializer, ProductReviewSerializer


# ── Wishlist ───────────────────────────────────────────────────────────────────

class WishlistView(generics.ListAPIView):
    """GET /api/products/wishlist/ — View user's wishlist."""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')


class WishlistToggleView(APIView):
    """
    POST /api/products/wishlist/toggle/
    Body: { "product_id": <int> }
    Adds if not present, removes if already wishlisted. Returns current state.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'message': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id, is_active=True)
        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)

        if not created:
            item.delete()
            return Response({'message': 'Removed from wishlist.', 'wishlisted': False})

        return Response({'message': 'Added to wishlist.', 'wishlisted': True}, status=status.HTTP_201_CREATED)


class WishlistStatusView(APIView):
    """GET /api/products/wishlist/status/<product_id>/ — Check if product is wishlisted."""
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        wishlisted = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({'product_id': product_id, 'wishlisted': wishlisted})


# ── Reviews ────────────────────────────────────────────────────────────────────

class ProductReviewListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/products/<product_id>/reviews/  — List approved reviews
    POST /api/products/<product_id>/reviews/  — Submit a review (auth required)
    """
    serializer_class = ProductReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return []

    def get_queryset(self):
        return ProductReview.objects.filter(
            product_id=self.kwargs['product_id'],
            is_approved=True,
        )

    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs['product_id'])
        serializer.save(user=self.request.user, product=product)
