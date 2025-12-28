import React from "react";
import "./ResetPassword.css";
import { FaKey, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: add real reset logic / API
    alert("Password updated (demo).");
    navigate("/login");
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
            Please enter your current and new credentials.
          </p>

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="reset-field-group">
              <label className="reset-label">Current password</label>
              <div className="reset-input-wrapper">
                <FaKey className="reset-input-icon" />
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Current password"
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
                  required
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
                  required
                />
              </div>
            </div>

            <button type="submit" className="reset-submit-large">
              UPDATE SECURITY CREDENTIALS
            </button>

            <div className="reset-meta">
              <span className="reset-meta-label">Last changed:</span>
              <span className="reset-meta-value">3 months ago</span>
            </div>

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
