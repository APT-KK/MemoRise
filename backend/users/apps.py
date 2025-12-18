import firebase_admin
import os
from django.apps import AppConfig
from firebase_admin import credentials

class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        if not firebase_admin._apps:
            try:
                # Firebase config is at project root (one level up from backend)
                backend_dir = os.path.dirname(os.path.dirname(__file__))
                cred_path = os.path.join(backend_dir, '..', 'firebase_config.json')
                cred_path = os.path.normpath(cred_path)
                
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    print(f"Firebase config file not found at: {cred_path}")
            except Exception as e:
                print(f"Error initializing Firebase Admin SDK: {e}. Path tried: {cred_path}")

