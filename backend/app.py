from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager
from auth import auth_bp
from forms import forms_bp
from responses import responses_bp
from config import Config
from models import mongo


app = Flask(__name__)
app.config.from_object(Config)

# Initialize JWTManager
jwt = JWTManager(app)

# Initialize PyMongo
mongo.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(forms_bp, url_prefix='/api/forms')
app.register_blueprint(responses_bp, url_prefix='/api/responses')

# Allow configuring allowed CORS origins via environment variable ALLOWED_ORIGINS
# Example: ALLOWED_ORIGINS="https://your-vercel-app.vercel.app,http://localhost:3000"
allowed = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000')
allowed_list = [o.strip() for o in allowed.split(',') if o.strip()]
CORS(app, resources={r"/api/*": {"origins": allowed_list}}, supports_credentials=True)

@app.route('/')
def index():
    return jsonify({"status": "API is running"})

# Endpoint to expose Google Service Account Email for frontend
@app.route('/api/forms/client-email', methods=['GET'])
def get_google_client_email():
    import json
    import os
    cred_path = os.path.join(os.path.dirname(__file__), 'google-credentials.json')
    try:
        with open(cred_path, 'r') as f:
            creds = json.load(f)
        client_email = creds.get('client_email', '')
    except Exception:
        client_email = ''
    return jsonify({"client_email": client_email})

if __name__ == '__main__':
    app.run(debug=True, port=5050)
    