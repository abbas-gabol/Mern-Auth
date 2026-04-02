import { useState, useEffect } from "react";
import LoginPage from "./loginpage";
import SignupPage from "./signuppage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import HomePage from "./HomePage";
import ChangePasswordPage from "./ChangePasswordPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login"); // 'login', 'signup', 'forgot', 'reset', 'dashboard', 'changePassword'

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/dashboard" || pathname === "/home") {
      setCurrentPage("dashboard");
      return;
    }

    // Check if user landed on reset-password URL with token
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");

    if (resetToken) {
      setCurrentPage("reset");
    }
  }, []);

  return (
    <>
      {currentPage === "dashboard" ? (
        <HomePage
          onLogout={() => {
            window.history.replaceState({}, "", "/");
            setCurrentPage("login");
          }}
          onChangePassword={() => setCurrentPage("changePassword")}
        />
      ) : currentPage === "changePassword" ? (
        <ChangePasswordPage onBack={() => setCurrentPage("dashboard")} />
      ) : currentPage === "login" ? (
        <LoginPage
          onSwitchToSignup={() => setCurrentPage("signup")}
          onSwitchToForgotPassword={() => setCurrentPage("forgot")}
        />
      ) : currentPage === "signup" ? (
        <SignupPage onSwitchToLogin={() => setCurrentPage("login")} />
      ) : currentPage === "forgot" ? (
        <ForgotPasswordPage onBackToLogin={() => setCurrentPage("login")} />
      ) : (
        <ResetPasswordPage onSuccess={() => setCurrentPage("login")} />
      )}
    </>
  );
}