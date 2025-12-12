from rest_framework import serializers
from django.contrib.auth import get_user_model

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
    