import React from 'react';
import { FiCopy, FiX, FiMail, FiLink2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ShareModal = ({ link, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const shareViaEmail = () => {
    const subject = 'Check out this form I created';
    const body = `I've created a form using Allmighty-Push. You can fill it out here: ${link}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h3>Share Your Form</h3>
        <div className="link-container">
          <FiLink2 className="link-icon" />
          <input type="text" value={link} readOnly />
          <button onClick={copyToClipboard}>
            <FiCopy /> Copy
          </button>
        </div>
        <div className="share-options">
          <button className="email-btn" onClick={shareViaEmail}>
            <FiMail /> Share via Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
