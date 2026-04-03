import { useState, useEffect } from "react";
import "./LoginPage.css";
import { GoogleIcon, EyeIcon } from "./icons";
import TermsModal from "./TermsModal";

const API = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage({ onSwitchToSignup, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState("terms");

  useEffect(() => {
    // Initialize Google Sign-In button
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "734641173813-6gj1gj697e04if35ke8pr8tg9fbl8glb.apps.googleusercontent.com",
        callback: handleGoogleSignIn,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        {
          theme: "filled_black",
          size: "large",
          width: "100%",
          locale: "en",
        }
      );
    }
  }, []);

  const handleGoogleSignIn = async (response) => {
    setError("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API}/api/auth/google-signin`, {
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
        setError(data.message || "Google sign-in failed");
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // API call to backend
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store token and redirect
      localStorage.setItem("token", data.accessToken);
      window.location.href = "/dashboard";
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
    <div className="login-page">
      <div className="login-bg-noise" />

      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} tab={termsModalTab} />

      <div className="login-card">
        <div className="login-logo-mark">
          <div className="login-logo-inner" />
        </div>

        <h1 className="login-heading">Welcome </h1>
        <p className="login-subheading">Enter your email and password to access your account</p>

        {error && <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "rgba(248,113,113,0.1)", borderRadius: "8px" }}>{error}</div>}

        <form onSubmit={handleSignIn} className="login-form">
          {/* Email */}
          <div className="login-field-group">
            <label className="login-label">Email</label>
            <div className={`login-input-wrap ${emailFocused ? "focus" : ""}`}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="login-input"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field-group">
            <label className="login-label">Password</label>
            <div className={`login-input-wrap ${passFocused ? "focus" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                className="login-input"
                style={{ paddingRight: "44px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="login-eye-btn"
                aria-label="Toggle password"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="login-row">
            <label className="login-checkbox-label">
              <div 
                className={`login-checkbox ${rememberMe ? "checked" : ""}`}
                onClick={() => setRememberMe((v) => !v)}
              >
                {rememberMe && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="login-checkbox-text">Remember me</span>
            </label>
            <a href="#" className="login-link" onClick={(e) => {
              e.preventDefault();
              onSwitchToForgotPassword?.();
            }}>Forgot Password</a>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <div className="login-divider-line" />
          </div>

          {/* Google Sign In */}
          <div id="googleSignInButton" style={{ width: "100%" }} />
        </form>

        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <a href="#" className="login-signup-link" onClick={(e) => {
            e.preventDefault();
            onSwitchToSignup?.();
          }}>Sign Up</a>
        </p>

        <div className="login-footer-links">
          <a href="#" className="login-footer-link" onClick={(e) => {
            e.preventDefault();
            setTermsModalTab("terms");
            setTermsModalOpen(true);
          }}>Terms of Service</a>
          <span className="login-footer-separator">·</span>
          <a href="#" className="login-footer-link" onClick={(e) => {
            e.preventDefault();
            setTermsModalTab("privacy");
            setTermsModalOpen(true);
          }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
