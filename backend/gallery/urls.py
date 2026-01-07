from django.urls import path, include
from .views import PhotoViewSet, AlbumViewSet, EventViewSet, UserSearchView, toggle_public_link, view_shared_album
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'photos', PhotoViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', UserSearchView.as_view(), name='user_search'),
    path('albums/<uuid:share_token>/', view_shared_album, name='view_shared'),
    path('albums/<int:album_id>/share/', toggle_public_link, name='toggle_public_link'),
]
