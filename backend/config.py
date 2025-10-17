import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

def parse_expiry(val):
    if not val:
        return timedelta(minutes=60)
    if isinstance(val, int):
        return timedelta(seconds=val)
    if isinstance(val, str):
        val = val.strip().lower()
        if val.endswith('h'):
            return timedelta(hours=int(val[:-1]))
        if val.endswith('m'):
            return timedelta(minutes=int(val[:-1]))
        if val.endswith('s'):
            return timedelta(seconds=int(val[:-1]))
        try:
            return timedelta(seconds=int(val))
        except Exception:
            return timedelta(hours=48)  # fallback
    return timedelta(hours=48)

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/form_builder')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    JWT_ACCESS_TOKEN_EXPIRES = parse_expiry(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', '24h'))