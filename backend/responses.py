from flask import Blueprint, request, jsonify
from models import Response, Form
from bson.objectid import ObjectId
from datetime import datetime
import logging

responses_bp = Blueprint('responses', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@responses_bp.route('/<form_id>', methods=['GET'])
def get_responses(form_id):
    """Get all responses for a specific form"""
    try:
        responses = Response.find_by_form(form_id)
        for response in responses:
            response['_id'] = str(response['_id'])
            response['form_id'] = str(response['form_id'])
        return jsonify(responses), 200
    except Exception as e:
        logger.error(f"Error fetching responses: {str(e)}")
        return jsonify({'error': 'Failed to fetch responses'}), 500

@responses_bp.route('/<form_id>', methods=['POST'])
def submit_response(form_id):
    """Submit a new form response and sync with Google Sheets"""
    try:
        # Validate form exists
        form = Form.find_by_id(form_id)
        if not form:
            logger.warning(f"Form not found: {form_id}")
            return jsonify({'error': 'Form not found'}), 404
        
        # Validate request data
        data = request.get_json()
        if not data:
            logger.warning("No response data provided")
            return jsonify({'error': 'Response data is required'}), 400
        
        # Save response to database
        response_id = Response.create(form_id, data)
        logger.info(f"Response saved to database: {response_id.inserted_id}")

        # Google Sheets integration - use per-form sheet/tab name
        # Get spreadsheet_id from form settings or top-level
        spreadsheet_id = None
        if 'settings' in form and 'google_sheet_id' in form['settings'] and form['settings']['google_sheet_id']:
            spreadsheet_id = form['settings']['google_sheet_id']
        elif 'google_sheet_id' in form and form['google_sheet_id']:
            spreadsheet_id = form['google_sheet_id']

        # Always use the top-level google_sheet_name if present, fallback to settings, fallback to SheetN logic
        sheet_name = None
        if 'google_sheet_name' in form and form['google_sheet_name']:
            sheet_name = form['google_sheet_name']
        elif 'settings' in form and 'google_sheet_name' in form['settings'] and form['settings']['google_sheet_name']:
            sheet_name = form['settings']['google_sheet_name']
        else:
            # Fallback: assign SheetN based on form id hash (to avoid all going to Sheet1)
            import hashlib
            n = int(hashlib.sha256(str(form_id).encode()).hexdigest(), 16) % 1000 + 1
            sheet_name = f"Sheet{n}"
        sheets_error = None
        sheets_result = None
        sync_attempted = False

        # Only proceed if we have a spreadsheet ID
        if spreadsheet_id:
            sync_attempted = True
            try:
                from google_sheets import sheets_service

                # Safely get fields (handle None case)
                fields = form.get('fields', []) or []


                # Prepare headers and data
                headers = []
                row_data = []

                # Fallback: if data does not contain field labels, map field IDs to labels
                data_keys = set(data.keys())
                label_keys = set(field['label'] for field in fields if field and 'label' in field)
                id_keys = set(field['id'] for field in fields if field and 'id' in field)
                use_id_keys = len(data_keys & id_keys) > len(data_keys & label_keys)

                for field in fields:
                    if field and 'label' in field:
                        headers.append(field['label'])
                        if use_id_keys and 'id' in field:
                            row_data.append(str(data.get(field['id'], '')))
                        else:
                            row_data.append(str(data.get(field['label'], '')))

                logger.info(f"Google Sheets headers: {headers}")
                logger.info(f"Google Sheets row_data: {row_data}")

                # Ensure sheet exists and has headers
                try:
                    sheets_service.ensure_sheet_exists(spreadsheet_id, sheet_name)
                    sheets_service.write_headers(spreadsheet_id, sheet_name, headers)
                except Exception as header_error:
                    logger.warning(f"Header setup issue: {str(header_error)}")

                # Append the data
                sheets_result = sheets_service.append_data(spreadsheet_id, sheet_name, row_data)
                logger.info(f"Data appended to Google Sheets: {sheets_result}")

            except Exception as e:
                sheets_error = str(e)
                logger.error(f"Google Sheets error: {sheets_error}")

        # Prepare response
        response_data = {
            'message': 'Response submitted successfully',
            'timestamp': datetime.utcnow().isoformat(),
            'response_id': str(response_id.inserted_id),
            'database_success': True,
            'google_sheets': {
                'spreadsheet_id': spreadsheet_id,
                'sheet_name': sheet_name,
                'sync_attempted': sync_attempted,
                'success': sheets_result is not None,
                'error': sheets_error,
                'updated_range': sheets_result.get('updates', {}).get('updatedRange') if sheets_result else None
            }
        }

        return jsonify(response_data), 201

    except Exception as e:
        logger.error(f"Unexpected error in submit_response: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500