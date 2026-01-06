from rest_framework import serializers
from interactions.models import Comment, Like

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.full_name')
    # for replies , we recursively call using this method field
    replies = serializers.SerializerMethodField()
    # likes on a comment
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'replies',
            'photo'
        ]

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
class LikeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'photo'
        ]