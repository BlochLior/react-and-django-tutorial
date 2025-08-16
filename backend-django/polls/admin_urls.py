from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.admin_create_question, name="admin_create_question"),
    path("", views.admin_dashboard, name="admin_dashboard"),
    path("summary/", views.admin_results_summary, name="summary"),
    path("questions/<int:pk>/", views.admin_question_detail, name="admin_question_detail"),
]