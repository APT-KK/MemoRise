from models import Notification
from rest_framework import serializers
from users.serializers import CustomUserSerializer
from gallery.models import Photo

class NotificationSerializer(serializers.ModelSerializer):
    # as we need the acting user name as well not just id
    actor = CustomUserSerializer(read_only=True)
    # as no target exists in db yet
    target = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'content_object', 'is_read', 'created_at']
    
    def get_target(self, obj):
        if(isinstance(obj.content_object, Photo)):
            return {
                'type': 'photo',
                'id': obj.content_object.id,
                'title': obj.content_object.title,
                'image_url': obj.content_object.image.url if obj.content_object.image else None
            }
        return {'type': 'unknown', 'id': obj.object_id}
    