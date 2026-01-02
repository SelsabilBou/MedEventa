import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function StepTwo({ formData, updateFormData }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      updateFormData("email", user.email);
      updateFormData("nom", user.displayName?.split(" ")[1] || "");
      updateFormData("prenom", user.displayName?.split(" ")[0] || "");
      updateFormData("googleAuth", true);
      updateFormData("photoURL", user.photoURL);
    } catch (error) {
      console.error("Google login error:", error);
      alert("Failed to sign in with Google");
    }
  };

  return (
    <div className="step-content">
      <h2>Signup</h2>
      <p className="step-description">
        Please enter your email and create a password
      </p>

      <div className="form-group full-width">
        <label htmlFor="email">
          Email <span className="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Your email"
          value={formData.email || ""}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
          autoComplete="email"
          disabled={formData.googleAuth}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">
            Password <span className="required">*</span>
          </label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••••••••"
              value={formData.password || ""}
              onChange={(e) => updateFormData("password", e.target.value)}
              required={!formData.googleAuth}
              minLength="8"
              autoComplete="new-password"
              disabled={formData.googleAuth}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Show/hide password"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p
            className="password-hint"
            style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}
          >
            Must have at least 8 chars, 1 uppercase, 1 lowercase, and 1 number.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Confirm password <span className="required">*</span>
          </label>
          <div className="password-input">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••••••••••"
              value={formData.confirmPassword || ""}
              onChange={(e) =>
                updateFormData("confirmPassword", e.target.value)
              }
              required={!formData.googleAuth}
              minLength="8"
              autoComplete="new-password"
              disabled={formData.googleAuth}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Show/hide password"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="terms"
          checked={formData.acceptTerms || false}
          onChange={(e) => updateFormData("acceptTerms", e.target.checked)}
          required
        />
        <label htmlFor="terms">
          I have read and accept the different terms of use{" "}
          <span className="required">*</span>
        </label>
      </div>

      <button type="button" className="google-btn" onClick={handleGoogleLogin}>
        {/* Google SVG unchanged */}
        <span className="google-btn-label">Sign in with Google</span>
      </button>
    </div>
  );
}

export default StepTwo;
