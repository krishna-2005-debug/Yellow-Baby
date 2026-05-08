"""API views for authentication and address management."""

import random
from django.conf import settings
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTP, Address
from .serializers import (
    RequestOTPSerializer, VerifyOTPSerializer,
    UserSerializer, AddressSerializer,
)


def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RequestOTPView(APIView):
    """
    POST /api/users/request-otp/
    Send OTP to the provided mobile number.
    In development, OTP is returned in the response (mock mode).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']

        # Invalidate any previous unused OTPs
        OTP.objects.filter(mobile=mobile, is_used=False).update(is_used=True)

        # Generate OTP
        code = settings.OTP_DEV_CODE if settings.OTP_DEV_BYPASS else str(random.randint(100000, 999999))
        OTP.objects.create(mobile=mobile, code=code)

        # In production: send code via SMS gateway here
        response_data = {'message': 'OTP sent successfully.'}
        if settings.OTP_DEV_BYPASS:
            response_data['dev_otp'] = code  # Show OTP in response only in dev

        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/users/verify-otp/
    Verify OTP and return JWT tokens. Creates user if first-time login.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']
        otp_code = serializer.validated_data['otp']

        otp_obj = OTP.objects.filter(mobile=mobile, is_used=False).order_by('-created_at').first()

        if not otp_obj or not otp_obj.is_valid():
            return Response(
                {'message': 'OTP expired or not found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.code != otp_code:
            return Response({'message': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.is_used = True
        otp_obj.save()

        user, created = User.objects.get_or_create(mobile=mobile)
        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Login successful.',
            'is_new_user': created,
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/profile/"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AddressListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/users/addresses/"""
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/users/addresses/<pk>/"""
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
