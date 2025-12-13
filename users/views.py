from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from .serializers import CustomUserSerializer, RegisterSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken #logout func

User = get_user_model()

# createAPIView only handles POST requests
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveAPIView):




# Create your views here.
