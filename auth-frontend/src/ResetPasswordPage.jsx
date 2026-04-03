import { useState, useEffect } from "react";
import "./ResetPasswordPage.css";
import { EyeIcon } from "./icons";

const API = import.meta.env.VITE_API_BASE_URL;

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#e0e0e0", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

  if (!password) return null;

  return (
    <div className="reset-password-strength">
      <div className="reset-password-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="reset-password-strength-bar"
            style={{
              background: i <= strength ? colors[strength] : "#e8e8e8",
            }}
          />
        ))}
      </div>
      <span className="reset-password-strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function ResetPasswordPage({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");

    if (!resetToken) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    } else {
      setToken(resetToken);
    }
  }, []);

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (passwordMismatch) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      // Success - redirect to login
      setTimeout(() => {
        onSuccess?.();
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
    <div className="reset-password-page">
      <div className="reset-password-bg-noise" />

      <div className="reset-password-card">
        <div className="reset-password-logo-mark">
          <div className="reset-password-logo-inner" />
        </div>

        <h1 className="reset-password-heading">Set New Password</h1>
        <p className="reset-password-subheading">
          Enter your new password
        </p>

        {error && <div className="reset-password-error">{error}</div>}

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* New Password */}
          <div className="reset-password-field-group">
            <label className="reset-password-label">New Password</label>
            <div className={`reset-password-input-wrap ${passwordFocused ? "focus" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="reset-password-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="reset-password-eye-btn"
                aria-label="Toggle password visibility"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <div className="reset-password-field-group">
            <label className="reset-password-label">Confirm Password</label>
            <div
              className={`reset-password-input-wrap ${confirmFocused ? "focus" : ""} ${
                passwordMismatch ? "error" : ""
              } ${passwordsMatch ? "success" : ""}`}
            >
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                className="reset-password-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="reset-password-eye-btn"
                aria-label="Toggle password visibility"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {passwordMismatch && (
              <span className="reset-password-error-text">Passwords don't match</span>
            )}
            {passwordsMatch && (
              <span className="reset-password-success-text">✓ Passwords match</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading || !token || passwordMismatch}
          >
            {loading ? (
              <span className="reset-password-spinner" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="reset-password-hint">
          Password must be at least 6 characters and include a mix of letters, numbers, and special characters.
        </p>
      </div>
    </div>
  );
}
