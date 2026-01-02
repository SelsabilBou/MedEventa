import React, { useState } from "react";
import "./ResetPassword.css";
import { FaKey, FaCheckCircle, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          nouveau_mot_de_passe: newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="reset-shell">
      <div className="reset-card-split">
        {/* LEFT PANEL */}
        <div className="reset-left">
          <div className="reset-left-icon">
            <span className="reset-shield">🛡️</span>
          </div>

          <h1 className="reset-left-title">
            Security
            <br />
            First Strategy
          </h1>

          <p className="reset-left-text">
            Protecting your scientific data and research is our top priority.
            Choose a robust password to ensure your identity remains yours.
          </p>

          <div className="reset-left-badges">
            <div className="reset-left-badge">
              <FaCheckCircle />
              <span>Minimum 12 characters</span>
            </div>
            <div className="reset-left-badge">
              <FaCheckCircle />
              <span>Symbols and Numbers included</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="reset-right">
          <h2 className="reset-right-title">Reset Password</h2>
          <p className="reset-right-subtitle">
            Enter the verification code sent to your email and your new password.
          </p>

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="reset-field-group">
              <label className="reset-label">Registered Email</label>
              <div className="reset-input-wrapper">
                <FaEnvelope className="reset-input-icon" />
                <input
                  type="email"
                  className="reset-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="reset-field-group">
              <label className="reset-label">Verification Code</label>
              <div className="reset-input-wrapper">
                <FaShieldAlt className="reset-input-icon" />
                <input
                  type="text"
                  className="reset-input"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="reset-field-group">
              <label className="reset-label">New password</label>
              <div className="reset-input-wrapper">
                <FaKey className="reset-input-icon" />
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="reset-field-group">
              <label className="reset-label">Confirm new password</label>
              <div className="reset-input-wrapper">
                <FaKey className="reset-input-icon" />
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Re‑type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="reset-submit-large" disabled={isLoading}>
              {isLoading ? "UPDATING..." : "UPDATE SECURITY CREDENTIALS"}
            </button>

            <button
              type="button"
              className="reset-back-link"
              onClick={handleBackToLogin}
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
