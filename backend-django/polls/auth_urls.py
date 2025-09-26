from django.urls import path
from . import views

urlpatterns = [
    path("user-info/", views.user_info, name="user_info"),
    path("admin-stats/", views.admin_stats, name="admin_stats"),
    path("logout/", views.logout_view, name="logout"),
]
