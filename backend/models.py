from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from bson.objectid import ObjectId

mongo = PyMongo()

class User:
    @staticmethod
    def find_by_id(user_id):
        try:
            return mongo.db.users.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None
    @staticmethod
    def create(email, password, name=None):
        hashed_password = generate_password_hash(password)
        return mongo.db.users.insert_one({
            'email': email,
            'username': email,  # Ensure username is unique and matches email
            'password': hashed_password,
            'name': name,
            'created_at': datetime.utcnow()
        })

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({'email': email})

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user['password'], password)

class Form:
    @staticmethod
    def create(user_id, title, description="", fields=[], settings={}, google_sheet_name=None):
        doc = {
            'user_id': ObjectId(user_id),
            'title': title,
            'description': description,
            'fields': fields,
            'settings': settings,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        if google_sheet_name:
            doc['google_sheet_name'] = google_sheet_name
        return mongo.db.forms.insert_one(doc)

    @staticmethod
    def find_by_user(user_id):
        return list(mongo.db.forms.find({'user_id': ObjectId(user_id)}))

    @staticmethod
    def find_by_id(form_id):
        return mongo.db.forms.find_one({'_id': ObjectId(form_id)})

    @staticmethod
    def update(form_id, updates):
        updates['updated_at'] = datetime.utcnow()
        # If google_sheet_name is in updates or in settings, set it at the top level
        google_sheet_name = updates.get('google_sheet_name')
        if not google_sheet_name and 'settings' in updates:
            google_sheet_name = updates['settings'].get('google_sheet_name')
        if google_sheet_name:
            updates['google_sheet_name'] = google_sheet_name
        return mongo.db.forms.update_one(
            {'_id': ObjectId(form_id)},
            {'$set': updates}
        )

    @staticmethod
    def delete(form_id):
        return mongo.db.forms.delete_one({'_id': ObjectId(form_id)})

class Template:
    @staticmethod
    def create(name, description="", fields=None, settings=None):
        if fields is None:
            fields = []
        if settings is None:
            settings = {
                'themeColor': '#2e86de',
                'confirmationMessage': 'Thank you for your submission!'
            }
        return mongo.db.templates.insert_one({
            'name': name,
            'description': description,
            'fields': fields,
            'settings': settings,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })

    @staticmethod
    def find_all():
        return list(mongo.db.templates.find())

class Response:
    @staticmethod
    def create(form_id, data):
        return mongo.db.responses.insert_one({
            'form_id': ObjectId(form_id),
            'data': data,
            'submitted_at': datetime.utcnow()
        })

    @staticmethod
    def find_by_form(form_id):
        return list(mongo.db.responses.find({'form_id': ObjectId(form_id)}))