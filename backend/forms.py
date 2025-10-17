from flask import Blueprint, request, jsonify

from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Form

from bson.objectid import ObjectId

from datetime import datetime

forms_bp = Blueprint('forms', __name__)

@forms_bp.route('/<form_id>/responses', methods=['POST'])

def submit_form_response(form_id):

  from responses import submit_response

  return submit_response(form_id)

@forms_bp.route('/', methods=['GET'])

@forms_bp.route('', methods=['GET'])

@jwt_required()

def get_forms():

  user_id = get_jwt_identity()

  print('Fetching forms for user_id:', user_id)

  forms = Form.find_by_user(user_id)

  for form in forms:

    form['_id'] = str(form['_id'])

    form['id'] = str(form['_id']) # Always provide 'id' for frontend

    form['user_id'] = str(form['user_id'])

  # Fetch templates

  from models import Template 

  templates = Template.find_all()
  # If there are no templates in the database, try to seed some default templates
  # This helps ensure the frontend has templates to display after first install
  if not templates:
    try:
      # import here to avoid circular imports at module load
      import add_templates
      add_templates.insert_templates()
      templates = Template.find_all()
    except Exception as e:
      print('Failed to seed templates:', e)

  for template in templates:

    template['id'] = str(template['_id'])

    del template['_id']

    # Remove MongoDB specific fields if any

    if 'created_at' in template:

      template['created_at'] = str(template['created_at'])

    if 'updated_at' in template:

      template['updated_at'] = str(template['updated_at'])

  print('Forms found:', forms)

  print('Templates found:', templates)

  return jsonify({'forms': forms, 'templates': templates}), 200

@forms_bp.route('/<form_id>', methods=['GET'])

def get_form(form_id):

  form = Form.find_by_id(form_id)

  if not form:

    return jsonify({'error': 'Form not found'}), 404

  # Convert ObjectId fields to string for JSON serialization

  form['_id'] = str(form['_id'])

  form['id'] = str(form['_id']) # Always provide 'id' for frontend

  if 'user_id' in form:

    form['user_id'] = str(form['user_id'])

  return jsonify(form), 200

@forms_bp.route('/', methods=['POST'])

@forms_bp.route('', methods=['POST'])

@jwt_required()

def create_form():

  user_id = get_jwt_identity()

  data = request.get_json()

  print('Creating form for user_id:', user_id, 'with data:', data)

  settings = data.get('settings', {

    'themeColor': '#2e86de',

    'confirmationMessage': 'Thank you for your submission!'

  })

  # Preserve Google Sheets settings from frontend

  if 'settings' in data:

    if 'google_sheet_id' in data['settings']:

      settings['google_sheet_id'] = data['settings']['google_sheet_id']

    if 'google_sheet_name' in data['settings']:

      settings['google_sheet_name'] = data['settings']['google_sheet_name']

  # Generate a user-friendly, unique sheet name based on the form title

  import re

  # Always use the provided title for the sheet name

  base_title = data.get('title', '').strip() or 'Untitled Form'

  # Remove special characters and limit length

  safe_title = re.sub(r'[^A-Za-z0-9 ]+', '', base_title)[:30].strip()

  base_sheet_name = f"{safe_title} sheet" if safe_title else 'Untitled Form sheet'

  # Check for existing forms with the same sheet name

  from models import Form as FormModel

  existing_names = [f.get('google_sheet_name', '') for f in FormModel.find_by_user(user_id)]

  sheet_name = base_sheet_name

  counter = 2

  while sheet_name in existing_names:

    sheet_name = f"{base_sheet_name}{counter}"

    counter += 1

  form = {

    'title': base_title,

    'description': data.get('description', ''),

    'fields': data.get('fields', []),

    'settings': settings

  }

  try:

    form_id = Form.create(user_id, form['title'], form['description'], form['fields'], form['settings'], sheet_name)

    if not form_id or not hasattr(form_id, 'inserted_id') or not form_id.inserted_id:

      print('ERROR: Form creation failed, form_id:', form_id)

      return jsonify({'error': 'Form creation failed', 'details': str(form_id)}), 500

    print('Form created with id:', form_id.inserted_id)

    return jsonify({

      'message': 'Form created successfully',

      'form_id': str(form_id.inserted_id),

      'id': str(form_id.inserted_id) # Always provide 'id' for frontend

    }), 201

  except Exception as e:

    import traceback

    print('EXCEPTION during form creation:', str(e))

    print(traceback.format_exc())

    return jsonify({'error': 'Form creation exception', 'details': str(e)}), 500

  # Initialize settings with defaults

  settings = {

    'themeColor': '#2e86de',

    'confirmationMessage': 'Thank you for your submission!'

  }

  # Update with any settings from the request

  if 'settings' in data:

    settings.update(data['settings'])

