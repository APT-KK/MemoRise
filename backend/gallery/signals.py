from PIL import Image
from PIL.ExifTags import TAGS
from .models import Photo
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Photo)
def extract_exif(sender, instance, created, **kwargs):
     
     if created and instance.image:
         try:
             image = Image.open(instance.image.path)
             exif_raw = image.getexif()

             if exif_raw:
                exif_dict = {}

                for tag_id,value in exif_raw.items():

                    tag_name = TAGS.get(tag_id, tag_id)
                    if tag_name == "MakerNote":
                        continue

                    if isinstance(value, bytes):
                        try:
                            value = value.decode()
                        except UnicodeDecodeError:
                            value = "<binary data>"
                    
                    exif_dict[str(tag_name)] = str(value)

                    Photo.objects.filter(id=instance.id).update(exif_data=exif_dict)
        
         except Exception as e:
             print(f"Error extracting EXIF data: {e}")

