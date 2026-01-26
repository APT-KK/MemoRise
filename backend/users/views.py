from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, views
from .serializers import (
    CustomUserSerializer,
    RegisterSerializer,
    VerifyEmailSerializer,
    ResendOTPSerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsOwnerOrReadOnly
from .utils import send_otp_email
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import requests


User = get_user_model()

# createAPIView only handles POST requests
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send OTP
        try:
            send_otp_email(user)
        except Exception as e:
            print(f"Email Error: {e}") 

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Registration successful. Check email for OTP.", "user": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = 'id' # default is 'pk' but the url uses 'id'

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user
    
    # deletes old pfp when updating to new one
    def patch(self, request, *args, **kwargs):
        if 'profile_picture' in request.data and request.user.profile_picture:
            request.user.profile_picture.delete(save=False)
        return super().patch(request, *args, **kwargs)
    
    def delete(self, request, *args, **kwargs):
        if request.user.profile_picture:
            request.user.profile_picture.delete(save=True)
            return Response({'message': 'Profile picture removed'}, status=status.HTTP_200_OK)
        return Response({'error': 'No profile picture to remove'}, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['otp']
            user = get_object_or_404(User, email=email)

            if user.is_verified:
                return Response({"message": "Already verified"}, status=status.HTTP_400_BAD_REQUEST)

            # Check OTP using pyotp
            if user.email_otp:
                totp = pyotp.TOTP(user.email_otp, interval=300)
                if totp.verify(code):
                    user.is_verified = True
                    user.save()
                    return Response({"message": "Email verified! Login now."}, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = get_object_or_404(User, email=email)

            if user.is_verified:
                return Response({"message": "Already verified"}, status=status.HTTP_400_BAD_REQUEST)

            send_otp_email(user)
            return Response({"message": "New OTP sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OmniportLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_id = settings.OMNIPORT_CLIENT_ID
        redirect_uri = "http://localhost:5173/oauth/callback"
        oauth_url = f"https://channeli.in/oauth/authorise/?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}"
        return redirect(oauth_url)

class OmniportCallbackView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)

        token_url = "https://channeli.in/open_auth/token/"
        data = {
            'client_id': settings.OMNIPORT_CLIENT_ID,
            'client_secret': settings.OMNIPORT_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': "http://localhost:5173/oauth/callback",
            'code': code,
        }
        # post req to get tokens from callback
        response = requests.post(token_url, data=data) 

        if response.status_code != 200:
            return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)

        access_token_omni = response.json().get('access_token')

        # now we get user data
        user_url = "https://channeli.in/open_auth/get_user_data/"
        headers = {'Authorization': f'Bearer {access_token_omni}'}
        user_response = requests.get(user_url, headers=headers)

        if user_response.status_code != 200:
            return Response({"error": "Failed to fetch user data"}, status=status.HTTP_400_BAD_REQUEST)

        user_data = user_response.json()
        email = user_data.get('contactInformation', {}).get('emailAddress')
        full_name = user_data.get('person', {}).get('fullName') 
            
        if not email:
             return Response({"error": "Could not retrieve email from Omniport"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(email=email)
        if created:
            user.full_name = full_name
            user.is_verified = True
            user.set_unusable_password() # since login is via Omniport
            user.role = "photographer"
            user.save()
        elif not user.role:
            user.role = "photographer"
            user.save()

        # generate JWT tokens for our frontend
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": CustomUserSerializer(user).data
        })
