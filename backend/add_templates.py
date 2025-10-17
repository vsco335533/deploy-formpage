import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models import Template
from app import app

# Sample templates to insert
templates = [
    {
        'name': 'Contact Form',
        'description': 'A simple contact form template',
        'fields': [
            {'label': 'Name', 'type': 'text', 'required': True},
            {'label': 'Email', 'type': 'email', 'required': True},
            {'label': 'Message', 'type': 'textarea', 'required': True}
        ],
        'settings': {
            'themeColor': '#2e86de',
            'confirmationMessage': 'Thank you for contacting us!'
        }
    },
  
    {
        'name': 'Event Registration',
        'description': 'Register participants for an event',
        'fields': [
            {'label': 'Full Name', 'type': 'text', 'required': True},
            {'label': 'Email', 'type': 'email', 'required': True},
            {'label': 'Telephone Number', 'type': 'telephone', 'required': False},
            {'label': 'Event Date', 'type': 'date', 'required': True},
            {'label': 'Number of Tickets', 'type': 'number', 'required': True}
        ],
        'settings': {
            'themeColor': '#e67e22',
            'confirmationMessage': 'Thank you for registering!'
        }
    },
    {
        'name': 'Job Application',
        'description': 'Collect job applications with resume upload',
        'fields': [
            {'label': 'Full Name', 'type': 'text', 'required': True},
            {'label': 'Email', 'type': 'email', 'required': True},
            {'label': 'Phone', 'type': 'text', 'required': False},
            {'label': 'Resume', 'type': 'file', 'required': True},
            {'label': 'Cover Letter', 'type': 'textarea', 'required': False}
        ],
        'settings': {
            'themeColor': '#8e44ad',
            'confirmationMessage': 'Your application has been submitted!'
        }
    },
    {
        'name': 'Survey',
        'description': 'A general survey template with multiple choice',
        'fields': [
            {'label': 'Age', 'type': 'number', 'required': False},
            {'label': 'Gender', 'type': 'select', 'required': False, 'options': ['Male', 'Female', 'Other']},
            {'label': 'How did you hear about us?', 'type': 'text', 'required': False},
            {'label': 'Would you recommend us?', 'type': 'radio', 'required': True, 'options': ['Yes', 'No']}
        ],
        'settings': {
            'themeColor': '#16a085',
            'confirmationMessage': 'Thank you for completing the survey!'
        }
    },
    {
    'name': 'Appointment Booking',
    'description': 'Book appointments with date and time selection',
    'fields': [
        {'label': 'Full Name', 'type': 'text', 'required': True},
        {'label': 'Email', 'type': 'email', 'required': True},
        {'label': 'Preferred Date', 'type': 'date', 'required': True},
        {'label': 'Preferred Time', 'type': 'time', 'required': True},
        {'label': 'Notes', 'type': 'textarea', 'required': False}
    ],
    'settings': {
        'themeColor': '#2980b9',
        'confirmationMessage': 'Your appointment is booked!'
    }
}
]

def insert_templates():
    from models import mongo
    with app.app_context():
        # Remove all templates first
        deleted = mongo.db.templates.delete_many({})
        print(f"Deleted {deleted.deleted_count} existing templates.")
        for tpl in templates:
            Template.create(
                name=tpl['name'],
                description=tpl['description'],
                fields=tpl['fields'],
                settings=tpl['settings']
            )
        print(f"Inserted {len(templates)} templates.")

if __name__ == "__main__":
    insert_templates()
