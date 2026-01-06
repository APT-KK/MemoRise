from rest_framework import generics, permissions, status
from interactions.models import Comment, Like
from rest_framework.views import APIView
from rest_framework.response import Response
from interactions.serializers import CommentSerializer
from django.shortcuts import get_object_or_404
from gallery.models import Photo

class CommentListCreateView(generics.ListCreateAPIView):
    # queryset = Comment.objects.all()
    # cant do above code as all comments are not needed
    # only comments for a particular photo
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        photo_id = self.kwargs['photo_id']
        return Comment.objects.filter(photo_id=photo_id, parent=None).order_by('-created_at')
    
    def perform_create(self, serializer):
        photo = get_object_or_404(Photo, id=self.kwargs['photo_id'])
        serializer.save(user=self.request.user,photo=photo)

class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, photo_id):
        """ this get method is to fetch total likes count
             and whether user has liked the photo  or not"""
        user = request.user
        photo = get_object_or_404(Photo, id=photo_id)

        is_liked = Like.objects.filter(user=user, photo=photo).exists()
        total_likes = Like.objects.filter(photo=photo).count()

        return Response({
            "liked": is_liked,
            "total_likes": total_likes
        }, status=status.HTTP_200_OK)

    def post(self, request, photo_id):
        user = request.user
        photo = get_object_or_404(Photo, id=photo_id)

        like, created = Like.objects.get_or_create(user=user, photo=photo)
        
        if not created:
            # Like already existed, so remove it (unlike)
            like.delete()
            liked = False
        else:
            liked = True

        total_likes = Like.objects.filter(photo=photo).count()

        return Response({
            "message": "Success",
            "liked": liked,
            "total_likes": total_likes
        }, status=status.HTTP_200_OK)

class CommentLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, comment_id):
        """Fetch total likes and user like status for a specific comment"""
        comment = get_object_or_404(Comment, id=comment_id)
        user = request.user

        is_liked = comment.likes.filter(id=user.id).exists()
        total_likes = comment.likes.count()

        return Response({
            "liked": is_liked,
            "total_likes": total_likes
        }, status=status.HTTP_200_OK)

    def post(self, request, comment_id):
        """Toggle like status"""
        try:
            comment = get_object_or_404(Comment, id=comment_id)
            user = request.user
            
            # Check if user already liked this comment
            if comment.likes.filter(id=user.id).exists():
                comment.likes.remove(user)
                liked = False
            else:
                comment.likes.add(user)
                liked = True

            return Response({
                "message": "Success",
                "liked": liked,
                "total_likes": comment.likes.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)