import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiSave, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'admin',
    email: 'admin@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      applyTheme(savedTheme);
    }
  }, []);

  // Apply theme to the document
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    applyTheme(newMode ? 'dark' : 'light');
    toast.success(`Switched to ${newMode ? 'dark' : 'light'} mode`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isEditing) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Here you would typically make an API call to update the profile
    // For demo purposes, we'll just show a success message
    console.log('Updating profile with:', formData);
    
    toast.success('Profile updated successfully!');
    setIsEditing(false);
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  useEffect(() => {
    // Fetch user details from backend using authApi
    async function fetchUser() {
      // Import authApi directly from api.js
      const { authApi } = await import('../api');
      const user = await authApi.getMe();
      if (user && user.email) {
        setFormData(prev => ({
          ...prev,
          username: user.name || user.username || user.email,
          email: user.email,
          name: user.name || '',
        }));
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="settings-container">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>Account Information</h3>
          <div className="settings-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="settings-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
            <p className="field-description">Email cannot be changed</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Password</h3>
          
          <div className="settings-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={!isEditing}
              className={errors.currentPassword ? 'error' : ''}
            />
            {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
          </div>
          
          {isEditing && (
            <>
              <div className="settings-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                <p className="field-description">Leave blank to keep current password</p>
              </div>
              
              {formData.newPassword && (
                <div className="settings-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          
          <div className="settings-group">
            <label>Theme</label>
            <div className="theme-toggle">
              <button
                type="button"
                className={`theme-option ${!darkMode ? 'active' : ''}`}
                onClick={() => darkMode && toggleDarkMode()}
              >
                <FiSun /> Light
              </button>
              <button
                type="button"
                className={`theme-option ${darkMode ? 'active' : ''}`}
                onClick={() => !darkMode && toggleDarkMode()}
              >
                <FiMoon /> Dark
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          {!isEditing ? (
            <button 
              type="button" 
              className="save-settings-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                type="submit" 
                className="save-settings-btn"
              >
                <FiSave /> Save Changes
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                }}
              >
                <FiX /> Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;