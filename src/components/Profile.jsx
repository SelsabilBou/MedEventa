import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaStar,
  FaShieldAlt,
  FaBell,
  FaQuestionCircle,
  FaSignOutAlt,
  FaPen,
  FaFilePdf,
  FaCheckCircle,
  FaEnvelope,
  FaUniversity,
  FaFlask,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.user) {
          const u = res.data.user;
          // Harmonize fields
          u.name = `${u.prenom || ""} ${u.nom || ""}`.trim();
          u.domain = u.domaine_recherche;
          setUser(u);
          // Keep localStorage sync for other legacy components
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Fallback
        const saved = localStorage.getItem("user");
        if (saved) setUser(JSON.parse(saved));
      }
    };
    fetchProfile();
  }, []);

  const handleDownloadBadgePdf = () => {
    const badge = document.getElementById("profile-badge");
    if (!badge || !user) return;

    const opt = {
      margin: 5,
      filename: `${user.name || "profile"}-badge.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };

    html2pdf().from(badge).set(opt).save();
  };

  if (!user) {
    return (
      <div className="profile-page profile-loading">
        <p>No profile data found. Please complete inscription.</p>
        <button className="btn-back" onClick={() => navigate("/")}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Teal header */}
      <div className="profile-cover">
        <div className="cover-gradient" />

        {/* top bar: Back + PDF/Edit */}
        <div className="cover-topbar">
          <button
            type="button"
            className="cover-back-btn"
            onClick={() => navigate("/")}
          >
            ← Home
          </button>

          <div className="cover-actions">
            <button className="cover-btn" onClick={handleDownloadBadgePdf}>
              <FaFilePdf /> PDF
            </button>
            <button
              className="cover-btn"
              type="button"
              onClick={() => navigate("/profile/edit")}
            >
              <FaPen /> Edit
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="profile-header">
          <div className="avatar-wrapper">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
            <span className="status-dot" />
          </div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <div className="profile-tags">
              {user.domain && (
                <span className="tag">
                  <FaFlask /> {user.domain}
                </span>
              )}
              {user.role && (
                <span className="tag secondary">
                  <FaFileAlt /> {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="profile-main">
        {/* LEFT COLUMN: ID CARD + account */}
        <div className="left-column">
          {/* ID badge */}
          <div id="profile-badge" className="idcard-wrapper">
            <div className="idcard">
              <div className="idcard-top">
                <div className="idcard-logo">MedEventa</div>
              </div>

              <div className="idcard-photo-frame">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="idcard-photo"
                  />
                ) : (
                  <div className="idcard-photo placeholder">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="idcard-name">{user.name}</div>
              <div className="idcard-role">{user.role || "Participant"}</div>

              <div className="idcard-info">
                <div>
                  <span className="label">Email</span>
                  <span className="value">{user.email}</span>
                </div>
                <div>
                  <span className="label">Domain</span>
                  <span className="value">{user.domain || "—"}</span>
                </div>
                <div>
                  <span className="label">Institution</span>
                  <span className="value">{user.institution || "—"}</span>
                </div>
              </div>

              <div className="idcard-footer">
                <span className="dept">Scientific Events Dept.</span>
              </div>
            </div>
          </div>

          {/* small stats */}
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="card-row">
                <span className="stat-label">Papers</span>
                <FaFileAlt className="stat-icon" />
              </div>
              <span className="stat-value">0</span>
            </div>
            <div className="card stat-card">
              <div className="card-row">
                <span className="stat-label">Events</span>
                <FaCalendarAlt className="stat-icon" />
              </div>
              <span className="stat-value">0</span>
            </div>
            <div className="card stat-card">
              <div className="card-row">
                <span className="stat-label">Followers</span>
                <FaUserFriends className="stat-icon" />
              </div>
              <span className="stat-value">0</span>
            </div>
            <div className="card stat-card">
              <div className="card-row">
                <span className="stat-label">Rating</span>
                <FaStar className="stat-icon" />
              </div>
              <span className="stat-value">0.0</span>
            </div>
          </div>

          {/* Account management → reset password */}
          <div className="card account-card minimal-account-card">
            <h3 className="card-title">Account Management</h3>
            <ul className="menu-list">
              <li className="clickable-row" onClick={() => navigate("/reset")}>
                <span>
                  <FaShieldAlt /> Security &amp; Password
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: biography & research */}
        <div className="right-column">
          <div className="card bio-card">
            <div className="bio-header">
              <h2>Biography &amp; Research</h2>
              <span className="verified-chip">
                <FaCheckCircle /> Profile
              </span>
            </div>

            <div className="bio-grid">
              <div className="bio-item">
                <span className="bio-label">Full Name</span>
                <span className="bio-value">{user.name}</span>
              </div>

              <div className="bio-item">
                <span className="bio-label">Email</span>
                <span className="bio-value">
                  <FaEnvelope /> {user.email}
                </span>
              </div>

              <div className="bio-item">
                <span className="bio-label">Role</span>
                <span className="bio-value">
                  {user.role || "Not specified"}
                </span>
              </div>

              <div className="bio-item">
                <span className="bio-label">Domain</span>
                <span className="bio-value">
                  <FaFlask /> {user.domain || "Not specified"}
                </span>
              </div>

              <div className="bio-item wide">
                <span className="bio-label">Institution</span>
                <span className="bio-value">
                  <FaUniversity /> {user.institution || "Not specified"}
                </span>
              </div>
            </div>

            <div className="statement">
              <p>
                This section will grow as you participate in events, submit
                papers and complete your scientific profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
