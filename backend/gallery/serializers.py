from rest_framework import serializers
from gallery.models import Event, Album, Photo
from django.contrib.auth import get_user_model

User = get_user_model()

class UserTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']

class PhotoSerializer(serializers.ModelSerializer):
    photographer_email = serializers.ReadOnlyField(source='photographer.email')
    photographer_profile_picture = serializers.SerializerMethodField()

    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    auto_tags = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)

    is_processed = serializers.BooleanField(read_only=True)

    # post response to frontend
    tagged_users_details = UserTagSerializer(source='tagged_users', many=True, read_only=True)
    # get response from frontend
    tagged_user_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=User.objects.all(), 
        source='tagged_users'
    )

    class Meta:
        model = Photo
        fields = [
            'id', 'event', 'album', 'image', 'thumbnail', 'is_processed', 'description',
            'photographer', 'photographer_email', 'photographer_profile_picture', 'exif_data', 'uploaded_at', 'updated_at', 'likes_cnt',
            'download_cnt', 'manual_tags', 'auto_tags', 'title', 'is_liked', 'likes_count',
            'tagged_users_details', 'tagged_user_ids'
        ]
        read_only_fields = [
            'id',
            'uploaded_at',
            'updated_at',
            'likes_count',
            'download_cnt', 
            'photographer',
            'photographer_email',
            'is_processed'  
        ]

    def get_auto_tags(self, obj):
        return obj.auto_tags if obj.auto_tags is not None else []

    def get_photographer_profile_picture(self, obj):
        if obj.photographer and obj.photographer.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photographer.profile_picture.url)
            return obj.photographer.profile_picture.url
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
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
        ]

    def get_photos(self, obj):
        # DEBUG:Always fetch the latest photos for this album, force fresh DB read
        photos_qs = obj.photos.all().order_by('-uploaded_at').iterator()
        return PhotoSerializer(list(photos_qs), many=True, context=self.context).data

class EventSerializer(serializers.ModelSerializer):
    coordinator = serializers.ReadOnlyField(source='coordinator.email')
    albums = AlbumSerializer(many=True, read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
        ]

    def get_photos(self, obj):
        photos_qs = obj.photos.all().order_by('-uploaded_at')
        return PhotoSerializer(photos_qs, many=True, context=self.context).data


                