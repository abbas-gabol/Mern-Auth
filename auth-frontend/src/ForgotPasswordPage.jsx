import { useState } from "react";
import "./ForgotPasswordPage.css";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Check if email exists in backend
      const response = await fetch(`${API}/api/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Account not found");
        return;
      }

      // Email exists, show send button
      setVerified(true);
      setVerifiedEmail(email);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timeout - Backend server not responding");
      } else if (err instanceof TypeError) {
        setError("Cannot connect to backend. Make sure backend is running");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Send reset link
      const response = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verifiedEmail }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset email");
        return;
      }

      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        onBackToLogin?.();
      }, 3000);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timeout - Backend server not responding");
      } else if (err instanceof TypeError) {
        setError("Cannot connect to backend. Make sure backend is running");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-bg-noise" />

      {success && (
        <div className="forgot-password-success-modal">
          <div className="forgot-password-success-content">
            <div className="forgot-password-success-icon">✓</div>
            <h2 className="forgot-password-success-title">Check Your Email</h2>
            <p className="forgot-password-success-text">
              We've sent a password reset link to <strong>{verifiedEmail}</strong>
            </p>
            <p className="forgot-password-success-hint">
              The link will expire in 1 hour. Check your spam folder if you don't see it.
            </p>
            <button
              onClick={() => onBackToLogin?.()}
              className="forgot-password-success-btn"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {!success && (
        <div className="forgot-password-card">
          <div className="forgot-password-logo-mark">
            <div className="forgot-password-logo-inner" />
          </div>

          <h1 className="forgot-password-heading">Reset Password</h1>
          <p className="forgot-password-subheading">
            Enter your username or email
          </p>

          {error && <div className="forgot-password-error">{error}</div>}

          {/* Step 1: Email Verification */}
          {!verified && (
            <form onSubmit={handleCheckEmail} className="forgot-password-form">
              <div className="forgot-password-field-group">
                <label className="forgot-password-label">Username or Email</label>
                <div
                  className={`forgot-password-input-wrap ${
                    emailFocused ? "focus" : ""
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Enter username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="forgot-password-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="forgot-password-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="forgot-password-spinner" />
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Send Reset Link */}
          {verified && !success && (
            <form onSubmit={handleSendResetLink} className="forgot-password-form">
              <div className="forgot-password-verified-email">
                <p className="forgot-password-verified-text">
                  Email: <strong>{verifiedEmail}</strong>
                </p>
              </div>

              <button
                type="submit"
                className="forgot-password-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="forgot-password-spinner" />
                ) : (
                  "Send Reset Link"
                )}
              </button>

            </form>
          )}

          <p className="forgot-password-back-link">
            Remember your password?{" "}
            <a
              href="#"
              className="forgot-password-link"
              onClick={(e) => {
                e.preventDefault();
                onBackToLogin?.();
              }}
            >
              Back to Sign In
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
