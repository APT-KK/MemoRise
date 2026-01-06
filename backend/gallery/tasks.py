from celery import shared_task
from .models import Photo
from PIL import Image, ImageDraw, ImageFont, ExifTags
from io import BytesIO
from django.core.files.base import ContentFile
from django.db import connection
from datetime import datetime
import os

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

@shared_task
def process_photo(photo_id):
    try:
        photo = Photo.objects.get(id=photo_id)

        with Image.open(photo.image) as img:
            
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
                    date_str = str(exif_raw['DateTimeOriginal']).replace('\x00', '')
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
         
            try:
                work_img = img.convert("RGBA")

                # generate thumbnail
                thumb_io = BytesIO()
                thumb_img = work_img.copy() 
                thumb_img.thumbnail((500, 500))
                thumb_img = thumb_img.convert("RGB")
                thumb_img.save(thumb_io, format='JPEG', quality=85)
                try:
                    # We use save=False to defer DB write until the very end
                    photo.thumbnail.save(
                        f"thumb_{os.path.basename(photo.image.name)}",
                        ContentFile(thumb_io.getvalue()),
                        save=False
                    )
                except Exception as thumb_exc:
                    print(f"[Celery] Error saving thumbnail: {thumb_exc}")
                thumb_io.close()

                # generate watermark
                txt_layer = Image.new("RGBA", work_img.size, (255, 255, 255, 0))
                draw = ImageDraw.Draw(txt_layer)
                width, height = work_img.size
                font_size = int(width / 30)
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except IOError:
                    font = ImageFont.load_default()
                text = "© MemoRise"
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                margin = 20
                x = width - text_width - margin
                y = height - text_height - margin
                draw.text((x, y), text, fill=(255, 255, 255, 128), font=font)
                
                # Combine original image with watermark
                watermarked = Image.alpha_composite(work_img, txt_layer)
                final_image = watermarked.convert("RGB")
                
                img_io = BytesIO()
                final_image.save(img_io, format='JPEG', quality=95)
                original_name = photo.image.name
                
                try:
                    photo.image.save(
                        os.path.basename(original_name),
                        ContentFile(img_io.getvalue()),
                        save=False
                    )
                except Exception as img_exc:
                    print(f"[Celery] Error saving image: {img_exc}")
                img_io.close()
                
            except Exception as img_process_exc:
                print(f"[Celery] Error during image processing: {img_process_exc}")

        photo.exif_data = saved_exif
        current_tags = set(photo.manual_tags or [])
        current_tags.update(tags)
        photo.manual_tags = list(current_tags)
        
        photo.is_processed = True
        
        photo.save()

        connection.close()

        return f"Photo {photo_id} processed successfully."
        
    except Photo.DoesNotExist:
        print(f"Photo {photo_id} does not exist.")
        return f"Photo {photo_id} does not exist."
    except Exception as e:
        print(f"[Celery Task Error] {e}")
        raise