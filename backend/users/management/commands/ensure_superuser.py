"""
Management command: ensure_superuser
Creates a Django superuser from environment variables during deployment.
Set these env vars in Render Dashboard:
  DJANGO_SUPERUSER_PHONE (or DJANGO_SUPERUSER_USERNAME)
  DJANGO_SUPERUSER_PASSWORD
  DJANGO_SUPERUSER_NAME (optional)
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser from environment variables if none exists'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        phone    = os.environ.get('DJANGO_SUPERUSER_PHONE', '')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
        name     = os.environ.get('DJANGO_SUPERUSER_NAME', 'Admin')

        if not phone or not password:
            self.stdout.write(self.style.WARNING(
                'Skipping superuser creation: '
                'DJANGO_SUPERUSER_PHONE or DJANGO_SUPERUSER_PASSWORD not set.'
            ))
            return

        if User.objects.filter(phone=phone).exists():
            self.stdout.write(self.style.SUCCESS(
                f'Superuser already exists for phone={phone}. Skipping.'
            ))
            return

        User.objects.create_superuser(phone=phone, password=password, name=name)
        self.stdout.write(self.style.SUCCESS(
            f'Superuser created successfully: phone={phone}'
        ))
