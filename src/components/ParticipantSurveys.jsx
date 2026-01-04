import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Home,
  Calendar,
  Clipboard,
  Award,
  BarChart2,
} from "lucide-react";
import "./ParticipantSurveys.css";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "participantSurveys";

const ParticipantSurveys = ({ registrations = [] }) => {
  const navigate = useNavigate();

  // Fetch filled surveys from local storage (fallback since backend endpoint was removed)
  const [surveyState, setSurveyState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [search, setSearch] = useState("");
  const [activeSurvey, setActiveSurvey] = useState(null); // row currently filling

  // main overall rating + comment
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // extra survey fields
  const [contentRating, setContentRating] = useState(0);
  const [orgRating, setOrgRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState("yes");

  const token = localStorage.getItem("token");

  // Save to local storage whenever surveyState changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveyState));
  }, [surveyState]);

  // Map and filter registrations
  const items = registrations
    .map(reg => {
      const eventDate = new Date(reg.date);
      const today = new Date();
      const isUpcoming = eventDate > today;
      return {
        ...reg,
        isUpcoming,
        surveyStatus: surveyState[`${reg.type}_${reg.id}`]?.status || "pending"
      };
    })
    .filter(item =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );

  const handleOpenSurvey = (item) => {
    setActiveSurvey(item);
  };

  const handleSubmit = async () => {
    if (!activeSurvey) return;

    try {
      // Attempt to post to backend if endpoint exists (user might have a generic feedback endpoint)
      // If it fails, we still update the local state for demonstration
      try {
        await axios.post(`/api/events/${activeSurvey.id}/feedback`, {
          rating,
          comment,
          contentRating,
          orgRating,
          wouldRecommend
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn("Backend feedback endpoint failed, updating locally only.", e);
      }

      const surveyKey = `${activeSurvey.type}_${activeSurvey.id}`;
      const newState = {
        ...surveyState,
        [surveyKey]: {
          status: "completed",
          rating,
          comment,
          contentRating,
          orgRating,
          wouldRecommend,
        },
      };

      setSurveyState(newState);
      setActiveSurvey(null);
      setRating(0);
      setComment("");
      setContentRating(0);
      setOrgRating(0);
      setWouldRecommend("yes");
    } catch (e) {
      console.error("Failed to submit survey", e);
    }
  };

  const handleBack = () => {
    navigate("/participant/dashboard");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Navigation menu items (Matching Certificates style)
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/participant/dashboard",
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: Clipboard,
      path: "/participant/registrations",
    },
    {
      id: "programme",
      label: "Programmes",
      icon: Calendar,
      path: "/participant/programme",
    },
    {
      id: "surveys",
      label: "Surveys",
      icon: BarChart2,
      path: "/participant/surveys",
      active: true,
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
      path: "/participant/certificates",
    },
  ];

  return (
    <>
      <div className="ps-wrapper">
        {/* App Bar (Matching Certificates style) */}
        <div className="ps-appbar">
          <div className="ps-appbar-brand">
            <div className="ps-appbar-logo">ME</div>
            <span className="ps-appbar-title">MedEventa</span>
          </div>

          <button type="button" className="ps-home-btn" onClick={handleHome}>
            <Home className="ps-home-icon" />
            Back to home
          </button>
        </div>

        {/* Navigation Sidebar (Matching Certificates style) */}
        <nav className="ps-sidebar">
          <div className="ps-sidebar-header">
            <div className="ps-user-info">
              <div className="ps-user-avatar">
                {JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(0) || "U"}
              </div>
              <div className="ps-user-details">
                <span className="ps-user-name">
                  {JSON.parse(localStorage.getItem("user") || "{}")?.name || "User"}
                </span>
                <span className="ps-user-role">Participant</span>
              </div>
            </div>
          </div>

          <div className="ps-nav-items">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ps-nav-item ${item.active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="ps-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="ps-sidebar-footer">
            <button
              type="button"
              className="ps-logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="ps-main-content">
          <div className="ps-inner">
            <header className="ps-header">
              <div>
                <h1>Surveys &amp; Feedback</h1>
                <p className="ps-subtitle">
                  Your voice helps improve future events. Fill surveys for the
                  sessions and events you attended.
                </p>
              </div>

              <button type="button" className="ps-back-btn" onClick={handleBack}>
                <ArrowLeft />
                <span>Back to dashboard</span>
              </button>
            </header>

            {/* search bar */}
            <div className="ps-toolbar">
              <div className="ps-search">
                <Search className="ps-search-icon" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="ps-filter-btn">
                <SlidersHorizontal />
              </button>
            </div>

            {/* table container */}
            <div className="ps-table-container">
              <table className="ps-table">
                <thead>
                  <tr>
                    <th>Event / Session name</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>
                        <div className="ps-event-main">
                          <span className="ps-event-title">{item.title}</span>
                          {item.parent && (
                            <span className="ps-event-sub">{item.parent}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ps-date-wrapper">
                          <span className="ps-date-text">
                            {item.date
                              ? new Date(item.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="ps-type-pill">{item.type}</span>
                      </td>
                      <td>
                        {item.isUpcoming ? (
                          <span className="ps-status-pill ps-status-upcoming" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>
                            UPCOMING
                          </span>
                        ) : (
                          <span
                            className={`ps-status-pill ps-status-${item.surveyStatus}`}
                          >
                            {item.surveyStatus === "completed"
                              ? "COMPLETED"
                              : "PENDING"}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.isUpcoming ? (
                          <button className="ps-action-btn ps-action-secondary" disabled title="Available after event ends">
                            Available later
                          </button>
                        ) : item.surveyStatus === "completed" ? (
                          <button className="ps-action-btn ps-action-secondary" disabled>
                            Filled
                          </button>
                        ) : (
                          <button
                            className="ps-action-btn"
                            onClick={() => handleOpenSurvey(item)}
                          >
                            Fill survey
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="ps-empty">
                        <div className="ps-empty-state">
                          <BarChart2 className="ps-empty-icon" />
                          <h3>No surveys available yet</h3>
                          <p>Once you attend events, surveys will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* survey modal */}
      {activeSurvey && (
        <div className="ps-modal-backdrop">
          <div className="ps-modal">
            <h2>Feedback – {activeSurvey.title}</h2>
            <p className="ps-modal-desc">
              How was your experience at this event?
            </p>

            <div className="ps-q-group">
              <h3 className="ps-q-title">Overall experience</h3>
              <div className="ps-rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ps-star ${rating >= n ? "active" : ""}`}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-q-group">
              <h3 className="ps-q-title">Content quality</h3>
              <div className="ps-rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ps-star ${contentRating >= n ? "active" : ""}`}
                    onClick={() => setContentRating(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-q-group">
              <h3 className="ps-q-title">Organization</h3>
              <div className="ps-rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ps-star ${orgRating >= n ? "active" : ""}`}
                    onClick={() => setOrgRating(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-q-group">
              <h3 className="ps-q-title">Would you recommend this event?</h3>
              <div className="ps-recommend">
                <label>
                  <input
                    type="radio"
                    name="recommend"
                    value="yes"
                    checked={wouldRecommend === "yes"}
                    onChange={(e) => setWouldRecommend(e.target.value)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="recommend"
                    value="no"
                    checked={wouldRecommend === "no"}
                    onChange={(e) => setWouldRecommend(e.target.value)}
                  />
                  No
                </label>
              </div>
            </div>

            <textarea
              className="ps-textarea"
              rows={4}
              placeholder="Your comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="ps-modal-actions">
              <button
                type="button"
                className="ps-modal-btn ps-modal-secondary"
                onClick={() => setActiveSurvey(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ps-modal-btn"
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                Submit feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantSurveys;
