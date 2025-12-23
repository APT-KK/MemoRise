from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from .serializers import CustomUserSerializer, RegisterSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

# createAPIView only handles POST requests
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = 'id' # default is 'pk' but our url uses 'id'

class 


    


