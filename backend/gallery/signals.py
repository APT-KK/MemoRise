from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.signals import send_socket_message
from .models import Photo
from .tasks import process_photo
from django.db import transaction
from django.db.models.signals import m2m_changed
from notifications.models import Notification 
from django.contrib.auth import get_user_model
User = get_user_model()

#m2m = many to many relationship & through = intermediate table
@receiver(m2m_changed, sender=Photo.tagged_users.through)
def notify_tagged_users(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add' and pk_set: 

        # pk_set is of user IDs that were just added
        for user_id in pk_set:

            if user_id == instance.photographer.id:
                continue

            notification = Notification.objects.create(
                recipient_id=user_id,
                actor=instance.photographer, 
                verb=f"tagged you in a photo: {getattr(instance.event, 'name', None) or 'Event'}",
                content_object=instance 
            )
            send_socket_message(notification, User.objects.get(id=user_id))

@receiver(post_save, sender=Photo)
def trigger_async_photo_processing(sender, instance, created, **kwargs):
    if created and not instance.is_processed:
        try:
            # this ensures the task runs only after
            # the transaction is committed (in background)
            transaction.on_commit(lambda: process_photo.delay(instance.id))
        except Exception as e:
            print(f"Error triggering async processing for photo {instance.id}: {e}")