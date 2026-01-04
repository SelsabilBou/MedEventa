import React, { useState } from "react";
import "./ForgotPasswordPage.css";
import { FaEnvelope, FaCheck, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Failed to send reset code. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setIsSubmitted(false);
  };

  const goBackToLogin = () => navigate("/login");
  const goToResetPage = () => navigate("/reset", { state: { email } });

  return (
    <div className="forgot-password-page">
      {/* Split card */}
      <div className="forgot-container">
        {/* LEFT SECURITY PANEL */}
        <div className="forgot-card">
          <div className="icon-container">
            <FaCheck />
          </div>

          <div className="forgot-header">
            <h2 className="forgot-title">Security First Strategy</h2>
            <p className="forgot-subtitle">
              Protecting your scientific data and research is our top priority.
              Choose a robust password to ensure your identity remains yours.
            </p>
          </div>

          <div className="tips-container">
            <div className="tip-item">
              <div className="tip-bullet">✓</div>
              <span className="tip-text">Minimum 12 characters</span>
            </div>
            <div className="tip-item">
              <div className="tip-bullet">✓</div>
              <span className="tip-text">Symbols and numbers included</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="reset-style-card">
          {/* Back Button */}
          <button onClick={goBackToLogin} className="back-button">
            <FaArrowLeft className="back-arrow" />
            Back to login
          </button>

          {/* Header */}
          <div className="forgot-header">
            <h2 className="forgot-title">
              {isSubmitted ? "Email sent!" : "Reset Password"}
            </h2>
            <p className="forgot-subtitle">
              {isSubmitted
                ? "Check your inbox for the verification code."
                : "Please enter your registered email address to receive your reset code."}
            </p>
          </div>

          {/* Success State */}
          {isSubmitted ? (
            <div className="success-state">
              <div className="success-message">
                <div className="success-content">
                  <FaCheck className="success-icon" />
                  <p className="success-text">
                    A verification code was sent to <strong>{email}</strong>. It will
                    expire in 5 minutes.
                  </p>
                </div>
              </div>

              <div className="tips-container right-tips">
                <div className="tip-item right-tip-item">
                  <div className="tip-bullet small-bullet" />
                  <span className="tip-text">
                    Check your spam folder if you do not see the email.
                  </span>
                </div>
                <div className="tip-item right-tip-item">
                  <div className="tip-bullet small-bullet" />
                  <span className="tip-text">
                    The reset code is valid for 5 minutes.
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={handleReset} className="secondary-button">
                  Send again
                </button>
                <button onClick={goBackToLogin} className="primary-button">
                  Back to login
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToResetPage}
                >
                  Proceed to reset password
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="input-group">
                <label className="input-label">Registered email</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.org"
                    className="email-input"
                    disabled={isLoading}
                  />
                </div>
                <p className="input-hint">
                  You will receive a 6-digit code to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send reset code"
                )}
              </button>

              <div className="help-section">
                <p className="help-text">
                  Having trouble?{" "}
                  <a href="mailto:support@example.com" className="help-link">
                    Contact support
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
