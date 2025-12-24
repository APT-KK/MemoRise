from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Photo
from PIL import Image, ExifTags
from datetime import datetime

def get_clean_exif(img):
    """
    Helper to extract and flatten EXIF data into a clean dictionary.
    Handles the messy tuple/fraction formats often returned by PIL.
    """
    exif_data = {}
    try:
        # _getexif is often more populated than getexif for the main camera tags
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

def parse_float(value):
    """
    Safely converts EXIF values (which can be tuples like (1, 60)) to floats.
    Example: (1, 60) becomes 0.01666...
    """
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
        
        # Clean dictionary for DB storage (strings only)
        # We filter for only the most interesting fields to save DB space
        interesting_fields = [
            'Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 
            'FNumber', 'ISOSpeedRatings', 'FocalLength', 'LensModel'
        ]
        
        saved_exif = {k: str(v) for k, v in exif_raw.items() if k in interesting_fields}
        
        tags = []

        # --- 1. ORIENTATION LOGIC ---
        width, height = img.size
        aspect_ratio = width / height
        if aspect_ratio > 1.2:
            tags.append('Landscape')
        elif aspect_ratio < 0.8:
            tags.append('Portrait')
        else:
            tags.append('Square')

        # --- 2. CAMERA & LENS INFO ---
        if 'Make' in exif_raw:
            tags.append(str(exif_raw['Make']).strip())
        if 'Model' in exif_raw:
            tags.append(str(exif_raw['Model']).strip())
            
        # --- 3. EXPOSURE LOGIC (Shutter Speed) ---
        if 'ExposureTime' in exif_raw:
            shutter_speed = parse_float(exif_raw['ExposureTime'])
            if shutter_speed > 0:
                if shutter_speed >= 1.0: 
                    tags.append('Long Exposure')
                elif shutter_speed >= 0.1: # Slower than 1/10th
                    tags.append('Slow Shutter')
                elif shutter_speed <= 0.001: # Faster than 1/1000th
                    tags.append('Freeze Motion')
                    tags.append('High Speed')

        # --- 4. APERTURE LOGIC (Depth of Field) ---
        if 'FNumber' in exif_raw:
            aperture = parse_float(exif_raw['FNumber'])
            if aperture > 0:
                if aperture <= 2.8:
                    tags.append('Bokeh')
                    tags.append('Shallow Depth of Field')
                    tags.append('Macro') # Often implies macro/portrait
                elif aperture >= 8.0:
                    tags.append('Deep Depth of Field')
                
        # --- 5. FOCAL LENGTH LOGIC (Angle of View) ---
        if 'FocalLength' in exif_raw:
            focal_length = parse_float(exif_raw['FocalLength'])
            if focal_length > 0:
                # Assuming 35mm equivalent roughly for logic simplicity
                if focal_length <= 24:
                    tags.append('Wide Angle')
                elif focal_length >= 85:
                    tags.append('Telephoto')
                elif 35 <= focal_length <= 50:
                    tags.append('Standard Lens')

        # --- 6. ISO / LIGHTING LOGIC ---
        if 'ISOSpeedRatings' in exif_raw:
            try:
                # ISO sometimes comes as a list/tuple in rare cases
                iso_val = exif_raw['ISOSpeedRatings']
                if isinstance(iso_val, (list, tuple)):
                    iso = int(iso_val[0])
                else:
                    iso = int(iso_val)

                if iso >= 1600:
                    tags.append('High ISO')
                    tags.append('Low Light')
                elif iso <= 200:
                    tags.append('Daylight') # Usually implies bright conditions
            except (ValueError, TypeError):
                pass

        # --- 7. TIME OF DAY LOGIC ---
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

        # Save updates
        instance.exif_data = saved_exif
        instance.manual_tags = list(set(tags)) # Remove duplicates
        instance.save(update_fields=['exif_data', 'manual_tags'])

    except Exception as e:
        print(f"Error processing metadata for photo {instance.id}: {e}")