import firebase_admin
import os
from django.apps import AppConfig
from firebase_admin import credentials

class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):

        if not firebase_admin._apps:
            try:
                # Use correct path - firebase_config.json is in the same directory as this file
                cred_path = os.path.join(os.path.dirname(__file__), 'firebase_config.json')
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    print(f"Firebase config file not found at: {cred_path}")
            except Exception as e:
                print(f"Error initializing Firebase Admin SDK: {e}. Path tried: {cred_path}")
