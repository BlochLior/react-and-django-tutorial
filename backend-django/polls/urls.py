from django.urls import path

from . import views

app_name = 'polls'
urlpatterns = [
    path('', views.client_poll_list, name='client_poll_list'),
    path('<int:pk>/', views.client_poll_detail, name='client_poll_detail'),
    path('vote/', views.vote, name='vote'),
]
