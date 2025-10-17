

import React, { useState } from 'react';
import backImg from '../../assets/back.png';
import { authApi } from '../../api';
import PropTypes from 'prop-types';
import GoogleLoginButton from './GoogleLoginButton';
import { FaUser, FaLock } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerError) setRegisterError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await onLogin(formData.email, formData.password);
      if (!success) throw new Error('Invalid email or password');
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await authApi.register(registerData.email, registerData.password, registerData.name);
      toast.success('Registration successful! You can now log in.');
      setShowRegister(false);
      setFormData({ email: registerData.email, password: '' });
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Registration failed');
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };
  return (
    <React.Fragment>
      <style>{`
        html, body {
          overflow: hidden !important;
        }
      `}</style>
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          left: 0,
          top: 0,
          background: `url(${backImg}) no-repeat center center fixed`,
          backgroundSize: 'cover',
          zIndex: -1,
        }} />
        <div className="admin-login-container" style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          padding: 32,
          boxShadow: 'none',
          minWidth: 320,
          // maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {!showRegister ? (
            <form className="admin-login-form" onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="company-logo-row" style={{  display: 'flex', alignItems: 'center' }}>
                <img
                  src="octa_work_logo.jpg"
                  alt="OCTACOMM Logo"
                  className="company-logo-img"
                  style={{ maxWidth: 80, }}
                />
                <span className="company-logo-name" style={{ fontWeight: 'bold', fontSize: 28, color: '#895fd3ff' }}>
                  OCTACOMM™
                </span>
              </div>
              <h3 className="form-title">Admin Login</h3>
              {/* ...existing code for login form... */}
              <div className="input-group">
                <label htmlFor="login-email">
                  <FaUser className="input-icon" />
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              <div className="input-group" style={{ position: 'relative' }}>
                <label htmlFor="password">
                  <FaLock className="input-icon" />
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <span
                  className="toggle-password-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: 18,
                    zIndex: 2
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" className="register-btn" onClick={() => setShowRegister(true)}>
                Register
              </button>
              {/* <div className="divider"><span>or</span></div> */}
              {/* <GoogleLoginButton onLogin={handleGoogleLogin} redirectPath="/" /> */}
              <div className="forgot-password">
                {/* <button type="button" onClick={() => navigate('/reset-password')}>
                  Forgot password?
                </button> */}
              </div>
            </form>
          ) : (
            <form className="admin-login-form" onSubmit={handleRegisterSubmit} style={{ width: '100%' }}>
              <div className="company-logo-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src="octa_work_logo.jpg"
                  alt="OCTACOMM Logo"
                  className="company-logo-img"
                  style={{ maxWidth: 80,  }}
                />
                <span className="company-logo-name" style={{ fontWeight: 'bold', fontSize: 28, color: '#7c3aed' }}>
                  OCTACOMM™
                </span>
              </div>
              <h2 className="form-title">Register</h2>
              {/* ...existing code for register form... */}
              <div className="input-group">
                <label htmlFor="register-email">
                  <FaUser className="input-icon" />
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  disabled={isRegistering}
                  autoComplete="email"
                />
              </div>
              <div className="input-group">
                <label htmlFor="register-password">
                  <FaLock className="input-icon" />
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  disabled={isRegistering}
                  autoComplete="new-password"
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  placeholder="Name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  disabled={isRegistering}
                  autoComplete="name"
                />
              </div>
              {registerError && <div className="error-message">{registerError}</div>}
              <button type="submit" className="login-btn" disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
              <button type="button" className="register-btn" onClick={() => setShowRegister(false)}>
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

AdminLogin.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default AdminLogin;
