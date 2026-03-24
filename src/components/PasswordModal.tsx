import React, { useState } from 'react';

interface PasswordModalProps {
  password: string | null;
  onClose: () => void;
}

export function PasswordModal({ password, onClose }: PasswordModalProps) {
  const [copied, setCopied] = useState(false);

  if (!password) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3>PDF Generated Successfully</h3>
        <p className="warning-text">
          <strong>WARNING:</strong> This is your 12-character document password. 
          It will be shown <strong>only once</strong>. Please copy it now.
        </p>

        <div className="password-box">
          <code>{password}</code>
          <button 
            type="button" 
            className="btn btn-icon" 
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? '✅ Copied' : '📋 Copy'}
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            I have saved the password
          </button>
        </div>
      </div>
    </div>
  );
}
