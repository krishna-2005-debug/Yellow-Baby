"""
Content API views — read-only endpoints for all homepage sections.
No authentication required (public content).
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import HeroSlide, QuickCategory, AgeGroup, TrustItem, FeatureCard, StoreInfo, FooterLink
from .serializers import (
    HeroSlideSerializer, QuickCategorySerializer, AgeGroupSerializer,
    TrustItemSerializer, FeatureCardSerializer, StoreInfoSerializer,
    FooterLinkSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def hero_slides(request):
    qs = HeroSlide.objects.filter(is_active=True).order_by('order', 'id')
    return Response(HeroSlideSerializer(qs, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def quick_categories(request):
    qs = QuickCategory.objects.filter(is_active=True).order_by('order', 'id')
    return Response(QuickCategorySerializer(qs, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def age_groups(request):
    qs = AgeGroup.objects.filter(is_active=True).order_by('order', 'id')
    return Response(AgeGroupSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def trust_items(request):
    qs = TrustItem.objects.filter(is_active=True).order_by('order', 'id')
    return Response(TrustItemSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def feature_cards(request):
    qs = FeatureCard.objects.filter(is_active=True).order_by('order', 'id')
    return Response(FeatureCardSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def store_info(request):
    info = StoreInfo.get()
    footer_links = FooterLink.objects.filter(is_active=True).order_by('section_name', 'order', 'id')
    
    data = StoreInfoSerializer(info).data
    data['footer_links'] = FooterLinkSerializer(footer_links, many=True).data
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def all_content(request):
    """Single endpoint that returns all content sections at once — reduces frontend API calls."""
    return Response({
        'hero_slides':      HeroSlideSerializer(HeroSlide.objects.filter(is_active=True).order_by('order', 'id'), many=True, context={'request': request}).data,
        'quick_categories': QuickCategorySerializer(QuickCategory.objects.filter(is_active=True).order_by('order', 'id'), many=True, context={'request': request}).data,
        'age_groups':       AgeGroupSerializer(AgeGroup.objects.filter(is_active=True).order_by('order', 'id'), many=True).data,
        'trust_items':      TrustItemSerializer(TrustItem.objects.filter(is_active=True).order_by('order', 'id'), many=True).data,
        'feature_cards':    FeatureCardSerializer(FeatureCard.objects.filter(is_active=True).order_by('order', 'id'), many=True).data,
        'store_info':       StoreInfoSerializer(StoreInfo.get()).data,
        'footer_links':     FooterLinkSerializer(FooterLink.objects.filter(is_active=True).order_by('section_name', 'order', 'id'), many=True).data,
    })
