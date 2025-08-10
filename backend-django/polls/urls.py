from django.urls import path

from . import views

app_name = 'polls'
urlpatterns = [
    path('', views.client_poll_list, name='client_poll_list'),
    path('<int:pk>/', views.client_poll_detail, name='client_poll_detail'),
    path('vote/', views.vote, name='vote'),


    # hereon are old urls, will delete after i finish updating all
    # path('api/questions/', views.question_list_api, name='question_list_api'),
    # path('api/questions/<int:pk>/', views.question_detail_api, name='question_detail_api'),
    # path('api/questions/<int:pk>/vote/', views.vote_api, name='vote_api'),
]
