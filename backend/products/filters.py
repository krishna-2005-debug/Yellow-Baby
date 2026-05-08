"""Custom filters for product catalog."""

import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.NumberFilter(field_name='category__id')
    gender = django_filters.CharFilter(field_name='gender', lookup_expr='iexact')
    age_group = django_filters.CharFilter(field_name='age_group', lookup_expr='iexact')
    size = django_filters.CharFilter(field_name='variants__size', lookup_expr='iexact')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['category', 'gender', 'age_group', 'is_active']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(variants__stock__gt=0).distinct()
        return queryset
