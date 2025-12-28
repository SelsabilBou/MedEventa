import React, { useState, useEffect } from "react";
import "./ParticipantDashboard.css";
import {
  FiClipboard,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const ParticipantDashboard = () => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  // State for counts
  const [counts, setCounts] = useState({
    registrations: 0,
    certificates: 0,
    surveys: 0,
    programmes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch all counts from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        if (!user?.id || !token) {
          console.error("User ID or token not found");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // 1. Fetch registrations count (from inscription controller)
        const registrationsRes = await fetch(`/api/inscriptions/user/count`, {
          headers,
        });

        // 2. Fetch surveys count (from survey controller)
        const surveysRes = await fetch(
          `/api/surveys/user/count?userId=${user.id}`,
          {
            headers,
          }
        );

        // 3. Fetch certificates count (from attestation controller)
        const certificatesRes = await fetch(
          `/api/attestations/user/count?userId=${user.id}`,
          {
            headers,
          }
        );

        // 4. Fetch programmes count (from session/workshop controller)
        const programmesRes = await fetch(
          `/api/programmes/user/count?userId=${user.id}`,
          {
            headers,
          }
        );

        // Parse responses
        let registrationsCount = 0;
        let surveysCount = 0;
        let certificatesCount = 0;
        let programmesCount = 0;

        if (registrationsRes.ok) {
          const data = await registrationsRes.json();
          registrationsCount = data.count || 0;
        }

        if (surveysRes.ok) {
          const data = await surveysRes.json();
          surveysCount = data.count || 0;
        }

        if (certificatesRes.ok) {
          const data = await certificatesRes.json();
          certificatesCount = data.count || 0;
        }

        if (programmesRes.ok) {
          const data = await programmesRes.json();
          programmesCount = data.count || 0;
        }

        setCounts({
          registrations: registrationsCount,
          surveys: surveysCount,
          certificates: certificatesCount,
          programmes: programmesCount,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback to mock data or show error
        setCounts({
          registrations: 5,
          surveys: 2,
          certificates: 3,
          programmes: 7,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id, token]);

  // Navigation menu items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiClipboard />,
      path: "/participant/dashboard",
      active: location.pathname === "/participant/dashboard",
      count: counts.registrations,
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: <FiClipboard />,
      path: "/participant/registrations",
      active: location.pathname === "/participant/registrations",
      count: counts.registrations,
    },
    {
      id: "programme",
      label: "Programmes",
      icon: <FiCalendar />,
      path: "/participant/programme",
      active: location.pathname === "/participant/programme",
      count: counts.programmes,
    },
    {
      id: "surveys",
      label: "Surveys",
      icon: <FiBarChart2 />,
      path: "/participant/surveys",
      active: location.pathname === "/participant/surveys",
      count: counts.surveys,
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: <FiAward />,
      path: "/participant/certificates",
      active: location.pathname === "/participant/certificates",
      count: counts.certificates,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Card data for easier rendering
  const cards = [
    {
      id: 1,
      icon: <FiClipboard />,
      title: "My Registrations",
      description: `View and manage ${
        loading ? "..." : counts.registrations
      } registered event${counts.registrations !== 1 ? "s" : ""}.`,
      buttonText: "Go to registrations",
      route: "/participant/registrations",
      count: counts.registrations,
      iconClass: "pd-icon-1",
    },
    {
      id: 2,
      icon: <FiCalendar />,
      title: "Programmes",
      description: `Browse ${loading ? "..." : counts.programmes} programme${
        counts.programmes !== 1 ? "s" : ""
      } for your events.`,
      buttonText: "View programmes",
      route: "/participant/programme",
      count: counts.programmes,
      iconClass: "pd-icon-2",
    },
    {
      id: 3,
      icon: <FiBarChart2 />,
      title: "Surveys & Feedback",
      description: `You have ${
        loading ? "..." : counts.surveys
      } pending survey${counts.surveys !== 1 ? "s" : ""} to complete.`,
      buttonText: "Open surveys",
      route: "/participant/surveys",
      count: counts.surveys,
      iconClass: "pd-icon-3",
    },
    {
      id: 4,
      icon: <FiAward />,
      title: "My Certificates",
      description: `Download ${
        loading ? "..." : counts.certificates
      } certificate${counts.certificates !== 1 ? "s" : ""} and badge${
        counts.certificates !== 1 ? "s" : ""
      }.`,
      buttonText: "View certificates",
      route: "/participant/certificates",
      count: counts.certificates,
      iconClass: "pd-icon-4",
    },
  ];

  return (
    <div className="pd-wrapper">
      {/* App Bar at the top */}
      <div className="pd-appbar">
        <div className="pd-appbar-left">
          <button
            className="pd-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="pd-appbar-brand">
            <div className="pd-appbar-logo">ME</div>
            <span className="pd-appbar-title">MedEventa</span>
          </div>
        </div>

        <div className="pd-appbar-right">
          <button type="button" className="pd-home-btn" onClick={handleHome}>
            <FiHome className="pd-home-icon" />
            Back to home
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`pd-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="pd-sidebar-header">
          <div className="pd-user-info">
            <div className="pd-user-avatar">{user?.name?.charAt(0) || "U"}</div>
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
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
            >
              <span className="pd-nav-icon">{item.icon}</span>
              <span className="pd-nav-label">{item.label}</span>
              {!loading && item.count > 0 && (
                <span className="pd-nav-count">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="pd-sidebar-footer">
          <button
            type="button"
            className="pd-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut className="pd-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
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
                {loading ? "..." : counts.registrations}
              </span>
              <span className="pd-stat-label">Registrations</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {loading ? "..." : counts.surveys}
              </span>
              <span className="pd-stat-label">Pending Surveys</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {loading ? "..." : counts.certificates}
              </span>
              <span className="pd-stat-label">Certificates</span>
            </div>
            <div className="pd-stat-item">
              <span className="pd-stat-number">
                {loading ? "..." : counts.programmes}
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
                  {!loading && card.count > 0 && (
                    <span className="pd-count-badge">{card.count}</span>
                  )}
                </div>
                <h2>{card.title}</h2>
                <p>{loading ? "Loading..." : card.description}</p>
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
