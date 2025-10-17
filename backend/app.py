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

# Add OPTIONS handler for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

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
    