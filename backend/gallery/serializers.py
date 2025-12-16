from rest_framework import serializers
from gallery.models import Event, Album, Photo


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'
         # user now cannot modify these fields
        read_only_fields = [
            'id',
            'uploaded_at',
            'likes_cnt',
            'download_cnt', 
            'photographer'
        ]

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

                