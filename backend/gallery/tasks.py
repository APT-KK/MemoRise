from celery import shared_task
from .models import Photo
from PIL import Image, ImageDraw, ImageFont, ExifTags
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils import timezone  
import os
import logging
import time

logger = logging.getLogger(__name__)

def get_clean_exif(img):
    exif_data = {}
    try:
        raw_exif = img._getexif() 
        if not raw_exif: return {}
        for tag_id, value in raw_exif.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            if tag_name in ['MakerNote', 'UserComment']: continue
            exif_data[tag_name] = value
    except Exception:
        return {}
    return exif_data

# converts 1/6 into 0.1666
def parse_float(value):
    try:
        if isinstance(value, tuple) and len(value) == 2:
            if value[1] == 0: return 0.0
            return value[0] / value[1]
        return float(value)
    except (ValueError, TypeError, IndexError):
        return 0.0

@shared_task(bind=True, max_retries=3)
def process_photo(self, photo_id):
    try:
        time.sleep(2) # to handle race conditions on very fast saves

        logger.info(f"Processing photo_id: {photo_id}")
        photo = Photo.objects.get(id=photo_id)

        file_buffer = BytesIO()
        try:
            with photo.image.open('rb') as f:
                file_buffer.write(f.read())
        except Exception as e:
            logger.error(f"Could not read file: {e}")
            raise
        
        file_buffer.seek(0)
        
        with Image.open(file_buffer) as img:
            
            exif_raw = get_clean_exif(img)
            interesting_fields = ['Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'ISOSpeedRatings', 'FocalLength', 'LensModel']
            saved_exif = {k: str(v) for k, v in exif_raw.items() if k in interesting_fields}
            
            tags = []

            width, height = img.size
            if height > width: tags.append('Portrait')
            elif width > height: tags.append('Landscape')
            else: tags.append('Square')

            if 'Make' in exif_raw: tags.append(str(exif_raw['Make']).strip())
            if 'Model' in exif_raw: tags.append(str(exif_raw['Model']).strip())

            if 'ExposureTime' in exif_raw:
                val = parse_float(exif_raw['ExposureTime'])
                if val >= 1.0: tags.append('Long Exposure')
                elif val >= 0.1: tags.append('Slow Shutter')
                elif val > 0 and val <= 0.001: tags.append('High Speed')

            if 'FNumber' in exif_raw:
                val = parse_float(exif_raw['FNumber'])
                if val > 0 and val <= 2.8: tags.append('Bokeh')
                elif val >= 8.0: tags.append('Deep Depth of Field')

            if 'ISOSpeedRatings' in exif_raw:
                val = exif_raw['ISOSpeedRatings']
                iso = int(val[0]) if isinstance(val, (list, tuple)) else int(val)
                if iso >= 1600: tags.append('Low Light')
                elif iso <= 200: tags.append('Daylight')
            
            work_img = img.convert("RGBA")

            # Create Thumbnail
            thumb_io = BytesIO()
            thumb_img = work_img.copy() 
            thumb_img.thumbnail((500, 500))
            thumb_img.convert("RGB").save(thumb_io, format='JPEG', quality=85)
            
            # Create Watermark
            txt_layer = Image.new("RGBA", work_img.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(txt_layer)
            font_size = int(width / 30)
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()
            
            text = "© MemoRise"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
            draw.text((width - text_w - 20, height - text_h - 20), text, fill=(255, 255, 255, 128), font=font)
            
            final_img = Image.alpha_composite(work_img, txt_layer).convert("RGB")
            final_io = BytesIO()
            final_img.save(final_io, format='JPEG', quality=95)

        # use save=False to skip SQL update
        thumb_filename = f"thumb_{os.path.basename(photo.image.name)}"
        photo.thumbnail.save(thumb_filename, ContentFile(thumb_io.getvalue()), save=False)
        
        main_filename = os.path.basename(photo.image.name)
        photo.image.save(main_filename, ContentFile(final_io.getvalue()), save=False)

        
        current_tags = set(photo.manual_tags or [])
        current_tags.update(tags)
        
        rows_updated = Photo.objects.filter(id=photo_id).update(
            is_processed=True,
            exif_data=saved_exif,
            manual_tags=list(current_tags),
            image=photo.image.name,       
            thumbnail=photo.thumbnail.name,
            updated_at=timezone.now()
        )
        
        logger.info(f"Success: Processed photo {photo_id}. Rows updated: {rows_updated}")
        return "Done"

    except Photo.DoesNotExist:
        return "Photo not found"
    except Exception as e:
        logger.error(f"Error processing {photo_id}: {e}", exc_info=True)
        raise self.retry(exc=e, countdown=10)