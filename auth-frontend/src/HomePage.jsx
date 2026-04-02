import { useEffect, useState } from "react";
import "./HomePage.css";
import TermsModal from "./TermsModal";

export default function HomePage({ onLogout, onChangePassword }) {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState("terms");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      onLogout();
      return;
    }

    setUserEmail("Logged-in User");
    // Optionally decode JWT for email if you need readable value
  }, [onLogout]);

  const onClickLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  const onClickLogoutAll = async () => {
    const confirmed = window.confirm(
      "This will log you out from all devices. Continue?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/logout-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        onLogout();
      } else {
        alert("Failed to logout from all devices");
      }
    } catch (err) {
      console.error("Logout all error:", err);
      alert("Error logging out from all devices");
    }
  };

  return (
    <div className="home-page">
      <div className="home-bg-noise" />

      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        tab={termsModalTab}
      />

      <div className="home-card">
        <div className="home-logo-mark">
          <div className="home-logo-inner" />
        </div>

        <h1 className="home-heading">Welcome Home</h1>
        <p className="home-subheading">You are signed in successfully.</p>

        <p className="home-user-info">{userEmail}</p>

        <div className="home-buttons">
          <button 
            className="home-btn settings-btn" 
            onClick={onChangePassword}
          >
            Change Password
          </button>
          <button 
            className="home-btn logout-btn" 
            onClick={onClickLogout}
          >
            Logout
          </button>
          <button 
            className="home-btn logout-all-btn" 
            onClick={onClickLogoutAll}
          >
            Logout from All Devices
          </button>
        </div>

        <div className="home-footer-links">
          <button
            className="home-footer-link"
            onClick={() => {
              setTermsModalTab("terms");
              setTermsModalOpen(true);
            }}
          >
            Terms of Service
          </button>
          <span className="home-footer-separator">·</span>
          <button
            className="home-footer-link"
            onClick={() => {
              setTermsModalTab("privacy");
              setTermsModalOpen(true);
            }}
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
