import React, { useState } from "react";
import "./Login.css";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goSignup = () => navigate("/signup");
  const goForgot = () => navigate("/forgot");

  const handleLoginSuccess = () => {
    navigate("/"); // after login, go home (or another route if you want)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const userToStore = {
        name: user.displayName || email.split("@")[0],
        email: user.email,
        photoUrl: user.photoURL || "",
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      handleLoginSuccess();
    } catch (err) {
      console.error(err);
      setError("Incorrect email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userToStore = {
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        photoUrl: user.photoURL || "",
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      handleLoginSuccess();
    } catch (err) {
      console.error(err);
      setError("Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="login-back-home" onClick={goHome}>
        Back to home
      </button>

      {/* NEW flex layout wrapper + right image div */}
      <div className="login-layout">
        <div className="login-card">
          <h1 className="login-title">MedEventa</h1>
          <h2 className="login-subtitle">Welcome</h2>
          <p className="login-text">Sign in to your account</p>

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FaGoogle className="login-google-icon" />
            <span>Continue with Google</span>
          </button>

          <div className="login-separator">
            <span className="line" />
            <span className="or">or</span>
            <span className="line" />
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-label" htmlFor="email">
              Your email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="login-password-row">
              <label className="login-label" htmlFor="password">
                Your password
              </label>
              <button
                type="button"
                className="login-forgot-btn"
                onClick={goForgot}
              >
                Forgot password
              </button>
            </div>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-footer-text">
            Don&apos;t have an account?
            <button type="button" className="login-link-btn" onClick={goSignup}>
              Sign up
            </button>
          </p>

          <p className="login-copy">
            © EVENT PLATFORM 2025 - 2026 • All rights reserved.
          </p>
        </div>

        {/* right side image only */}
        <div className="login-image-side" />
      </div>
    </div>
  );
}

export default LoginPage;
