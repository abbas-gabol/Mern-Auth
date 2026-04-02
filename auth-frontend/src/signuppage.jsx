import { useState, useEffect } from "react";
import "./SignupPage.css";
import { GoogleIcon, EyeIcon, UserIcon, CheckIcon } from "./icons";
import SuccessModal from "./SuccessModal";
import TermsModal from "./TermsModal";

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
    <div className="signup-password-strength">
      <div className="signup-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="signup-strength-bar"
            style={{
              background: i <= strength ? colors[strength] : "#e8e8e8",
            }}
          />
        ))}
      </div>
      <span className="signup-strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function SignupPage({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ username: "", email: "" });
  const [focused, setFocused] = useState({});
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const setFocus = (field, val) => setFocused((f) => ({ ...f, [field]: val }));

  useEffect(() => {
    // Initialize Google Sign-In button
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "734641173813-6gj1gj697e04if35ke8pr8tg9fbl8glb.apps.googleusercontent.com",
        callback: handleGoogleSignUp,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignUpButton"),
        {
          theme: "filled_black",
          size: "large",
          width: "100%",
          locale: "en",
        }
      );
    }
  }, []);

  const handleGoogleSignUp = async (response) => {
    setError("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("http://localhost:5000/api/auth/google-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google sign-up failed");
        return;
      }

      // Store token and redirect
      localStorage.setItem("token", data.accessToken);
      window.location.href = "/dashboard";
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

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordMismatch) {
      setError("Passwords don't match");
      return;
    }

    if (!agreed) {
      setError("You must agree to the terms");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      // Registration successful - showing success message\n      setSuccess(true)\n      setSuccessData({ username, email })\n      setError(""); // Clear any error\n      // Redirect to login page after modal\n      setTimeout(() => {\n        onSwitchToLogin?.();\n      }, 3000);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timeout - Backend server not responding. Make sure backend is running on port 5000");
      } else if (err instanceof TypeError) {
        setError("Cannot connect to backend. Make sure backend is running: npm run dev");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-bg-noise" />

      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      {success && (
        <SuccessModal
          username={successData.username}
          email={successData.email}
          onClose={() => onSwitchToLogin?.()}
        />
      )}

      {!success && (
        <div className="signup-card">
          <div className="signup-logo-mark">
            <div className="signup-logo-inner" />
          </div>

          <h1 className="signup-heading">Create Account</h1>
          <p className="signup-subheading">Join us today — it only takes a minute</p>

          {error && <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "rgba(248,113,113,0.1)", borderRadius: "8px" }}>{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Username */}
          <div className="signup-field-group">
            <label className="signup-label">Username</label>
            <div className={`signup-input-wrap ${focused.username ? "focus" : ""}`}>
              <span className="signup-input-icon">
                <UserIcon />
              </span>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocus("username", true)}
                onBlur={() => setFocus("username", false)}
                className="signup-input"
                style={{ paddingLeft: "38px" }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="signup-field-group">
            <label className="signup-label">Email</label>
            <div className={`signup-input-wrap ${focused.email ? "focus" : ""}`}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocus("email", true)}
                onBlur={() => setFocus("email", false)}
                className="signup-input"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="signup-field-group">
            <label className="signup-label">Password</label>
            <div className={`signup-input-wrap ${focused.password ? "focus" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocus("password", true)}
                onBlur={() => setFocus("password", false)}
                className="signup-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="signup-eye-btn"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <div className="signup-field-group">
            <label className="signup-label">Confirm Password</label>
            <div
              className={`signup-input-wrap ${focused.confirm ? "focus" : ""} ${
                passwordMismatch ? "error" : ""
              } ${passwordsMatch ? "success" : ""}`}
            >
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocus("confirm", true)}
                onBlur={() => setFocus("confirm", false)}
                className="signup-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="signup-eye-btn"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {passwordMismatch && (
              <span className="signup-error-text">Passwords don't match</span>
            )}
            {passwordsMatch && (
              <span className="signup-success-text">✓ Passwords match</span>
            )}
          </div>

          {/* Terms */}
          <label className="signup-checkbox-label">
            <div
              className={`signup-checkbox ${agreed ? "checked" : ""}`}
              onClick={() => setAgreed((v) => !v)}
            >
              {agreed && <CheckIcon />}
            </div>
            <span className="signup-checkbox-text">
              I agree to the{" "}
              <a href="#" className="signup-inline-link" onClick={(e) => {
                e.preventDefault();
                setTermsModalOpen(true);
              }}>
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="#" className="signup-inline-link" onClick={(e) => {
                e.preventDefault();
                setTermsModalOpen(true);
              }}>
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="signup-btn" disabled={loading || !agreed}>
            {loading ? <span className="signup-spinner" /> : "Create Account"}
          </button>

          {/* Divider */}
          <div className="signup-divider">
            <div className="signup-divider-line" />
            <span className="signup-divider-text">or</span>
            <div className="signup-divider-line" />
          </div>

          {/* Google */}
          <div id="googleSignUpButton" style={{ width: "100%" }} />
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <a
            href="#"
            className="signup-signin-link"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin?.();
            }}
          >
            Sign In
          </a>
        </p>
        </div>
      )}
    </div>
  );
}
