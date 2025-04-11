import os
import pusher
from dotenv import load_dotenv

load_dotenv()

class PusherService:
    def __init__(self):
        self.client = pusher.Pusher(
            app_id=os.getenv('PUSHER_APP_ID', ''),
            key=os.getenv('PUSHER_KEY', ''),
            secret=os.getenv('PUSHER_SECRET', ''),
            cluster=os.getenv('PUSHER_CLUSTER', ''),
            ssl=True
        )

    def trigger_message(self, channel: str, message: str, role: str = 'assistant'):
        """Trigger a message event on a specific channel"""
        self.client.trigger(
            channel,
            'message',
            {
                'content': message,
                'role': role
            }
        )

pusher_service = PusherService()
