from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Photo
from PIL import Image, ExifTags
from datetime import datetime
from .tasks import process_photo
from django.db import transaction

def get_clean_exif(img):
    exif_data = {}
    try:
        # _getexif is better than getexif (more information)
        raw_exif = img._getexif() 
        if not raw_exif:
            return {}

        for tag_id, value in raw_exif.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            
            # Skip binary data or massive maker notes
            if tag_name == 'MakerNote' or tag_name == 'UserComment':
                continue
                
            exif_data[tag_name] = value

    except Exception:
        return {}
    return exif_data

# converts (1,60) to 0.01666...
def parse_float(value):
    try:
        if isinstance(value, tuple) and len(value) == 2:
            if value[1] == 0: return 0.0
            return value[0] / value[1]
        return float(value)
    except (ValueError, TypeError, IndexError):
        return 0.0

@receiver(post_save, sender=Photo)
def process_photo_metadata(sender, instance, created, **kwargs):

    if not created or not instance.image:
        return

    try:
        img = Image.open(instance.image.path)
        exif_raw = get_clean_exif(img)
        
        interesting_fields = [
            'Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 
            'FNumber', 'ISOSpeedRatings', 'FocalLength', 'LensModel'
        ]
        
        # key value pairs in dictionary
        saved_exif = {k: str(v) for k, v in exif_raw.items() if k in interesting_fields}
        
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
        if 'Make' in exif_raw:
            tags.append(str(exif_raw['Make']).strip())
        if 'Model' in exif_raw:
            tags.append(str(exif_raw['Model']).strip())

        # shutter speed logic
        if 'ExposureTime' in exif_raw:
            shutter_speed = parse_float(exif_raw['ExposureTime'])
            if shutter_speed > 0:
                if shutter_speed >= 1.0: 
                    tags.append('Long Exposure')
                elif shutter_speed >= 0.1: 
                    tags.append('Slow Shutter')
                elif shutter_speed <= 0.001: 
                    tags.append('Freeze Motion')
                    tags.append('High Speed')

        # Aperture Logic
        if 'FNumber' in exif_raw:
            aperture = parse_float(exif_raw['FNumber'])
            if aperture > 0:
                if aperture <= 2.8:
                    tags.append('Bokeh')
                    tags.append('Shallow Depth of Field')
                    tags.append('Macro')
                elif aperture >= 8.0:
                    tags.append('Deep Depth of Field')
                
        if 'FocalLength' in exif_raw:
            focal_length = parse_float(exif_raw['FocalLength'])
            if focal_length > 0:
                if focal_length <= 24:
                    tags.append('Wide Angle')
                elif focal_length >= 85:
                    tags.append('Telephoto')
                elif 35 <= focal_length <= 50:
                    tags.append('Standard Lens')

        # Lightining logic
        if 'ISOSpeedRatings' in exif_raw:
            try:
                iso_val = exif_raw['ISOSpeedRatings']
                if isinstance(iso_val, (list, tuple)):
                    iso = int(iso_val[0])
                else:
                    iso = int(iso_val)

                if iso >= 1600:
                    tags.append('High ISO')
                    tags.append('Low Light')
                elif iso <= 200:
                    tags.append('Daylight')
            except (ValueError, TypeError):
                pass

        if 'DateTimeOriginal' in exif_raw:
            try:
                # Standard EXIF date format: "YYYY:MM:DD HH:MM:SS"
                date_str = str(exif_raw['DateTimeOriginal'])
                dt = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
                hour = dt.hour
                
                if 5 <= hour < 8:
                    tags.append('Golden Hour')
                    tags.append('Morning')
                elif 8 <= hour < 12:
                    tags.append('Morning')
                elif 12 <= hour < 17:
                    tags.append('Afternoon')
                elif 17 <= hour < 19:
                    tags.append('Golden Hour')
                    tags.append('Sunset')
                elif 19 <= hour < 22:
                    tags.append('Evening')
                else:
                    tags.append('Night')
                    tags.append('Night Photography')
            except ValueError:
                pass

        instance.exif_data = saved_exif
        instance.manual_tags = list(set(tags)) # To remove duplicates
        instance.save(update_fields=['exif_data', 'manual_tags']) 

    except Exception as e:
        print(f"Error processing metadata for photo {instance.id}: {e}")

@receiver(post_save, sender=Photo)
def trigger_async_photo_processing(sender, instance, created, **kwargs):
    if created and not instance.is_processed:
        try:
            # this ensures the task runs only after
            # the transaction is committed (in background)
            transaction.on_commit(lambda: process_photo.delay(instance.id))
        except Exception as e:
            print(f"Error triggering async processing for photo {instance.id}: {e}")