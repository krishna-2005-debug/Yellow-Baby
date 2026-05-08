from rest_framework import serializers
from .models import HeroSlide, QuickCategory, AgeGroup, TrustItem, FeatureCard, StoreInfo, FooterLink


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = [
            'id', 'title', 'subtitle', 'image', 'tag',
            'cta_label', 'cta_url',
            'bg_from', 'bg_via', 'bg_to',
            'accent_from', 'accent_to', 'decor_bg',
            'order',
        ]


class QuickCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickCategory
        fields = ['id', 'image', 'label', 'search_filter', 'gender_filter', 'order']


class AgeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeGroup
        fields = ['id', 'emoji', 'label', 'age_range', 'bg_color', 'text_color', 'order']


class TrustItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustItem
        fields = ['id', 'icon', 'text', 'order']


class FeatureCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureCard
        fields = ['id', 'icon', 'title', 'description', 'order']


class StoreInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreInfo
        fields = ['tagline', 'address', 'phone', 'email', 'instagram', 'facebook', 'twitter']


class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = ['id', 'section_name', 'label', 'url', 'order']
