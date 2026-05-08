"""
Content models — admin-managed homepage sections.
Each model has an `order` field (for drag-sort) and `is_active` toggle.
"""

from django.db import models


class HeroSlide(models.Model):
    """Hero banner carousel slides."""
    title       = models.CharField(max_length=120, help_text='Main headline e.g. "Tiny Styles, Big Smiles"')
    subtitle    = models.CharField(max_length=200, blank=True, help_text='Tagline below headline')
    image       = models.ImageField(upload_to='hero_slides/', null=True, blank=True, help_text='Product image for the slide (transparent PNG recommended)')
    tag         = models.CharField(max_length=60, blank=True, help_text='Badge label e.g. "✨ New Arrivals"')
    cta_label   = models.CharField(max_length=60, default='Shop Now', help_text='Button text')
    cta_url     = models.CharField(max_length=200, default='/', help_text='Button link e.g. / or /?gender=girls')
    # Tailwind gradient class names (from/via/to)
    bg_from     = models.CharField(max_length=40, default='amber-50',  help_text='Tailwind color e.g. amber-50')
    bg_via      = models.CharField(max_length=40, default='yellow-50', help_text='Tailwind color')
    bg_to       = models.CharField(max_length=40, default='orange-50', help_text='Tailwind color')
    accent_from = models.CharField(max_length=40, default='yellow-400', help_text='CTA gradient start')
    accent_to   = models.CharField(max_length=40, default='amber-500',  help_text='CTA gradient end')
    decor_bg    = models.CharField(max_length=40, default='yellow-100', help_text='Blob background color')
    order       = models.PositiveSmallIntegerField(default=0, help_text='Display order (lower = first)')
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'

    def __str__(self):
        return self.title


class QuickCategory(models.Model):
    """Quick category shortcut buttons below the hero."""
    image          = models.ImageField(upload_to='quick_categories/', null=True, blank=True, help_text='Category icon or image')
    label          = models.CharField(max_length=40)
    search_filter  = models.CharField(max_length=60, blank=True, help_text='Search term e.g. "Dresses"')
    gender_filter  = models.CharField(max_length=10, blank=True, choices=[
        ('boys', 'Boys'), ('girls', 'Girls'), ('unisex', 'Unisex')
    ], help_text='Gender filter (overrides search_filter)')
    order          = models.PositiveSmallIntegerField(default=0)
    is_active      = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Quick Category'
        verbose_name_plural = 'Quick Categories'

    def __str__(self):
        return f'{self.label}'


class AgeGroup(models.Model):
    """Age group filter cards (Shop by Age)."""
    emoji      = models.CharField(max_length=10, default='🍼')
    label      = models.CharField(max_length=30, help_text='e.g. Newborn')
    age_range  = models.CharField(max_length=20, help_text='e.g. 0-6M')
    bg_color   = models.CharField(max_length=60, default='bg-pink-50 border-pink-100', help_text='Tailwind bg+border classes')
    text_color = models.CharField(max_length=40, default='text-pink-700', help_text='Tailwind text class')
    order      = models.PositiveSmallIntegerField(default=0)
    is_active  = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Age Group'
        verbose_name_plural = 'Age Groups'

    def __str__(self):
        return f'{self.label} ({self.age_range})'


class TrustItem(models.Model):
    """Items in the yellow trust/announcement bar."""
    icon      = models.CharField(max_length=10, default='🚚', help_text='Emoji icon')
    text      = models.CharField(max_length=100, help_text='e.g. "Free Shipping on ₹499+"')
    order     = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Trust Bar Item'
        verbose_name_plural = 'Trust Bar Items'

    def __str__(self):
        return f'{self.icon} {self.text}'


class FeatureCard(models.Model):
    """Feature cards in the "Why Parents Love Us" section."""
    icon        = models.CharField(max_length=10, default='🌿', help_text='Emoji icon')
    title       = models.CharField(max_length=60)
    description = models.CharField(max_length=200)
    order       = models.PositiveSmallIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Feature Card'
        verbose_name_plural = 'Feature Cards'

    def __str__(self):
        return self.title


class StoreInfo(models.Model):
    """
    Singleton model — store contact details and social links used in the footer.
    Only one record should exist (id=1). Admin enforces this.
    """
    tagline    = models.CharField(max_length=200, default='Dressing little ones with love.')
    address    = models.CharField(max_length=300, default='123, Baby Lane, Chennai, Tamil Nadu, India')
    phone      = models.CharField(max_length=30,  default='+91 98765 43210')
    email      = models.EmailField(default='hello@yellowbaby.in')
    instagram  = models.URLField(blank=True, default='#')
    facebook   = models.URLField(blank=True, default='#')
    twitter    = models.URLField(blank=True, default='#')

    class Meta:
        verbose_name = 'Store Info'
        verbose_name_plural = 'Store Info'

    def __str__(self):
        return 'Store Info'

    def save(self, *args, **kwargs):
        self.pk = 1  # Enforce singleton
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # Prevent deletion

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

class FooterLink(models.Model):
    """Links displayed in the footer columns."""
    section_name = models.CharField(max_length=50, help_text='Column name e.g. "Shop" or "Help"')
    label        = models.CharField(max_length=100, help_text='Link text')
    url          = models.CharField(max_length=200, help_text='Link URL e.g. /?gender=boys')
    order        = models.PositiveSmallIntegerField(default=0)
    is_active    = models.BooleanField(default=True)

    class Meta:
        ordering = ['section_name', 'order', 'id']
        verbose_name = 'Footer Link'
        verbose_name_plural = 'Footer Links'

    def __str__(self):
        return f"{self.section_name} - {self.label}"
