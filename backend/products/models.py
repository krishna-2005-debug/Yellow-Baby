"""Product models: Category, Product, ProductVariant, ProductImage, Wishlist, ProductReview."""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.html import format_html


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    GENDER_CHOICES = [
        ('boys', 'Boys'),
        ('girls', 'Girls'),
        ('unisex', 'Unisex'),
    ]
    AGE_GROUP_CHOICES = [
        ('0-1Y', '0-1 Year'),
        ('1-2Y', '1-2 Years'),
        ('2-3Y', '2-3 Years'),
        ('3-5Y', '3-5 Years'),
        ('5-7Y', '5-7 Years'),
        ('7-10Y', '7-10 Years'),
        ('10+Y', '10+ Years'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def primary_image(self):
        img = self.images.first()
        return img.image.url if img else None

    @property
    def total_stock(self):
        return sum(v.stock for v in self.variants.all())


class ProductVariant(models.Model):
    SIZE_CHOICES = [
        ('XS', 'XS'), ('S', 'S'), ('M', 'M'), ('L', 'L'),
        ('XL', 'XL'), ('XXL', 'XXL'),
        ('0-3M', '0-3 Months'), ('3-6M', '3-6 Months'),
        ('6-12M', '6-12 Months'), ('12-18M', '12-18 Months'),
        ('18-24M', '18-24 Months'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, blank=True, unique=True, null=True)

    class Meta:
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
        unique_together = ['product', 'size']
        ordering = ['size']

    def __str__(self):
        return f"{self.product.name} - {self.size} (Stock: {self.stock})"

    @property
    def is_in_stock(self):
        return self.stock > 0


def product_image_upload_path(instance, filename):
    return f'products/{instance.product.id}/{filename}'


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=product_image_upload_path)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.product.name}"

    def image_preview(self):
        if self.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover;border-radius:4px;" />', self.image.url)
        return '-'
    image_preview.short_description = 'Preview'


class Wishlist(models.Model):
    """Per-user wishlist of products."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = ['user', 'product']
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user} ♥ {self.product.name}"


class ProductReview(models.Model):
    """Customer review and rating for a product."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Product Review'
        verbose_name_plural = 'Product Reviews'
        unique_together = ['user', 'product']   # One review per product per user
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} — {self.product.name} ({self.rating}★)"

    def stars(self):
        return '★' * self.rating + '☆' * (5 - self.rating)
