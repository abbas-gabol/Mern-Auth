import { useState } from "react";
import "./ChangePasswordPage.css";
import { EyeIcon } from "./icons";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ChangePasswordPage({ onBack }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState({});

  const setFocus = (field, val) => setFocused((f) => ({ ...f, [field]: val }));

  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordMismatch) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onBack();
      }, 2000);
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
    <div className="change-password-page">
      <div className="change-password-bg-noise" />

      <div className="change-password-card">
        <button className="change-password-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 5L7 10L12 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        <div className="change-password-logo-mark">
          <div className="change-password-logo-inner" />
        </div>

        <h1 className="change-password-heading">Change Password</h1>
        <p className="change-password-subheading">Update your account password securely</p>

        {error && (
          <div
            style={{
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
              padding: "10px",
              background: "rgba(248,113,113,0.1)",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: "#34d399",
              fontSize: "13px",
              marginBottom: "16px",
              padding: "10px",
              background: "rgba(52,211,153,0.1)",
              borderRadius: "8px",
            }}
          >
            Password changed successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          {/* Current Password */}
          <div className="change-password-field-group">
            <label className="change-password-label">Current Password</label>
            <div className={`change-password-input-wrap ${focused.current ? "focus" : ""}`}>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onFocus={() => setFocus("current", true)}
                onBlur={() => setFocus("current", false)}
                className="change-password-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="change-password-eye-btn"
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="change-password-field-group">
            <label className="change-password-label">New Password</label>
            <div className={`change-password-input-wrap ${focused.new ? "focus" : ""}`}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Create a new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocus("new", true)}
                onBlur={() => setFocus("new", false)}
                className="change-password-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="change-password-eye-btn"
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="change-password-field-group">
            <label className="change-password-label">Confirm New Password</label>
            <div
              className={`change-password-input-wrap ${focused.confirm ? "focus" : ""} ${
                passwordMismatch ? "error" : ""
              } ${passwordsMatch ? "success" : ""}`}
            >
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocus("confirm", true)}
                onBlur={() => setFocus("confirm", false)}
                className="change-password-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="change-password-eye-btn"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {passwordMismatch && (
              <span className="change-password-error-text">Passwords don't match</span>
            )}
            {passwordsMatch && (
              <span className="change-password-success-text">Passwords match</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="change-password-btn" disabled={loading}>
            {loading ? <span className="change-password-spinner" /> : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
