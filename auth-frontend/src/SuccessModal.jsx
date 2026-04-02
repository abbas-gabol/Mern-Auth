import "./SuccessModal.css";
import { CheckIcon } from "./icons";

export default function SuccessModal({ username, email, onClose }) {
  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <div className="success-modal-icon-container">
          <div className="success-modal-icon">
            <CheckIcon />
          </div>
        </div>

        <h2 className="success-modal-title">Account Created Successfully! 🎉</h2>

        <p className="success-modal-subtitle">
          Welcome, <strong>{username}</strong>!
        </p>

        <div className="success-modal-content">
          <div className="success-modal-step">
            <div className="success-modal-step-icon">✓</div>
            <div className="success-modal-step-text">
              <p className="success-modal-step-title">Account Created</p>
              <p className="success-modal-step-desc">Your account has been registered successfully</p>
            </div>
          </div>

          <div className="success-modal-step">
            <div className="success-modal-step-icon">✉</div>
            <div className="success-modal-step-text">
              <p className="success-modal-step-title">Confirmation Email Sent</p>
              <p className="success-modal-step-desc">
                Check <strong>{email}</strong> for a verification link
              </p>
            </div>
          </div>

          <div className="success-modal-step">
            <div className="success-modal-step-icon">→</div>
            <div className="success-modal-step-text">
              <p className="success-modal-step-title">Ready to Sign In</p>
              <p className="success-modal-step-desc">Use your credentials to log in to your account</p>
            </div>
          </div>
        </div>

        <div className="success-modal-footer">
          <p className="success-modal-hint">
            Redirecting to login in <span className="success-modal-countdown">3</span> seconds...
          </p>
          <button onClick={onClose} className="success-modal-btn">
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
