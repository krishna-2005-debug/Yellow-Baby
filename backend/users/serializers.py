"""Serializers for Users, OTP, and Address."""

import re
from rest_framework import serializers
from .models import User, OTP, Address


class RequestOTPSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)

    def validate_mobile(self, value):
        if not re.match(r'^\+?[1-9]\d{9,14}$', value):
            raise serializers.ValidationError('Enter a valid mobile number.')
        return value


class VerifyOTPSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_mobile(self, value):
        if not re.match(r'^\+?[1-9]\d{9,14}$', value):
            raise serializers.ValidationError('Enter a valid mobile number.')
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'mobile', 'name', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'mobile', 'role', 'is_active', 'created_at']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'phone', 'address_line',
            'city', 'state', 'pincode', 'is_default', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_phone(self, value):
        if not re.match(r'^\+?[1-9]\d{9,14}$', value):
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate_pincode(self, value):
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError('Pincode must be 6 digits.')
        return value
