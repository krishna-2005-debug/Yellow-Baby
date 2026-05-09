"""
Seed script — populate content models with current hardcoded values.
Run: python seed_content.py
"""

import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yellow_baby_backend.settings')
django.setup()

from content.models import HeroSlide, QuickCategory, AgeGroup, TrustItem, FeatureCard, StoreInfo

# ── Hero Slides ────────────────────────────────────────────────────────────────
HeroSlide.objects.all().delete()
HeroSlide.objects.bulk_create([
    HeroSlide(order=1, title='Tiny Styles,\nBig Smiles',    subtitle='Soft, safe clothing made for little explorers',   tag='✨ New Arrivals',       cta_label='Shop New Arrivals', cta_url='/',              bg_from='amber-50', bg_via='yellow-50', bg_to='orange-50', accent_from='yellow-400', accent_to='amber-500',  decor_bg='yellow-100', is_active=True),
    HeroSlide(order=2, title='Pretty Little\nThings',       subtitle='Dresses, frocks & more for your little princess',  tag='💗 Girls\' Collection', cta_label='Shop Girls',        cta_url='/?gender=girls', bg_from='pink-50',  bg_via='rose-50',   bg_to='fuchsia-50',accent_from='pink-400',   accent_to='rose-500',   decor_bg='pink-100',   is_active=True),
    HeroSlide(order=3, title='Adventure\nStarts Here',      subtitle='Cool, comfy fits for active little boys',          tag='💙 Boys\' Collection',  cta_label='Shop Boys',         cta_url='/?gender=boys',  bg_from='sky-50',   bg_via='blue-50',   bg_to='indigo-50', accent_from='blue-400',   accent_to='sky-500',    decor_bg='blue-100',   is_active=True),
])
print('Hero Slides seeded:', HeroSlide.objects.count())

# ── Quick Categories ───────────────────────────────────────────────────────────
QuickCategory.objects.all().delete()
QuickCategory.objects.bulk_create([
    QuickCategory(order=1, label='Dresses',    search_filter='Dresses',     is_active=True),
    QuickCategory(order=2, label='T-Shirts',   search_filter='T-Shirts',    is_active=True),
    QuickCategory(order=3, label='Bottoms',    search_filter='Bottoms',     is_active=True),
    QuickCategory(order=4, label='Winter Wear',search_filter='Winter Wear', is_active=True),
    QuickCategory(order=5, label='Sets',       search_filter='Sets & Combos',is_active=True),
    QuickCategory(order=6, label='Girls',      gender_filter='girls',        is_active=True),
    QuickCategory(order=7, label='Boys',       gender_filter='boys',         is_active=True),
    QuickCategory(order=8, label='Unisex',     gender_filter='unisex',       is_active=True),
])
print('Quick Categories seeded:', QuickCategory.objects.count())

# ── Age Groups ─────────────────────────────────────────────────────────────────
AgeGroup.objects.all().delete()
AgeGroup.objects.bulk_create([
    AgeGroup(order=1, emoji='🍼', label='Newborn',  age_range='0-6M',  bg_color='bg-pink-50 border-pink-100',     text_color='text-pink-700',   is_active=True),
    AgeGroup(order=2, emoji='🐣', label='Infant',   age_range='6-12M', bg_color='bg-yellow-50 border-yellow-100', text_color='text-yellow-700', is_active=True),
    AgeGroup(order=3, emoji='🎠', label='Toddler',  age_range='1-3Y',  bg_color='bg-blue-50 border-blue-100',     text_color='text-blue-700',   is_active=True),
    AgeGroup(order=4, emoji='🚀', label='Kids',     age_range='3-8Y',  bg_color='bg-purple-50 border-purple-100', text_color='text-purple-700', is_active=True),
    AgeGroup(order=5, emoji='⚽', label='Pre-teen', age_range='8-12Y', bg_color='bg-green-50 border-green-100',   text_color='text-green-700',  is_active=True),
])
print('Age Groups seeded:', AgeGroup.objects.count())

# ── Trust Items ────────────────────────────────────────────────────────────────
TrustItem.objects.all().delete()
TrustItem.objects.bulk_create([
    TrustItem(order=1, icon='🚚', text='Free Shipping on ₹499+',        is_active=True),
    TrustItem(order=2, icon='🛡️', text='Safe & Certified Materials',    is_active=True),
    TrustItem(order=3, icon='🔄', text='Easy 7-Day Returns',            is_active=True),
    TrustItem(order=4, icon='📦', text='Packed with Love',              is_active=True),
])
print('Trust Items seeded:', TrustItem.objects.count())

# ── Feature Cards ──────────────────────────────────────────────────────────────
FeatureCard.objects.all().delete()
FeatureCard.objects.bulk_create([
    FeatureCard(order=1, icon='🌿', title='Safe Materials',    description='OEKO-TEX certified soft fabrics',          is_active=True),
    FeatureCard(order=2, icon='✂️', title='Quality Stitching', description='Built to last through every adventure',   is_active=True),
    FeatureCard(order=3, icon='🎨', title='Vibrant Colors',    description='Prints that stay bright, wash after wash', is_active=True),
    FeatureCard(order=4, icon='❤️', title='Made with Love',    description='Every piece designed for comfort',         is_active=True),
])
print('Feature Cards seeded:', FeatureCard.objects.count())

# ── Store Info ─────────────────────────────────────────────────────────────────
StoreInfo.objects.all().delete()
StoreInfo.objects.create(
    pk=1,
    tagline='Dressing little ones with love. Soft, safe, and stylish clothing for babies and kids.',
    address='123, Baby Lane, Chennai, Tamil Nadu, India',
    phone='+91 98765 43210',
    email='hello@yellowbaby.in',
    instagram='#',
    facebook='#',
    twitter='#',
)
print('Store Info seeded:', StoreInfo.objects.count())

print('\nAll content seeded successfully!')
