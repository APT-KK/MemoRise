from .views import mass_delete_photos, toggle_public_photo_link
from .views import PhotoViewSet, AlbumViewSet, EventViewSet, UserSearchView, toggle_public_link, view_shared_album
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()

router.register(r'photos', PhotoViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('photos/<int:photo_id>/share/', toggle_public_photo_link, name='toggle_public_photo_link'),
    path('albums/<uuid:share_token>/', view_shared_album, name='view_shared'),
    path('albums/<int:album_id>/share/', toggle_public_link, name='toggle_public_link'),
    path('search/', UserSearchView.as_view(), name='user_search'),
    path('mass-delete-photos/', mass_delete_photos, name='mass_delete_photos'),
    path('', include(router.urls)),
]
