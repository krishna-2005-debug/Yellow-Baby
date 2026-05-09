#!/usr/bin/env bash
set -e

echo "==> [1/5] Installing dependencies..."
pip install -r requirements.txt

echo "==> [2/5] Running database migrations..."
python manage.py migrate --noinput

echo "==> [3/5] Collecting static files..."
mkdir -p staticfiles
python manage.py collectstatic --noinput --clear

echo "==> [4/5] Creating superuser (if not exists)..."
python manage.py ensure_superuser

echo "==> [5/5] Build complete!"
