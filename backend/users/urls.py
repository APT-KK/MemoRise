from django.urls import path
from .views import (
    OmniportCallbackView,
    OmniportLoginView,
    RegisterView, 
    UserProfileView, 
    CurrentUserView,
    CustomTokenObtainPairView,
    ResendOTPView,
    VerifyEmailView,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView, # refresh token --> to get new access token using refresh token
    TokenBlacklistView # logout func
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('users/<int:id>/', UserProfileView.as_view(), name='user_detail'),
    path('users/me/', CurrentUserView.as_view(), name='my_profile'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('omniport/login/', OmniportLoginView.as_view(), name='omniport_login'),
    path('omniport/callback/', OmniportCallbackView.as_view(), name='omniport_callback'),  
]
