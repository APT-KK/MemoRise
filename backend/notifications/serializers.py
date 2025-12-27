from .models import Notification
from rest_framework import serializers
from users.serializers import CustomUserSerializer
from gallery.models import Photo
from interactions.models import Comment

class NotificationSerializer(serializers.ModelSerializer):
    # as we need the acting user name as well not just id
    actor = CustomUserSerializer(read_only=True)
    # as no target exists in db yet
    target = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'is_read', 'created_at', 'target']

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
    