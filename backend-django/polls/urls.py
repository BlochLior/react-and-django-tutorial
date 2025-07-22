from django.urls import path

from . import views

app_name = 'polls'
urlpatterns = [
    path('api/questions/', views.question_list_api, name='question_list_api'),
    path('api/questions/<int:pk>/', views.question_detail_api, name='question_detail_api'),
    path('api/questions/<int:pk>/vote/', views.vote_api, name='vote_api'),
]
