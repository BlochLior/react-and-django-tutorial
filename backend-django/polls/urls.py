from django.urls import path

from . import views

app_name = 'polls'
urlpatterns = [
    path('', views.client_poll_list, name='client_poll_list'),
    # TODO: the client_poll_detail url might not be used in the frontend.
    path('<int:pk>/', views.client_poll_detail, name='client_poll_detail'),
    path('vote/', views.vote, name='vote'),
    path('user-votes/', views.user_votes, name='user_votes'),
    path('admin-user-management/', views.admin_user_management, name='admin_user_management'),
    path('poll-closure/', views.poll_closure, name='poll_closure'),
    path('debug-users/', views.debug_users, name='debug_users'),
    path('fix-user-profile/', views.fix_user_profile, name='fix_user_profile'),
    path('test-logout/', views.test_logout, name='test_logout'),
]
