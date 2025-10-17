import React, { useState } from 'react';
import { FiHome, FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setShowDropdown(false); // Close dropdown after navigation
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>
        <h1 style={{ fontFamily: '', fontSize: 29 }}>OCTACOMM<c style={{ fontSize: 29 }}>™</c></h1>
        
      </div>

      <div className="user-actions">
        <div className="profile-dropdown">
          <button className="header-button" onClick={() => setShowDropdown((prev) => !prev)}>
            <FiUser /> Profile
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { handleNavigate('/profile'); setShowDropdown(false); }}>
                <FiUser /> My Account
              </button>

              {/* Future settings option */}
              {/* <button className="dropdown-item" onClick={() => handleNavigate('/profile/settings')}>
                <FiSettings /> Settings
              </button> */}

              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={() => { onLogout(); setShowDropdown(false); }}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
