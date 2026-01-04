// src/components/ParticipantRegistrations.jsx
import React, { useState } from "react";
import {
  Filter,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Home,
  Clipboard,
  Award,
  BarChart2,
  ArrowLeft
} from "lucide-react";
import "./ParticipantRegistrations.css";
import { useNavigate } from "react-router-dom";

const ParticipantRegistrations = ({ registrations = [] }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filteredRegistrations = registrations.filter((reg) =>
    filter === "All" ? true : reg.type === filter
  );

  const formatPaymentStatus = (reg) => {
    const status = reg.paymentStatus || reg.status;

    if (status === "paid" || status === "paye" || status === "PAID") {
      return { label: "PAID", className: "pr-status-paid" };
    }

    return { label: "NOT PAID", className: "pr-status-notpaid" };
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
      active: true,
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
    <>
      <div className="pr-wrapper-outer">
        {/* App Bar (Matching Certificates style) */}
        <div className="pr-appbar">
          <div className="pr-appbar-brand">
            <div className="pr-appbar-logo">ME</div>
            <span className="pr-appbar-title">MedEventa</span>
          </div>

          <button type="button" className="pr-home-btn" onClick={handleHome}>
            <Home className="pr-home-icon" />
            Back to home
          </button>
        </div>

        {/* Navigation Sidebar (Matching Certificates style) */}
        <nav className="pr-sidebar">
          <div className="pr-sidebar-header">
            <div className="pr-user-info">
              <div className="pr-user-avatar">
                {(JSON.parse(localStorage.getItem("user") || "{}")?.photo || JSON.parse(localStorage.getItem("user") || "{}")?.photoUrl) ? (
                  <img src={JSON.parse(localStorage.getItem("user") || "{}")?.photo || JSON.parse(localStorage.getItem("user") || "{}")?.photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="pr-user-details">
                <span className="pr-user-name">
                  {JSON.parse(localStorage.getItem("user") || "{}")?.prenom ? `${JSON.parse(localStorage.getItem("user") || "{}")?.prenom} ${JSON.parse(localStorage.getItem("user") || "{}")?.nom || ""}` : (JSON.parse(localStorage.getItem("user") || "{}")?.name || "User")}
                </span>
                <span className="pr-user-role">Participant</span>
              </div>
            </div>
          </div>

          <div className="pr-nav-items">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pr-nav-item ${item.active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="pr-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pr-sidebar-footer">
            <button
              type="button"
              className="pr-logout-btn"
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
        <div className="pr-main-content">
          <div className="pr-inner">
            {/* HEADER */}
            <header className="pr-header">
              <div className="header-content">
                <div className="header-title-row">
                  <h1>My Registrations</h1>
                  <span className="header-pill">Participant area</span>
                </div>
                <p className="header-subtitle">
                  All your registrations for events, workshops and sessions in one
                  place.
                </p>
                <div className="header-meta">
                  <div className="meta-item">
                    <CheckCircle />
                    <span>{registrations.length} registrations</span>
                  </div>
                  <div className="meta-item">
                    <Clock />
                    <span>Up to date</span>
                  </div>
                </div>
              </div>

              <button type="button" className="pr-back-btn" onClick={handleBack}>
                <ArrowLeft />
                <span>Back to dashboard</span>
              </button>
            </header>

            <div className="pr-toolbar">
              <div className="pr-filters">
                <Filter size={18} />
                {["All", "Event", "Workshop", "Session"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`pr-filter-chip ${filter === type ? "active" : ""
                      }`}
                    onClick={() => setFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <div className="pr-table-container">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Registration</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Payment status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => {
                    const payment = formatPaymentStatus(reg);
                    return (
                      <tr key={`${reg.type}-${reg.id}`}>
                        <td>
                          <div className="pr-event-main">
                            <span className="pr-event-title">{reg.title}</span>
                            {reg.parent && (
                              <span className="pr-event-parent">{reg.parent}</span>
                            )}
                            <span className="pr-event-place">
                              <MapPin className="pr-place-icon" />
                              {reg.place || "TBA"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="pr-date-wrapper">
                            <Calendar className="pr-date-icon" />
                            <span>
                              {reg.date
                                ? new Date(reg.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="pr-type-pill">{reg.type}</span>
                        </td>
                        <td>
                          <span className={`pr-status ${payment.className}`}>
                            {payment.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="pr-empty">
                        <div className="pr-empty-state">
                          <Clipboard className="pr-empty-icon" />
                          <h3>No registrations found</h3>
                          <p>You haven't registered for any {filter !== 'All' ? filter.toLowerCase() : 'events'} yet.</p>
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
    </>
  );
};

export default ParticipantRegistrations;
