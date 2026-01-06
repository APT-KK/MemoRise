from .models import Notification
from rest_framework import serializers
from users.serializers import CustomUserSerializer
from gallery.models import Photo
from interactions.models import Comment, Like

class NotificationSerializer(serializers.ModelSerializer):
    # as we need the acting user name as well not just id
    actor = CustomUserSerializer(read_only=True)
    # as no target field exists in db yet
    target = serializers.SerializerMethodField()

    resource_id = serializers.SerializerMethodField()
    resource_type = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
                    'id', 'actor_name', 'message', 'notification_type', 
                    'is_read', 'created_at', 'resource_id', 'resource_type'
                ]

    def get_resource_type(self, obj):
        return obj.content_type.model
    
    def get_resource_id(self, obj):

        if not obj.content_object:
            return None

        if isinstance(obj.content_object, Photo):
            return obj.content_object.id
            
        if isinstance(obj.content_object, Comment):
            return obj.content_object.photo_id
            
        if isinstance(obj.content_object, Like):
            return obj.content_object.photo_id
            
        return None
    
    def get_target(self, obj):
        # Photo target
        if isinstance(obj.content_object, Photo):
            return {
                'type': 'photo',
                'id': obj.content_object.id,
                'title': obj.content_object.description or f"Photo {obj.content_object.id}",
                'image': obj.content_object.image.url if obj.content_object.image else None
            }
        # Comment target
        if isinstance(obj.content_object, Comment):
            return {
                'type': 'comment',
                'id': obj.content_object.id,
                'content': obj.content_object.content,
                'photo_id': obj.content_object.photo.id if obj.content_object.photo else None,
                'user': str(obj.content_object.user)
            }
        # Fallback for unknown types
        return {'type': 'unknown', 'id': obj.object_id}
    