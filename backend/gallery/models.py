from django.db import models
from django.conf import settings

# event,album,photo models as per the ERD 

class Event(models.Model):

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)

    # event owned by co-ordinator
    coordinator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events',
        limit_choices_to={'role': 'coordinator'} 
        # only users with role coordinator can be assigned in admin panel
    )

    def __str__(self):
        return self.name
    
class Album(models.Model):

    event = models.ForeignKey(
        Event, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='albums'
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='albums'
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.ImageField(upload_to='album_covers/', null=True, blank=True)

    def __str__(self):
        return self.name


class Photo(models.Model):

    event = models.ForeignKey(
        Event, 
        on_delete=models.CASCADE,
        null= True, 
        blank=True, 
        related_name='photos'
    )
    
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='photos'
    )

    image = models.ImageField(upload_to='event_photos/')

    description = models.TextField(blank=True, null=True)

    # owned by a photographer
    photographer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_photos',
        limit_choices_to={'role': 'Photographer'} 
    )

    exif_data = models.JSONField(default=dict, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    likes_cnt = models.IntegerField(default=0)
    download_cnt = models.IntegerField(default=0)

    manual_tags = models.JSONField(default=list, blank=True)
    auto_tags = models.JSONField(default=list, blank=True)
    title = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Photo {self.id} by {self.photographer}"

