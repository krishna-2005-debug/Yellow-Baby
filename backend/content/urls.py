from django.urls import path
from . import views

urlpatterns = [
    path('',                 views.all_content,      name='content-all'),
    path('hero-slides/',     views.hero_slides,       name='content-hero-slides'),
    path('quick-categories/',views.quick_categories,  name='content-quick-categories'),
    path('age-groups/',      views.age_groups,        name='content-age-groups'),
    path('trust-items/',     views.trust_items,       name='content-trust-items'),
    path('feature-cards/',   views.feature_cards,     name='content-feature-cards'),
    path('store-info/',      views.store_info,        name='content-store-info'),
]
