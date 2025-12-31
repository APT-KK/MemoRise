
from celery import shared_task
from .models import Photo
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile
from django.db import connection
import os
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_photo(photo_id):
    try:
        logger.debug(f"[Celery] Starting process_photo for id={photo_id}")
        print(f"[Celery] Starting process_photo for id={photo_id}")
        photo = Photo.objects.get(id=photo_id)
        print(f"[Celery] Loaded photo: id={photo.id}, image={photo.image.name}, thumbnail={photo.thumbnail.name}")

        try:
            with Image.open(photo.image) as img:
                img = img.convert("RGBA")
                print(f"[Celery] Opened image: {photo.image.name}, size={img.size}")
                # generate thumbnail
                thumb_io = BytesIO()
                thumb_img = img.copy()
                thumb_img.thumbnail((500, 500))
                thumb_img = thumb_img.convert("RGB")
                thumb_img.save(thumb_io, format='JPEG', quality=85)
                try:
                    photo.thumbnail.save(
                        f"thumb_{os.path.basename(photo.image.name)}",
                        ContentFile(thumb_io.getvalue()),
                        save=True
                    )
                    print(f"[Celery] Saved thumbnail: {photo.thumbnail.name}")
                except Exception as thumb_exc:
                    logger.error(f"[Celery] Error saving thumbnail: {thumb_exc}", exc_info=True)
                    print(f"[Celery] Error saving thumbnail: {thumb_exc}")
                thumb_io.close()

                # generate watermark
                txt_layer = Image.new("RGBA", img.size, (255, 255, 255, 0))
                draw = ImageDraw.Draw(txt_layer)
                width, height = img.size
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
                watermarked = Image.alpha_composite(img, txt_layer)
                final_image = watermarked.convert("RGB")
                img_io = BytesIO()
                final_image.save(img_io, format='JPEG', quality=95)
                original_name = photo.image.name
                try:
                    photo.image.save(
                        os.path.basename(original_name),
                        ContentFile(img_io.getvalue()),
                        save=True
                    )
                    print(f"[Celery] Saved watermarked image: {photo.image.name}")
                except Exception as img_exc:
                    logger.error(f"[Celery] Error saving image: {img_exc}", exc_info=True)
                    print(f"[Celery] Error saving image: {img_exc}")
                img_io.close()
        except Exception as img_process_exc:
            logger.error(f"[Celery] Error during image processing: {img_process_exc}", exc_info=True)
            print(f"[Celery] Error during image processing: {img_process_exc}")

        # Debug: Confirm file fields are saved
        logger.debug(f"[Celery] Saved files for photo.id={photo.id}, thumbnail={photo.thumbnail.name}, image={photo.image.name}")
        print(f"[Celery] Saved files for photo.id={photo.id}, thumbnail={photo.thumbnail.name}, image={photo.image.name}")

        # Refresh from DB to ensure latest state
        photo.refresh_from_db()
        print(f"[Celery] After refresh_from_db: is_processed={photo.is_processed}, thumbnail={photo.thumbnail.name}, image={photo.image.name}")

        # Save is_processed status separately
        try:
            photo.is_processed = True
            photo.save(update_fields=["is_processed"])
            logger.debug(f"[Celery] Set is_processed=True for photo.id={photo.id}")
            print(f"[Celery] Set is_processed=True for photo.id={photo.id}")
        except Exception as status_exc:
            logger.error(f"[Celery] Error saving is_processed: {status_exc}", exc_info=True)
            print(f"[Celery] Error saving is_processed: {status_exc}")

        # Force DB connection close to flush changes
        connection.close()
        logger.debug(f"[Celery] Closed DB connection after save for photo.id={photo.id}")
        print(f"[Celery] Closed DB connection after save for photo.id={photo.id}")

        # Verify with a fresh DB query
        refreshed = Photo.objects.get(id=photo_id)
        logger.debug(f"[Celery] After all saves: photo.id={refreshed.id}, is_processed={refreshed.is_processed}, thumbnail={refreshed.thumbnail.name}, image={refreshed.image.name}")
        print(f"[Celery] After all saves: photo.id={refreshed.id}, is_processed={refreshed.is_processed}, thumbnail={refreshed.thumbnail.name}, image={refreshed.image.name}")

        return f"Photo {photo_id} processed successfully."
    except Photo.DoesNotExist:
        logger.error(f"Photo {photo_id} does not exist.")
        print(f"Photo {photo_id} does not exist.")
        return f"Photo {photo_id} does not exist."
    except Exception as e:
        logger.error(f"[Celery Task Error] {e}", exc_info=True)
        print(f"[Celery Task Error] {e}")
        raise
