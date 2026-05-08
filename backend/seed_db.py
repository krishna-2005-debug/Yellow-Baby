import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yellow_baby_backend.settings')
django.setup()

from products.models import Category, Product, ProductVariant

def seed():
    print("Seeding database...")
    Category.objects.all().delete()
    Product.objects.all().delete()

    c1 = Category.objects.create(name='Boys Clothing', slug='boys-clothing')
    c2 = Category.objects.create(name='Girls Clothing', slug='girls-clothing')

    p1 = Product.objects.create(
        category=c1,
        name='Blue Striped T-Shirt',
        description='A comfortable cotton t-shirt for boys.',
        price=Decimal('299.00'),
        gender='boys',
        age_group='1-2Y'
    )
    ProductVariant.objects.create(product=p1, size='S', stock=10)
    ProductVariant.objects.create(product=p1, size='M', stock=5)

    p2 = Product.objects.create(
        category=c2,
        name='Pink Floral Dress',
        description='A beautiful floral dress for girls.',
        price=Decimal('599.00'),
        gender='girls',
        age_group='2-3Y'
    )
    ProductVariant.objects.create(product=p2, size='M', stock=8)
    ProductVariant.objects.create(product=p2, size='L', stock=0)

    print("Database seeded with mock products.")

if __name__ == '__main__':
    seed()
