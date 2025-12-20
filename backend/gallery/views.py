from .models import Photo, Album, Event
from .serializers import PhotoSerializer, AlbumSerializer, EventSerializer
from rest_framework import viewsets, permissions, parsers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

# we use ViewSets as we need CRUD op for these models

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all().order_by('-uploaded_at')
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [
        parsers.MultiPartParser,
        parsers.FormParser,
        parsers.JSONParser
    ]

    #filtering using django-filters
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'album', 'photographer']
    search_fields = ['manual_tags', 'ai_tags', 'exif_data']
    ordering_fields = ['uploaded_at', 'likes_cnt']

    # to construct absolute URL for the image
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(photographer=self.request.user)

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all().order_by('-created_at')
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(coordinator=self.request.user)