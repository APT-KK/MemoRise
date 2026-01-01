from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

CustomUser = get_user_model() # ive defined it in models.py

#for profile view and update profile
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'email', 
            'full_name', 
            'role', 
            'profile_picture', 
            'bio', 
            'is_verified'
        ]
        # user now cannot modify these fields
        read_only_fields = [
            'is_verified',
            'id',
            'role',
            'email'
        ]

    def validate_full_name(self, value):
        user = self.instance
        # If the user exists and their name is NOT 'Guest', they cannot change it.
        if user and user.full_name != 'Guest' and user.full_name != value:
            raise serializers.ValidationError("You have already set your full name and cannot change it again.")
        return value

# When user registers
class RegisterSerializer(serializers.ModelSerializer):
    # write_only => we dont send it as output response
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'full_name', 'password', 'role']

    # over-riding create method to use custom user manager's create_user method
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)

        return user

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()   

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # The default validate() just checks email/password correctness
        data = super().validate(attrs)

        # checking if the user is verified
        if not self.user.is_verified:
            raise AuthenticationFailed("Email is not verified. Please verify your account.")

        data.update({
            'id': self.user.id,
            'role': self.user.role,
            'full_name': self.user.full_name,
            'email': self.user.email,
            'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
        })
        
        return data