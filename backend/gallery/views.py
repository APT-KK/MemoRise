from .filters import PhotoFilter
from .models import Photo, Album, Event
from .serializers import PhotoSerializer, AlbumSerializer, EventSerializer, UserTagSerializer
from rest_framework import viewsets, permissions, parsers, generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Album
from .ai_utils import generate_tags  
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

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
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PhotoFilter
    ordering_fields = ['uploaded_at', 'likes_cnt']

    # to construct absolute URL for the image
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        album = self.request.data.get('album')
        event = self.request.data.get('event')
        event_instance = None
        # If album is provided then we set event from album
        if album and not event:
            try:
                album_obj = Album.objects.get(pk=album)
                event_instance = album_obj.event
            except Album.DoesNotExist:
                event_instance = None
        elif event:
            try:
                event_instance = Event.objects.get(pk=event)
            except Event.DoesNotExist:
                event_instance = None
        instance = serializer.save(
            photographer=self.request.user,
            event=event_instance
        )

        try:
            tags = generate_tags(instance.image.path)
            if tags:
                instance.auto_tags = tags
                instance.save()
        except Exception as e:
            print(f"Error generating AI tags: {e}")


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all().order_by('-created_at')
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    #filtering using django-filters
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'owner'] # NOW WE CAN DO /api/gallery/albums/?event=1
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(coordinator=self.request.user)

class UserSearchView(generics.ListAPIView):
    serializer_class = UserTagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')

        # optimize: if query len < 2 it doesnt search
        if len(query) < 2:
            return User.objects.none()
        
        return User.objects.filter(
            Q(full_name__icontains=query) |
            Q(email__icontains=query)
        ).distinct()[:10]
        # icontains = insensitive contains (case insensitive)
        # Q is for OR operation
