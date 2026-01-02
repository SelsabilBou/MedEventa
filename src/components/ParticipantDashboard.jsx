import React, { useState, useEffect } from "react";
import "./ParticipantDashboard.css";
import {
  FiClipboard,
  FiCalendar,
  FiBarChart2,
  FiAward,
} from "react-icons/fi";
import {
  Home,
  Clipboard,
  Calendar,
  BarChart2,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ParticipantDashboard = ({ registrations = [] }) => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const navigate = useNavigate();

  // State for counts calculated from registrations prop
  const [counts, setCounts] = useState({
    registrations: 0,
    certificates: 0,
    surveys: 0,
    programmes: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calculate counts from the registrations prop passed from App.jsx
    const regCount = registrations.length;

    // Programmes = upcoming events
    const today = new Date();
    const programmesCount = registrations.filter(reg => new Date(reg.date) >= today).length;

    // Certificates = completed past events
    const certificatesCount = registrations.filter(reg => reg.status === "confirmed" && new Date(reg.date) < today).length;

    // Surveys = pending surveys (using local storage fallback logic)
    const savedSurveys = JSON.parse(localStorage.getItem("participantSurveys") || "{}");
    const surveysCount = registrations.filter(reg => {
      const key = `${reg.type}_${reg.id}`;
      return !savedSurveys[key] || savedSurveys[key].status !== "completed";
    }).length;

    setCounts({
      registrations: regCount,
      certificates: certificatesCount,
      surveys: surveysCount,
      programmes: programmesCount,
    });
  }, [registrations]);

  // Card data for easier rendering
  const cards = [
    {
      id: 1,
      icon: <FiClipboard />,
      title: "My Registrations",
      description: `View and manage ${counts.registrations} registered event${counts.registrations !== 1 ? "s" : ""}.`,
      buttonText: "Go to registrations",
      route: "/participant/registrations",
      count: counts.registrations,
      iconClass: "pd-icon-1",
    },
    {
      id: 2,
      icon: <FiCalendar />,
      title: "Programmes",
      description: `Browse ${counts.programmes} programme${counts.programmes !== 1 ? "s" : ""} for your events.`,
      buttonText: "View programmes",
      route: "/participant/programme",
      count: counts.programmes,
      iconClass: "pd-icon-2",
    },
    {
      id: 3,
      icon: <FiBarChart2 />,
      title: "Surveys & Feedback",
      description: `You have ${counts.surveys} pending survey${counts.surveys !== 1 ? "s" : ""} to complete.`,
      buttonText: "Open surveys",
      route: "/participant/surveys",
      count: counts.surveys,
      iconClass: "pd-icon-3",
    },
    {
      id: 4,
      icon: <FiAward />,
      title: "My Certificates",
      description: `Download ${counts.certificates} certificate${counts.certificates !== 1 ? "s" : ""} and badge${counts.certificates !== 1 ? "s" : ""}.`,
      buttonText: "View certificates",
      route: "/participant/certificates",
      count: counts.certificates,
      iconClass: "pd-icon-4",
    },
  ];

  const handleHome = () => navigate("/");

  // Navigation menu items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/participant/dashboard",
      active: true,
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
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
      path: "/participant/certificates",
    },
  ];

  return (
    <div className="pd-wrapper-outer">
      {/* App Bar */}
      <div className="pd-appbar">
        <div className="pd-appbar-brand">
          <div className="pd-appbar-logo">ME</div>
          <span className="pd-appbar-title">MedEventa</span>
        </div>

        <button type="button" className="pd-home-btn" onClick={handleHome}>
          <Home className="pd-home-icon" />
          Back to home
        </button>
      </div>

      {/* Navigation Sidebar */}
      <nav className="pd-sidebar">
        <div className="pd-sidebar-header">
          <div className="pd-user-info">
            <div className="pd-user-avatar">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="pd-user-details">
              <span className="pd-user-name">{user?.name || "User"}</span>
              <span className="pd-user-role">Participant</span>
            </div>
          </div>
        </div>

        <div className="pd-nav-items">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pd-nav-item ${item.active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="pd-nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pd-sidebar-footer">
          <button
            type="button"
            className="pd-logout-btn"
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

      <div className="pd-main-content">
        <div className="pd-inner">
          {/* Header */}
          <header className="pd-header">
            <div>
              <h1>Participant Dashboard</h1>
              <p>
                Welcome{user?.name ? `, ${user.name}` : ""}. Manage your
                registrations, programmes, surveys and certificates from one
                place.
              </p>
            </div>

            <div className="pd-tag">Participant space</div>
          </header>

          {/* Stats Summary Bar */}
          <div className="pd-stats-summary">
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {counts.registrations}
              </span>
              <span className="pd-stat-label">Registrations</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {counts.surveys}
              </span>
              <span className="pd-stat-label">Pending Surveys</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {counts.certificates}
              </span>
              <span className="pd-stat-label">Certificates</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {counts.programmes}
              </span>
              <span className="pd-stat-label">Programmes</span>
            </div>
          </div>

          {/* Cards grid */}
          <div className="pd-grid">
            {cards.map((card) => (
              <section key={card.id} className="pd-card pd-animate">
                <div className={`pd-card-icon ${card.iconClass}`}>
                  {card.icon}
                  {card.count > 0 && (
                    <span className="pd-count-badge">{card.count}</span>
                  )}
                </div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                <button
                  type="button"
                  className="pd-btn"
                  onClick={() => navigate(card.route)}
                >
                  {card.buttonText}
                </button>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
