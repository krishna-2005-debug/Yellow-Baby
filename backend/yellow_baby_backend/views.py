from django.http import JsonResponse
import sys
import traceback

def health(request):
    return JsonResponse({"status": "ok"})

def api_root(request):
    return JsonResponse({
        "name": "Yellow Baby API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "admin":    "/admin/",
            "health":   "/health/",
            "products": "/api/products/",
            "users":    "/api/users/",
            "cart":     "/api/cart/",
            "orders":   "/api/orders/",
            "content":  "/api/content/",
        }
    })

def debug_info(request):
    """Temporary endpoint to diagnose 500 errors in production."""
    try:
        from django.db import connection
        connection.ensure_connection()
        db_ok = True
        db_error = None
    except Exception as e:
        db_ok = False
        db_error = str(e)

    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_count = User.objects.count()
        tables_ok = True
        tables_error = None
    except Exception as e:
        user_count = None
        tables_ok = False
        tables_error = str(e)

    return JsonResponse({
        "db_connected": db_ok,
        "db_error": db_error,
        "tables_ok": tables_ok,
        "tables_error": tables_error,
        "user_count": user_count,
    })
