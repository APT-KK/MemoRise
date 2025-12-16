from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import CustomUserSerializer, RegisterSerializer, FirebaseLoginSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.views import APIView
from rest_framework import status

from firebase_admin import auth as firebase_auth

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

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FirebaseLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token = serializer.validated_data['token']

        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            email = decoded_token.get('email', '')

            user, created = User.objects.get_or_create(email=email)

            if created:
                user.full_name = 'Guest'
                user.role = 'Guest'
                user.is_active = True
                user.set_unusable_password()
                user.save()
            
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'id' : user.id
                }
            },status = status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=400)


    


