import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print('Register endpoint called. Data received:', data)
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        print('Missing email or password')
        return jsonify({'error': 'Email and password are required'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        print('Invalid email format:', email)
        return jsonify({'error': 'Invalid email format'}), 400

    if User.find_by_email(email):
        print('Email already registered:', email)
        return jsonify({'error': 'Email already registered'}), 400

    try:
        User.create(email, password, name)
        print('User created successfully:', email)
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print('Exception during user creation:', str(e))
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.find_by_email(email)
    if not user or not User.verify_password(user, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name')
        }
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.find_by_email(email)
    if not user:
        # Create user if not exists
        user_id = User.create(email, generate_password_hash(os.urandom(16).hex()), name)
        user = User.find_by_email(email)
        if not user:  # Double check if user was created
            return jsonify({'error': 'Failed to create user'}), 500

    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],  # Ensure email is included
            'name': user.get('name', '')  # Ensure name is included, default to empty string if not present
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id) if hasattr(User, 'find_by_id') else None
    if not user:
        # fallback: try to find by email if identity is email
        user = User.find_by_email(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': str(user['_id']),
        'email': user['email'],
        'name': user.get('name'),
        'username': user.get('username'),
        'created_at': user.get('created_at')
    }), 200