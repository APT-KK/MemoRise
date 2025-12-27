from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync # sync django calls async channels
from channels.layers import get_channel_layer # to access redis layer
from django.contrib.contenttypes.models import ContentType
from .serializers import NotificationSerializer
from .models import Notification
from gallery.models import Photo
from interactions.models import Like, Comment

def send_socket_message(notification,recipient):
    channel_layer = get_channel_layer()
    group_name = f'notifications_{recipient.id}'

    serializer = NotificationSerializer(notification).data
    data = serializer.data

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification', # maps to the method in consumers.py
            'message': data
        }
    )

@receiver(post_save, sender=Like)
def notify_on_like(sender, instance, created, **kwargs):
    if not created:
        return

    photo = instance.photo
    recipient = photo.photographer
    actor = instance.user

    if recipient == actor:
        return

    verb = "liked your photo"
    notification = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        content_type=ContentType.objects.get_for_model(Photo),
        object_id=photo.id
    )

    send_socket_message(notification, recipient)

@receiver(post_save, sender=Comment)
def notify_on_comment(sender, instance, created, **kwargs):
    if not created:
        return

    photo = instance.photo
    actor = instance.user

    if instance.parent: #reply to a comment
        if actor == instance.parent.user:
            return
        notification = Notification.objects.create(
                    recipient=instance.parent.user,
                    actor=actor,
                    verb="replied to your comment",
                    content_type=ContentType.objects.get_for_model(Comment),
                    object_id=instance.id,
                    content_object=instance
                )
        send_socket_message(notification, instance.parent.user)
    else: # new comment on photo
        recipient = photo.photographer
        if recipient == actor:
            return
        notification = Notification.objects.create(
                    recipient=recipient,
                    actor=actor,
                    verb="commented on your photo",
                    content_type=ContentType.objects.get_for_model(Photo),
                    object_id=photo.id,
                    content_object=instance
                )
        send_socket_message(notification, recipient)
   