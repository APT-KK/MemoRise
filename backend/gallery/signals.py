from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Photo
from PIL import Image, ExifTags

@receiver(post_save, sender=Photo)
def process_photo_metadata(sender, instance, created, **kwargs):

    if not created:
        return  

    if not instance.image:
        return

    try:
        img = Image.open(instance.image.path)
        
        exif_data = {}
        info = img.getexif()
        
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                if decoded in ['Make', 'Model', 'DateTime', 'ISOSpeedRatings', 'FNumber', 'ExposureTime']:
                    exif_data[decoded] = str(value)
        
        # auto tags 
        tags = []
        
        # Orientation Logic
        width, height = img.size
        if height > width:
            tags.append('Portrait')
        elif width > height:
            tags.append('Landscape')
        else:
            tags.append('Square')

        # Camera Logic
        if 'Make' in exif_data:
            tags.append(exif_data['Make'])

        # Lighting Logic
        if 'ISOSpeedRatings' in exif_data:
            try:
                iso = int(exif_data['ISOSpeedRatings'])
                if iso > 800:
                    tags.append('Low Light')
                    tags.append('High ISO')
            except ValueError:
                pass

        instance.exif_data = exif_data
        instance.auto_tags = tags
        
        # we update and not create so no infinite loop
        instance.save(update_fields=['exif_data', 'auto_tags'])
        
        print(f"Processed metadata for Photo {instance.id}")

    except Exception as e:
        print(f"Error processing metadata: {e}")