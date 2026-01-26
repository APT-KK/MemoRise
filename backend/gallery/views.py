import os
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from grpc import Status
from rest_framework.response import Response
from .filters import PhotoFilter
from .models import Photo, Album, Event
from .serializers import PhotoSerializer, AlbumSerializer, EventSerializer, PublicAlbumSerializer, UserTagSerializer, PublicPhotoShareSerializer
from rest_framework import viewsets, permissions, parsers, generics
from .permissions import IsEventCoordinatorOrAdmin, CanUploadPhotoOrCreateAlbum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Album
from .ai_utils import generate_tags  
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.decorators import action, permission_classes, api_view

User = get_user_model()

# we use ViewSets as we need CRUD op for these models

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all().order_by('-uploaded_at')
    serializer_class = PhotoSerializer
    parser_classes = [
        parsers.MultiPartParser,
        parsers.FormParser,
        parsers.JSONParser
    ]

    def get_permissions(self):
        if self.action == 'create':
            return [CanUploadPhotoOrCreateAlbum()]
        return [permissions.IsAuthenticated()]

    #filtering using django-filters
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PhotoFilter
    ordering_fields = ['uploaded_at', 'likes_cnt']

    def get_queryset(self):
        queryset = Photo.objects.all().order_by('-uploaded_at')
        return queryset.select_related('photographer', 'event', 'album')

    # to construct absolute URL for the image
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        photo = self.get_object()
        
        if not photo.image or not os.path.exists(photo.image.path):
            return Response({"error": "File not found"}, status=404)

        file_handle = open(photo.image.path, 'rb')
        filename = os.path.basename(photo.image.name)

        # as_attachment auto adds Content-Disposition: attachment header for download
        response = FileResponse(file_handle, as_attachment=True, filename=filename)
        return response

    def perform_create(self, serializer):
        album = self.request.data.get('album')
        event = self.request.data.get('event')
        event_instance = None
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

    def perform_update(self, serializer):
        # Only allow owner/photographer to update tagged users
        photo = self.get_object()
        if 'tagged_user_ids' in self.request.data:
            if photo.photographer != self.request.user:
                raise PermissionError("Only the owner/photographer can tag users in this photo.")
        serializer.save()

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all().order_by('-created_at')
    serializer_class = AlbumSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [CanUploadPhotoOrCreateAlbum()]
        return [permissions.IsAuthenticated()]

    #filtering using django-filters
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'owner'] # NOW WE CAN DO /api/gallery/albums/?event=1
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsEventCoordinatorOrAdmin()]
        return [permissions.IsAuthenticated()]

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

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def view_shared_album(request,share_token):
        
    album = get_object_or_404(Album, share_token=share_token)

    if not album.is_public:
        return Response({"error": "Album is not public"}, status=403)
    
    serializer = PublicAlbumSerializer(album, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_public_link(request,album_id):
    album = get_object_or_404(Album, id=album_id, owner=request.user)

    album.is_public = not album.is_public
    album.save()

    return Response({
        "is_public": album.is_public,
        "share_token": str(album.share_token) if album.is_public else None,
        "full_url": f"http://localhost:8000/share/{album.share_token}" if album.is_public else None
    })

from django.shortcuts import render

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def view_shared_photo(request, share_token):
    photo = get_object_or_404(Photo, share_token=share_token)
    if not photo.is_public:
        return render(request, 'shared_photo.html', {'error': 'Photo is not public'}, status=403)
    return render(request, 'shared_photo.html', {'photo': photo})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_public_photo_link(request, photo_id):
    photo = get_object_or_404(Photo, id=photo_id, photographer=request.user)
    photo.is_public = not photo.is_public
    photo.save()
    return Response({
        "is_public": photo.is_public,
        "share_token": str(photo.share_token) if photo.is_public else None,
        "full_url": f"http://localhost:8000/share/photos/{photo.share_token}" if photo.is_public else None
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsEventCoordinatorOrAdmin])
def mass_delete_photos(request):
    ids = request.data.get('ids', [])

    if not isinstance(ids, list):
        return Response({'detail': 'Invalid data.'}, status=Status.HTTP_400_BAD_REQUEST)
    
    Photo.objects.filter(id__in=ids).delete()
    return Response({'detail': 'Deleted successfully.'}, status=Status.HTTP_200_OK)