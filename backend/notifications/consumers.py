# similar to django view but for websockets!
import json
from channels.generic.websocket import AsyncWebsocketConsumer

from urllib.parse import parse_qs
import jwt
from django.conf import settings
from users.models import CustomUser
from asgiref.sync import sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Debug: try to get user from JWT token in query string
        query_string = self.scope['query_string'].decode()
        token = parse_qs(query_string).get('token', [None])[0]
        self.user = None
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id') or payload.get('user') or payload.get('user_pk') or payload.get('userId')
                if user_id:
                    self.user = await sync_to_async(CustomUser.objects.get)(id=user_id)
            except Exception as e:
                print(f"WebSocket JWT auth error: {e}")
                
        if not self.user or self.user.is_anonymous:
            await self.close()
        else:
            # we create a user specific grp
            self.group_name = f'notifications_{self.user.id}'
            # channel layer is set to redis (settings.py)
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name #unique connection id
            )
            await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # basically a event handler 
    async def send_notification(self, event):
        message = event['message']
        """
        Event payload would be like ->
        {
            "type": "send_notification",
            "message": {...}
        }
        """
        await self.send(text_data=json.dumps(message))


