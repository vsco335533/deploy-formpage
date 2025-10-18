from flask import Flask, jsonify, request, make_response
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

# Configure CORS
CORS(app, 
     resources={
         r"/api/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "supports_credentials": False
         }
     })

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


# Internal/debug endpoint: DB ping status (SAFE — does NOT return credentials)
@app.route('/api/internal/db-status', methods=['GET'])
def db_status():
    try:
        # Use the PyMongo client to ping the server
        mongo.cx.admin.command('ping')
        return jsonify({'db': 'ok'}), 200
    except Exception as e:
        # Return the exception message to help debugging (do not expose URI)
        return jsonify({'db': 'error', 'details': str(e)}), 500


# Internal/debug endpoint: environment flag checks (do not return secrets)
@app.route('/api/internal/env', methods=['GET'])
def env_info():
    # Only indicate whether MONGO_URI is set, not its value
    mongo_set = bool(os.getenv('MONGO_URI'))
    return jsonify({'mongo_uri_set': mongo_set}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5050)
    