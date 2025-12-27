from . import consumers
from django.urls import re_path # regex based url matching in channels

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi())
]

# similar to urls.py but for websockets!