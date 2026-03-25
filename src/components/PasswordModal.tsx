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
      <div className="modal-content">
        <h2>pdf generated</h2>
        <div className="warning-text">
          <strong>Security Note:</strong> This is your unique document password. 
          It is shown <strong>only once</strong> and never stored. 
          Please copy it now to access your PDF.
        </div>

        <div className="password-box">
          <code>{password}</code>
          <button 
            type="button" 
            className="btn btn-icon" 
            onClick={handleCopy}
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            done
          </button>
        </div>
      </div>
    </div>
  );
}
