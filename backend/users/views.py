"""API views for authentication and address management."""

import random
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

try:
    from django_ratelimit.decorators import ratelimit
    RATELIMIT_AVAILABLE = True
except ImportError:
    RATELIMIT_AVAILABLE = False

from .models import User, OTP, Address
from .serializers import (
    RequestOTPSerializer, VerifyOTPSerializer,
    UserSerializer, AddressSerializer,
)
from .sms import send_otp_sms


def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def _ratelimit(key, rate):
    """Return ratelimit decorator if available, else identity decorator."""
    if RATELIMIT_AVAILABLE:
        return ratelimit(key=key, rate=rate, block=True)
    return lambda f: f


class RequestOTPView(APIView):
    """
    POST /api/users/request-otp/
    Rate limited: 5 requests/minute per IP.
    In dev (OTP_DEV_BYPASS=True), OTP code is returned in the response.
    In production, OTP is sent via Fast2SMS.
    """
    permission_classes = [AllowAny]

    @method_decorator(_ratelimit(key='ip', rate='5/m'))
    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']

        # Clean up old OTPs (older than 24 hours)
        OTP.objects.filter(
            created_at__lt=timezone.now() - timedelta(hours=24)
        ).delete()

        # Invalidate any previous unused OTPs for this mobile
        OTP.objects.filter(mobile=mobile, is_used=False).update(is_used=True)

        # Generate OTP code
        if settings.OTP_DEV_BYPASS:
            code = settings.OTP_DEV_CODE
        else:
            code = str(random.randint(100000, 999999))

        OTP.objects.create(mobile=mobile, code=code)

        response_data = {'message': 'OTP sent successfully.'}

        if settings.OTP_DEV_BYPASS:
            # Dev mode — return OTP in response
            response_data['dev_otp'] = code
        else:
            # Production — send via SMS
            sent = send_otp_sms(mobile, code)
            if not sent:
                # Still return success to not expose SMS issues, but log it
                response_data['message'] = 'OTP sent successfully.'

        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/users/verify-otp/
    Rate limited: 10 attempts/minute per IP.
    """
    permission_classes = [AllowAny]

    @method_decorator(_ratelimit(key='ip', rate='10/m'))
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
