import os
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from flask import current_app

class GoogleSheetsService:
    def __init__(self):
        self.service = self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the Google Sheets API service with proper error handling."""
        SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'google-credentials.json')
        SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            current_app.logger.error('Google Sheets credentials file not found at: %s', SERVICE_ACCOUNT_FILE)
            raise FileNotFoundError(f'Credentials file not found at {SERVICE_ACCOUNT_FILE}')
            
        try:
            creds = Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE, 
                scopes=SCOPES
            )
            return build('sheets', 'v4', credentials=creds)
        except Exception as e:
            current_app.logger.error('Failed to initialize Google Sheets service: %s', str(e))
            raise

    def ensure_sheet_exists(self, spreadsheet_id, sheet_name):
        """Ensure the specified sheet exists in the spreadsheet."""
        try:
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()
            
            sheets = spreadsheet.get('sheets', [])
            sheet_exists = any(sheet['properties']['title'] == sheet_name for sheet in sheets)
            
            if not sheet_exists:
                self._create_sheet(spreadsheet_id, sheet_name)
                
        except HttpError as e:
            current_app.logger.error('Error checking sheet existence: %s', str(e))
            raise

    def _create_sheet(self, spreadsheet_id, sheet_name):
        """Create a new sheet in the spreadsheet."""
        body = {
            'requests': [{
                'addSheet': {
                    'properties': {
                        'title': sheet_name
                    }
                }
            }]
        }
        self.service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body=body
        ).execute()

    def write_headers(self, spreadsheet_id, sheet_name, headers):
        """Write headers to the sheet if they don't exist."""
        try:
            range_name = f'{sheet_name}!A1:Z1'
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            if not values or values[0] != headers:
                body = {'values': [headers]}
                self.service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range=range_name,
                    valueInputOption='USER_ENTERED',
                    body=body
                ).execute()
        except HttpError as e:
            if e.resp.status == 404:
                self.ensure_sheet_exists(spreadsheet_id, sheet_name)
                self.write_headers(spreadsheet_id, sheet_name, headers)
            else:
                raise

    def append_data(self, spreadsheet_id, sheet_name, data):
        """Append data to the specified sheet with comprehensive error handling."""
        try:
            body = {
                'values': [data],
                'majorDimension': 'ROWS'
            }
            result = self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=f'{sheet_name}!A1',
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            return result
        except HttpError as e:
            error_details = json.loads(e.content.decode())
            current_app.logger.error('Google Sheets API error: %s', error_details)
            raise
        except Exception as e:
            current_app.logger.error('Unexpected error: %s', str(e))
            raise

# Initialize the service when module is imported
sheets_service = GoogleSheetsService()

def append_response_to_sheet(spreadsheet_id, sheet_name, response_data):
    """
    Public interface for appending responses.
    Handles both header writing and data appending.
    """
    try:
        # First ensure the sheet exists
        sheets_service.ensure_sheet_exists(spreadsheet_id, sheet_name)
        
        # Then append the data
        return sheets_service.append_data(spreadsheet_id, sheet_name, response_data)
    except Exception as e:
        current_app.logger.error('Failed to append response: %s', str(e))
        raise
