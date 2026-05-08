"""Analytics admin — adds a custom dashboard link to the admin sidebar."""

from django.contrib import admin
from django.urls import path
from .views import analytics_dashboard


class AnalyticsDashboardAdmin(admin.ModelAdmin):
    pass


# Register a custom admin URL
class AnalyticsAdminSite(admin.AdminSite):
    pass


def get_analytics_urls():
    return [
        path('analytics/dashboard/', analytics_dashboard, name='analytics-dashboard'),
    ]
