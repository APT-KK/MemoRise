# similar to django view but for websockets!
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"] # get the user from scope (AuthMiddlewareStack)

        # user not authenticated
        if self.user.is_anonymous: 
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


