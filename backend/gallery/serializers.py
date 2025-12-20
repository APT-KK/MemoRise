from rest_framework import serializers
from gallery.models import Event, Album, Photo
from interactions.models import Like
from django.conf import settings


class PhotoSerializer(serializers.ModelSerializer):
    photographer_email = serializers.ReadOnlyField(source='photographer.email')
    image = serializers.SerializerMethodField()

    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Photo
        fields = '__all__'
        # user now cannot modify these fields
        read_only_fields = [
            'id',
            'uploaded_at',
            'likes_count',
            'download_cnt', 
            'photographer',
            'photographer_email'
        ]
    
    def get_image(self, obj):
        if obj.image:
            return obj.image.url 
        return None
    
    def get_likes_count(self, obj):
        if hasattr(obj, 'likes'):
            return obj.likes.count()
        return obj.like_set.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'likes'):
                return obj.likes.filter(user=request.user).exists()
            return obj.like_set.filter(user=request.user).exists()
        return False 

class AlbumSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.email')
    photos = PhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
        ]

class EventSerializer(serializers.ModelSerializer):
    coordinator = serializers.ReadOnlyField(source='coordinator.email')
    albums = AlbumSerializer(many=True, read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
        ]

                