@forms_bp.route('/<form_id>', methods=['PUT'])

@jwt_required()

def update_form(form_id):

  user_id = get_jwt_identity()

  form = Form.find_by_id(form_id)

  if not form:

    return jsonify({'error': 'Form not found'}), 404

  if str(form['user_id']) != user_id:

    return jsonify({'error': 'Unauthorized'}), 403

  data = request.get_json()

  updates = {}

  if 'title' in data:

    updates['title'] = data['title']

    # Also update the google_sheet_name to match the new title

    import re

    safe_title = re.sub(r'[^A-Za-z0-9 ]+', '', data['title'].strip())[:30].strip()

    new_sheet_name = f"{safe_title} sheet" if safe_title else 'Untitled Form sheet'

    # Rename the actual Google Sheet tab if the name changed

    old_sheet_name = form.get('google_sheet_name', 'Sheet1')

    updates['google_sheet_name'] = new_sheet_name

    if old_sheet_name != new_sheet_name:

      try:

        from google_sheets import sheets_service

        spreadsheet_id = form.get('settings', {}).get('google_sheet_id', '1Xwj99Lj0ujjZEpoZ5vuhxeILKT96dCq8a6fGb4nYnjU')

        # Find the sheetId for the old sheet name

        sheet_info = sheets_service.service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()

        sheet_id = None

        for sheet in sheet_info.get('sheets', []):

          if sheet['properties']['title'] == old_sheet_name:

            sheet_id = sheet['properties']['sheetId']

            break

        if sheet_id is not None:

          requests = [{

            'updateSheetProperties': {

              'properties': {

                'sheetId': sheet_id,

                'title': new_sheet_name

              },

              'fields': 'title'

            }

          }]

          sheets_service.service.spreadsheets().batchUpdate(

            spreadsheetId=spreadsheet_id,

            body={'requests': requests}

          ).execute()

      except Exception as e:

        print(f"Failed to rename Google Sheet tab: {e}")

  if 'description' in data:

    updates['description'] = data['description']

  if 'fields' in data:

    updates['fields'] = data['fields']

  if 'settings' in data:

    updates['settings'] = data['settings']

  print(f'Updating form {form_id} for user {user_id} with updates:', updates)

  result = Form.update(form_id, updates)

  print('Update result:', result.raw_result if hasattr(result, 'raw_result') else result)

  # Return updated form with both 'id' and '_id'

  updated_form = Form.find_by_id(form_id)

  if updated_form:

    updated_form['_id'] = str(updated_form['_id'])

    updated_form['id'] = str(updated_form['_id'])

    if 'user_id' in updated_form:

      updated_form['user_id'] = str(updated_form['user_id'])

    return jsonify({'message': 'Form updated successfully', 'form': updated_form}), 200

  return jsonify({'message': 'Form updated successfully'}), 200

@forms_bp.route('/<form_id>', methods=['DELETE'])

@jwt_required()

def delete_form(form_id):

  user_id = get_jwt_identity()

  form = Form.find_by_id(form_id)

  if not form:

    return jsonify({'error': 'Form not found'}), 404

  if str(form['user_id']) != user_id:

    return jsonify({'error': 'Unauthorized'}), 403

  Form.delete(form_id)

  return jsonify({'message': 'Form deleted successfully'}), 200



