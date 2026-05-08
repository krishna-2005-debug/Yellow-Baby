"""Cart API views."""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
from products.models import ProductVariant


class CartView(APIView):
    """GET /api/cart/ - Retrieve the user's cart."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    """POST /api/cart/add/ - Add item to cart or increment quantity."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        variant_id = serializer.validated_data['product_variant_id']
        quantity = serializer.validated_data['quantity']

        variant = get_object_or_404(ProductVariant, pk=variant_id)

        if not variant.product.is_active:
            return Response({'message': 'Product is not available.'}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product_variant=variant)

        new_quantity = quantity if created else cart_item.quantity + quantity

        if new_quantity > variant.stock:
            return Response(
                {'message': f'Only {variant.stock} units available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = new_quantity
        cart_item.save()

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(
            {'message': 'Item added to cart.', 'cart': cart_serializer.data},
            status=status.HTTP_200_OK,
        )


class UpdateCartItemView(APIView):
    """PUT /api/cart/update/<item_id>/ - Update item quantity."""
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']

        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)

        if quantity > cart_item.product_variant.stock:
            return Response(
                {'message': f'Only {cart_item.product_variant.stock} units available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save()

        cart_serializer = CartSerializer(cart_item.cart, context={'request': request})
        return Response({'message': 'Cart updated.', 'cart': cart_serializer.data})


class RemoveCartItemView(APIView):
    """DELETE /api/cart/remove/<item_id>/ - Remove item from cart."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        cart = cart_item.cart
        cart_item.delete()

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response({'message': 'Item removed from cart.', 'cart': cart_serializer.data})


class ClearCartView(APIView):
    """DELETE /api/cart/clear/ - Clear all items from cart."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})
