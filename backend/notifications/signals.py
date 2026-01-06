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
    group_name = f"notifications_{recipient.id}"

    serializer = NotificationSerializer(notification)
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
    actor = instance.user
    recipient = getattr(photo, 'photographer', None)
    if not recipient or recipient == actor:
        return
    verb = "liked your photo"
    try:
        notification = Notification.objects.create(
            recipient=recipient,
            actor=actor,
            verb=verb,
            content_type=ContentType.objects.get_for_model(Photo),
            object_id=photo.id
        )
        send_socket_message(notification, recipient)
    except Exception as e:
        print(f"Notification error (like): {e}")

@receiver(post_save, sender=Comment)
def notify_on_comment(sender, instance, created, **kwargs):
    if not created:
        return

    photo = instance.photo
    actor = instance.user

    if instance.parent: # reply to a comment
        parent_user = getattr(instance.parent, 'user', None)
        if not parent_user or actor == parent_user:
            return
        try:
            notification = Notification.objects.create(
                recipient=parent_user,
                actor=actor,
                verb="replied to your comment",
                content_type=ContentType.objects.get_for_model(Comment),
                object_id=instance.id
            )
            send_socket_message(notification, parent_user)
        except Exception as e:
            print(f"Notification error (reply): {e}")
    else: # new comment on photo
        recipient = getattr(photo, 'photographer', None)
        if not recipient or recipient == actor:
            return
        try:
            notification = Notification.objects.create(
                recipient=recipient,
                actor=actor,
                verb="commented on your photo",
                content_type=ContentType.objects.get_for_model(Photo),
                object_id=photo.id
            )
            send_socket_message(notification, recipient)
        except Exception as e:
            print(f"Notification error (comment): {e}")
   