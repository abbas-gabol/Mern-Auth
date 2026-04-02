import { useState } from "react";
import "./TermsModal.css";

export default function TermsModal({ isOpen, onClose, tab = "terms" }) {
  const [activeTab, setActiveTab] = useState(tab);

  if (!isOpen) return null;

  const termsContent = `Terms of Service

Last updated: April 2, 2026

Welcome to this application.

By using this app, you agree to the following terms:

1. Use of the App

This application is a personal or academic project. You agree to use it responsibly and not to misuse, damage, or attempt to exploit the system in any way.

2. Accounts
You are responsible for the information you provide.
You agree to keep your login credentials secure.
You must not create false accounts or impersonate others.

3. Acceptable Use

You agree not to:

Attempt unauthorized access to the system
Interfere with or disrupt the app's functionality
Use the app for any illegal or harmful activities

4. Changes

Since this is a project, the app and its features may change or stop at any time without notice.

5. No Warranty

This app is provided "as is" without any guarantees of reliability, security, or availability.`;

  const privacyContent = `Privacy Policy

Last updated: April 2, 2026

Your privacy is important.

1. Information We Collect

We may collect:

Email address
Password (stored securely, usually hashed)
Basic account information needed for login

2. How We Use Your Information

We use your data only to:

Create and manage your account
Authenticate your login
Maintain basic app functionality

3. Data Sharing
We do not sell or share your personal data with third parties.
Your data is used only within this application.

4. Data Security

We take reasonable steps to protect your data, but since this is a project, we cannot guarantee complete security.

5. Changes

This privacy policy may be updated as the project evolves`;

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="terms-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="terms-modal-tabs">
          <button
            className={`terms-tab ${activeTab === "terms" ? "active" : ""}`}
            onClick={() => setActiveTab("terms")}
          >
            Terms of Service
          </button>
          <button
            className={`terms-tab ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy Policy
          </button>
        </div>

        <div className="terms-modal-body">
          <div className="terms-content">
            {activeTab === "terms" ? termsContent : privacyContent}
          </div>
        </div>

        <div className="terms-modal-footer">
          <button className="terms-close-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
