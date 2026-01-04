import React, { useState } from "react";
import {
  FiCalendar,
  FiClipboard,
  FiUsers,
  FiBookOpen,
  FiMessageSquare,
  FiAward,
  FiPieChart,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiLayers,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardLayout.css"; // Reuse existing styles
import { hasPermission } from "../utils/permissions";

const AdminLayout = ({ children }) => {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation menu items for Organizer/Admin Space
  // Navigation menu items for different roles
  const getNavItems = () => {
    // 1. ORGANISATEUR / SUPER_ADMIN (existing links)
    if (user?.role === 'ORGANISATEUR' || user?.role === 'SUPER_ADMIN') {
      return [
        { id: "dashboard", label: "Dashboard", icon: <FiPieChart />, path: "/admin/dashboard" },
        { id: "events", label: "Manage Events", icon: <FiCalendar />, path: "/admin/events", permission: "view_all" },
        { id: "sessions", label: "Manage Sessions", icon: <FiClock />, path: "/admin/sessions", permission: "manage_program" },
        { id: "submissions", label: "Submissions", icon: <FiClipboard />, path: "/admin/submissions", permission: "view_submissions" },
        { id: "evaluations", label: "Evaluations", icon: <FiCheckCircle />, path: "/admin/evaluations", permission: "manage_evaluations" },
        { id: "programme", label: "Programme", icon: <FiLayers />, path: "/admin/programme", permission: "manage_program" },
        { id: "participants", label: "Participants", icon: <FiUsers />, path: "/admin/participants", permission: "manage_inscriptions" },
        { id: "workshops", label: "Workshops", icon: <FiBookOpen />, path: "/admin/workshops", permission: "view_workshops" },
        { id: "qa", label: "Q&A / Surveys", icon: <FiHelpCircle />, path: "/admin/qa-surveys", permission: "manage_event" },
        { id: "messages", label: "Messaging", icon: <FiMessageSquare />, path: "/admin/messages" },
        { id: "certificates", label: "Certificates", icon: <FiAward />, path: "/admin/certificates", permission: "view_attestations" },
      ];
    }

    // 2. MEMBRE_COMITE
    if (user?.role === 'MEMBRE_COMITE') {
      return [
        { id: "comm-dash", label: "Evaluations", icon: <FiCheckCircle />, path: "/committee/dashboard" },
        { id: "messages", label: "Messaging", icon: <FiMessageSquare />, path: "/messages" },
      ];
    }

    // 3. RESP_WORKSHOP
    if (user?.role === 'RESP_WORKSHOP') {
      return [
        { id: "ws-dash", label: "Workshop Manager", icon: <FiBookOpen />, path: "/workshop-manager/dashboard" },
        { id: "messages", label: "Messaging", icon: <FiMessageSquare />, path: "/messages" },
      ];
    }

    // 4. INVITE / GUEST
    if (user?.role === 'INVITE') {
      return [
        { id: "guest-dash", label: "Guest Space", icon: <FiUsers />, path: "/guest/dashboard" },
        { id: "messages", label: "Messaging", icon: <FiMessageSquare />, path: "/messages" },
      ];
    }

    // 5. COMMUNICANT (Author)
    if (user?.role === 'COMMUNICANT') {
      return [
        { id: "author-dash", label: "Author Space", icon: <FiPieChart />, path: "/author/dashboard" },
        { id: "new-sub", label: "New Submission", icon: <FiClipboard />, path: "/author/new-submission" },
        { id: "programme", label: "My Program", icon: <FiCalendar />, path: "/author/programme" },
        { id: "badges", label: "Badges", icon: <FiAward />, path: "/author/badges" },
      ];
    }

    // Default for Participants
    return [
      { id: "part-dash", label: "Dashboard", icon: <FiPieChart />, path: "/participant/dashboard" },
      { id: "events", label: "All Events", icon: <FiCalendar />, path: "/events" },
      { id: "programme", label: "Program", icon: <FiClock />, path: "/participant/programme" },
    ];
  };

  const navItems = getNavItems();

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
            <span className="dashboard-appbar-title">MedEventa {user?.role === 'ORGANISATEUR' || user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Space'}</span>
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
                (user?.prenom || user?.name || "A").charAt(0)
              )}
            </div>
            <div className="dashboard-user-details">
              <span className="dashboard-user-name">
                {user?.prenom ? `${user.prenom} ${user.nom || ""}` : (user?.name || "User")}
              </span>
              <span className="dashboard-user-role">{user?.role?.toLowerCase().replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-nav-items">
          {navItems.filter(item => !item.permission || hasPermission(user, item.permission)).map((item) => {
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

export default AdminLayout;
