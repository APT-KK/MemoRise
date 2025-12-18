import firebase_admin
import os
from django.apps import AppConfig
from firebase_admin import credentials

class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):

        if not firebase_admin._apps:
            try:
                # Use correct path relative to backend directory
                cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase_config.json')
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Error initializing Firebase Admin SDK: {e}. Path tried: {cred_path}")
