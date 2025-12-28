// src/components/Navbar.jsx
import React, { useState } from "react";
import "./Navbar.css";
import { FaChevronDown, FaBars, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ActivityFeed from "./ActivityFeed";

const Navbar = () => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  // NEW: controls ActivityFeed panel
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const handleAuthClick = () => {
    navigate("/login");
  };

  const handleToggleMenu = () => setOpenMenu((v) => !v);
  const handleToggleMobile = () => setOpenMobile((v) => !v);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <>
      <header className="navbar-header">
        <nav className="navbar-container">
          {/* Logo */}
          <div
            className="navbar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <div className="navbar-logo-text">
              <h1 className="navbar-logo-main">MedEventa</h1>
              <span className="navbar-logo-sub">PLATFORM</span>
            </div>
          </div>

          {/* Center menu */}
          <div className={`navbar-menu ${openMobile ? "mobile-open" : ""}`}>
            <a
              href="#home"
              className="navbar-link"
              onClick={(e) => handleNavClick(e, "/")}
            >
              Home
            </a>
            <a
              href="#events"
              className="navbar-link"
              onClick={(e) => handleNavClick(e, "/events")}
            >
              Events
            </a>
            <a
              href="#about"
              className="navbar-link"
              onClick={(e) => handleNavClick(e, "/about")}
            >
              About
            </a>
            <a
              href="#contact"
              className="navbar-link"
              onClick={(e) => handleNavClick(e, "/contact")}
            >
              Contact Us
            </a>

            {/* Logged‑in area: user + menu + bell */}
            {user && user.name && (
              <div className="navbar-user-area">
                <button
                  type="button"
                  className="navbar-user"
                  onClick={() => navigate("/profile")}
                >
                  {user.name}
                  {user.role && (
                    <span className="navbar-user-role">· {user.role}</span>
                  )}
                </button>

                {/* Existing menu pill (3-bars) */}
                <button
                  type="button"
                  className="navbar-messages-pill"
                  onClick={handleToggleMenu}
                >
                  <FaBars className="navbar-burger-icon" />
                  <span className="navbar-messages-badge">3</span>
                </button>

                {/* NEW: bell opens ActivityFeed */}
                <button
                  type="button"
                  className="navbar-messages-pill"
                  onClick={() => setIsActivityOpen(true)}
                >
                  <FaBell className="navbar-burger-icon" />
                </button>

                {openMenu && (
                  <div className="navbar-dropdown">
                    {/* Bloc réservé aux participants */}
                    {user.role === "participant" && (
                      <>
                        <button
                          type="button"
                          className="navbar-dropdown-item"
                          onClick={() => navigate("/participant/dashboard")}
                        >
                          Participant Dashboard
                        </button>

                        <button
                          type="button"
                          className="navbar-dropdown-item"
                          onClick={() => navigate("/participant/registrations")}
                        >
                          My Registrations
                        </button>

                        <button
                          type="button"
                          className="navbar-dropdown-item"
                          onClick={() => navigate("/participant/certificates")}
                        >
                          My Certificates
                        </button>

                        {/* NEW: Activity entry */}
                        <button
                          type="button"
                          className="navbar-dropdown-item"
                          onClick={() => setIsActivityOpen(true)}
                        >
                          Activity
                        </button>
                      </>
                    )}

                    {/* Profil */}
                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      Profile
                    </button>

                    {/* Messages / notifications */}
                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => navigate("/messages")}
                    >
                      Messages Inbox
                    </button>

                    {/* Langue (optionnel) */}
                    <button type="button" className="navbar-dropdown-item">
                      Language
                      <span className="navbar-lang-pill">
                        En <FaChevronDown className="navbar-chevron" />
                      </span>
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      className="navbar-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: Login (if logged out) + mobile toggle */}
          <div className="navbar-right">
            {!user && (
              <button className="navbar-login-btn" onClick={handleAuthClick}>
                Login
              </button>
            )}

            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={handleToggleMobile}
            >
              <FaBars />
            </button>
          </div>
        </nav>
      </header>

      {/* ActivityFeed panel controlled by the nav */}
      <ActivityFeed
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </>
  );
};

export default Navbar;
