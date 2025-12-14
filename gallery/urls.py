from django.urls import path, include
from .views import PhotoViewSet, AlbumViewSet, EventViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r'photos', PhotoViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
