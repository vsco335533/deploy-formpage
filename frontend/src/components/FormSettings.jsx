import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave } from 'react-icons/fi';


import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const FormSettings = ({ form, updateForm }) => {
  const navigate = useNavigate();
  const defaultSheetId = "1Xwj99Lj0ujjZEpoZ5vuhxeILKT96dCq8a6fGb4nYnjU";
  // Always use the google_sheet_name from the form (set automatically)
  const [settings, setSettings] = useState({
    ...((form.settings || {})),
    google_sheet_id: (form.settings && form.settings.google_sheet_id) || defaultSheetId,
    google_sheet_name: form.google_sheet_name || (form.settings && form.settings.google_sheet_name) || "Sheet1"
  });
  const [isSaved, setIsSaved] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  // Fetch Google Service Account Email from backend
  useEffect(() => {
    async function fetchClientEmail() {
      try {
        const res = await axios.get(`${API_URL}/forms/client-email`);
        setClientEmail(res.data.client_email || '');
      } catch {
        setClientEmail('');
      }
    }
    fetchClientEmail();
  }, []);

  // When Google Sheet ID changes, update backend immediately
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'google_sheet_id' && value && form?.id) {
      // Update backend immediately
      try {
        await axios.put(`${API_URL}/forms/${form.id}`, {
          settings: {
            ...settings,
            google_sheet_id: value
          }
        });
      } catch (err) {
        // Optionally show error
      }
    }
  };

  const handleColorChange = (color) => {
    setSettings(prev => ({
      ...prev,
      themeColor: color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save the actual user-entered Google Sheet ID and other settings
    const saveSettings = {
      ...settings,
      google_sheet_name: form.google_sheet_name || settings.google_sheet_name || "Sheet1"
    };
    updateForm({
      ...form,
      settings: saveSettings
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // Redirect to form builder after save
    setTimeout(() => {
      navigate(`/form/${form.id}/build`);
    }, 500); // short delay to show 'Saved!'
  };

  const colors = ['#2e86de', '#10ac84', '#ee5253', '#ff9f43', '#5f27cd', '#00d2d3'];

  return (
    <div className="settings-container">
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>Form Appearance</h3>
          <div className="settings-group">
            <label>Theme Color</label>
            <div className="color-picker">
              {colors.map(color => (
                <div
                  key={color}
                  className={`color-option ${settings.themeColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Thank You Page & Redirection</h3>
          <div className="settings-group">
            <label>
              <input
                type="radio"
                name="thankOrRedirect"
                checked={!settings.redirectEnabled}
                onChange={() => setSettings(prev => ({ ...prev, redirectEnabled: false }))}
              />
              Thank You Page
            </label>
            <label style={{marginLeft: 24}}>
              <input
                type="radio"
                name="thankOrRedirect"
                checked={!!settings.redirectEnabled}
                onChange={() => setSettings(prev => ({ ...prev, redirectEnabled: true }))}
              />
              Redirect To URL
            </label>
          </div>
          {!settings.redirectEnabled && (
            <div className="settings-group">
              <label>Thank You Message</label>
              <textarea
                name="confirmationMessage"
                value={settings.confirmationMessage || ''}
                onChange={handleChange}
                placeholder="Thank you for your submission!"
              />
            </div>
          )}
          {settings.redirectEnabled && (
            <div className="settings-group">
              <label>Redirect URL</label>
              <input
                type="text"
                name="redirectUrl"
                value={settings.redirectUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/thank-you"
              />
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>Google Sheets Integration</h3>
          <div className="settings-group">
            <label>Google Sheet ID</label>
            <input
              type="text"
              name="google_sheet_id"
              value={settings.google_sheet_id || ''}
              onChange={handleChange}
              placeholder=""
            />
          </div>
          <div className="settings-group">
            <label>Sheet Name</label>
            <input
              type="text"
              name="google_sheet_name"
              value={settings.google_sheet_name || ''}
              disabled
              placeholder="Sheet1"
            />
          </div>
          <div className="settings-group">
            <label>Service Account Email</label>
            <input
              type="text"
              value={clientEmail}
              readOnly
              style={{ background: '#f5f5f5', color: '#333' }}
            />
            <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
              <b>Note:</b> If you change the Google Sheet ID, you must add the above Service Account Email as an <b>Editor</b> to your Google Sheet.<br />
              <b>Steps:</b>
              <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li>Copy the Service Account Email above.</li>
                <li>Open your Google Sheet and click <b>Share</b>.</li>
                <li>Paste the Service Account Email and set as <b>Editor</b>.</li>
                <li>Click <b>Send</b> to grant access.</li>
              </ol>
              This allows your form to write responses to the selected Google Sheet.
            </div>
          </div>
        </div>

        <button type="submit" className="save-settings-btn">
          <FiSave /> {isSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default FormSettings;
