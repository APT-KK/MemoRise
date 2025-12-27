from celery import shared_task
from .models import Photo
from PIL import Image, ImageDraw, ImageFont 
from io import BytesIO
from django.core.files.base import ContentFile
import os

@shared_task
def process_photo(photo_id):
    try:
        photo = Photo.objects.get(id=photo_id)

        img = Image.open(photo.image).convert("RGBA")
        
        # generate thumbnail
        thumb_io = BytesIO()
        thumb_img = img.copy()
        thumb_img.thumbnail((500, 500))
        thumb_img = thumb_img.convert("RGB") 
        thumb_img.save(thumb_io, format='JPEG', quality=85)
        
        photo.thumbnail.save(
            f"thumb_{os.path.basename(photo.image.name)}",
            ContentFile(thumb_io.getvalue()),
            save=False
        )

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

        # Calculating text size to position it in Bottom-Right
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        margin = 20
        x = width - text_width - margin
        y = height - text_height - margin

        # here 128 means 50% transparent
        draw.text((x, y), text, fill=(255, 255, 255, 128), font=font)

        watermarked = Image.alpha_composite(img, txt_layer)

        # convert back to RGB to save as JPEG
        final_image = watermarked.convert("RGB")
        
        img_io = BytesIO() # in-memory buffer file
        final_image.save(img_io, format='JPEG', quality=95)
        
        photo.image.save(
            os.path.basename(photo.image.name),
            ContentFile(img_io.getvalue()),
            save=False
        )

        # Mark the photo as processed
        photo.is_processed = True
        photo.save()
        return f"Photo {photo_id} processed successfully."
    except Photo.DoesNotExist:
        return f"Photo {photo_id} does not exist."