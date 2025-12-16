from django.apps import AppConfig
import firebase_admin
from firebase_admin import credentials

class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        if not firebase_admin._apps:
            try:
                cred_path = ('firebase_config.json')
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Error initializing Firebase Admin SDK: {e}")
