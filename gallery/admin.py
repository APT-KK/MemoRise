from django.contrib import admin
from .models import Event, Album, Photo

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'date', 'location', 'coordinator', 'created_at']
    search_fields = ('name', 'location')
    ordering = ['-date']

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'event', 'owner', 'created_at']
    list_filter = ('event', 'owner')
    ordering = ['-created_at']

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'album', 'event', 'uploaded_by', 'uploaded_at']
    list_filter = ('event', 'album', 'photographer')
    ordering = ['-uploaded_at']
