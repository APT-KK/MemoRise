from django.urls import path
from .views import CommentListCreateView, LikeToggleView

urlpatterns = [
    path('photos/<int:photo_id>/comments/', CommentListCreateView.as_view(), name='photo-comments'),
    path('photos/<int:photo_id>/like/', LikeToggleView.as_view(), name='photo-like'),
]