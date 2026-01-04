// src/components/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import {
  FiClipboard,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({
    registrations: 0,
    certificates: 0,
    surveys: 0,
    programmes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!user?.id || !token) {
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [registrationsRes, surveysRes, certificatesRes, programmesRes] = await Promise.all([
          fetch(`/api/inscriptions/user/count`, { headers }),
          fetch(`/api/surveys/user/count?userId=${user.id}`, { headers }),
          fetch(`/api/attestations/user/count?userId=${user.id}`, { headers }),
          fetch(`/api/programmes/user/count?userId=${user.id}`, { headers }),
        ]);

        const registrationsData = registrationsRes.ok ? await registrationsRes.json() : { count: 0 };
        const surveysData = surveysRes.ok ? await surveysRes.json() : { count: 0 };
        const certificatesData = certificatesRes.ok ? await certificatesRes.json() : { count: 0 };
        const programmesData = programmesRes.ok ? await programmesRes.json() : { count: 0 };

        setCounts({
          registrations: registrationsData.count || 0,
          surveys: surveysData.count || 0,
          certificates: certificatesData.count || 0,
          programmes: programmesData.count || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  // Navigation menu items
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FiClipboard />,
      path: "/participant/dashboard",
      count: counts.registrations,
    },
    {
      id: "registrations",
      label: "Registrations",
      icon: <FiClipboard />,
      path: "/participant/registrations",
      count: counts.registrations,
    },
    {
      id: "programme",
      label: "Programmes",
      icon: <FiCalendar />,
      path: "/participant/programme",
      count: counts.programmes,
    },
    {
      id: "surveys",
      label: "Surveys",
      icon: <FiBarChart2 />,
      path: "/participant/surveys",
      count: counts.surveys,
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: <FiAward />,
      path: "/participant/certificates",
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

  return (
    <div className="dashboard-layout-wrapper">
      {/* App Bar at the top */}
      <div className="dashboard-appbar">
        <div className="dashboard-appbar-left">
          <button
            className="dashboard-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="dashboard-appbar-brand">
            <div className="dashboard-appbar-logo">ME</div>
            <span className="dashboard-appbar-title">MedEventa</span>
          </div>
        </div>

        <div className="dashboard-appbar-right">
          <button type="button" className="dashboard-home-btn" onClick={handleHome}>
            <FiHome className="dashboard-home-icon" />
            Back to home
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="dashboard-sidebar-header">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {(user?.photo || user?.photoUrl) ? (
                <img src={user.photo || user.photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (user?.prenom || user?.name || "U").charAt(0)
              )}
            </div>
            <div className="dashboard-user-details">
              <span className="dashboard-user-name">
                {user?.prenom ? `${user.prenom} ${user.nom || ""}` : (user?.name || "User")}
              </span>
              <span className="dashboard-user-role">Participant</span>
            </div>
          </div>
        </div>

        <div className="dashboard-nav-items">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                type="button"
                className={`dashboard-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="dashboard-nav-icon">{item.icon}</span>
                <span className="dashboard-nav-label">{item.label}</span>
                {!loading && item.count > 0 && (
                  <span className="dashboard-nav-count">{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            className="dashboard-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut className="dashboard-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-main-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

