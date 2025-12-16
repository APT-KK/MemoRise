from django.urls import path
from .views import RegisterView, UserProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView, # login func
    TokenRefreshView, # refresh token --> to get new access token using refresh token
    TokenBlacklistView # logout func
)
from .views import GoogleLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/<int:id>/', UserProfileView.as_view(), name='user_detail'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-login/',GoogleLoginView.as_view(), name='google_login'),
]
