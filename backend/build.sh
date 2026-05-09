#!/usr/bin/env bash
set -e  # Exit on any error

echo "==> Installing dependencies..."
pip install -r requirements.txt

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Creating superuser (if not exists)..."
python manage.py ensure_superuser

echo "==> Build complete!"
