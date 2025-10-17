import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const GoogleLoginButton = ({ onLogin, redirectPath = '/' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Validate required fields
      if (!decoded.email || !decoded.name) {
        throw new Error('Incomplete user data from Google');
      }

      // Call parent login handler
      const loginSuccess = await onLogin(decoded.email, '', true);
      
      if (loginSuccess !== false) { // Allow parent to prevent navigation
        navigate(redirectPath);
        toast.success(`Welcome, ${decoded.name}!`);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      toast.error(error.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again or use another method.');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="300"
          disabled={isLoading}
          locale="en"
        />
        {isLoading && <div className="login-spinner">Loading...</div>}
      </div>
    </GoogleOAuthProvider>
  );
};

GoogleLoginButton.propTypes = {
  onLogin: PropTypes.func.isRequired,
  redirectPath: PropTypes.string
};

export default GoogleLoginButton;