// src/components/ParticipantProgramme.jsx
import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Clock,
  MapPin,
  ExternalLink,
  Home,
  Calendar,
  Clipboard,
  Award,
  BarChart2,
  ArrowLeft
} from "lucide-react";
import "./ParticipantProgramme.css";
import { useNavigate } from "react-router-dom";

const ParticipantProgramme = ({ registrations: propRegistrations = [] }) => {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramme = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/inscriptions/my-programme", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgramme(response.data.programme || []);
      } catch (error) {
        console.error("Error fetching programme:", error);
        // Fallback to prop registrations if backend fails
        setProgramme(propRegistrations);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramme();
  }, [propRegistrations]);

  // No longer needed advanced date grouping since we structure by Event
  // But we might want to sort events by date
  const eventsList = useMemo(() => {
    return (programme || []).sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));
  }, [programme]);

  const [expandedEventId, setExpandedEventId] = useState(null);

  const toggleEvent = (id) => {
    if (expandedEventId === id) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(id);
    }
  };

  const formatEventDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });

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
      active: true,
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
      <div className="pp-wrapper">
        {/* App Bar */}
        <div className="pp-appbar">
          <div className="pp-appbar-brand">
            <div className="pp-appbar-logo">ME</div>
            <span className="pp-appbar-title">MedEventa</span>
          </div>

          <button type="button" className="pp-home-btn" onClick={handleHome}>
            <Home className="pp-home-icon" />
            Back to home
          </button>
        </div>

        {/* Navigation Sidebar */}
        <nav className="pp-sidebar">
          <div className="pp-sidebar-header">
            <div className="pp-user-info">
              <div className="pp-user-avatar">
                {(JSON.parse(localStorage.getItem("user") || "{}")?.photo || JSON.parse(localStorage.getItem("user") || "{}")?.photoUrl) ? (
                  <img src={JSON.parse(localStorage.getItem("user") || "{}")?.photo || JSON.parse(localStorage.getItem("user") || "{}")?.photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="pp-user-details">
                <span className="pp-user-name">
                  {JSON.parse(localStorage.getItem("user") || "{}")?.prenom ? `${JSON.parse(localStorage.getItem("user") || "{}")?.prenom} ${JSON.parse(localStorage.getItem("user") || "{}")?.nom || ""}` : (JSON.parse(localStorage.getItem("user") || "{}")?.name || "User")}
                </span>
                <span className="pp-user-role">Participant</span>
              </div>
            </div>
          </div>

          <div className="pp-nav-items">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pp-nav-item ${item.active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="pp-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pp-sidebar-footer">
            <button
              type="button"
              className="pp-logout-btn"
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
        <div className="pp-main-content">
          <div className="pp-inner">
            <header className="pp-header">
              <div className="pp-header-left">
                <h1>My Programme</h1>
                <p className="pp-subtitle">
                  Your upcoming events. Click on an event to see your full schedule.
                </p>
              </div>

              <button type="button" className="pp-back-btn" onClick={handleBack}>
                <ArrowLeft />
                <span>Back to dashboard</span>
              </button>
            </header>

            {eventsList.length === 0 && !loading && (
              <div className="pp-empty">
                <div className="pp-empty-state">
                  <Calendar className="pp-empty-icon" />
                  <h3>No upcoming activities yet</h3>
                  <p>
                    Once you register to events or workshops, your programme will
                    appear here.
                  </p>
                </div>
              </div>
            )}

            <div className="pp-events-list">
              {eventsList.map((event) => (
                <div key={event.id} className="pp-event-card-wrapper">
                  <div
                    className={`pp-event-card ${expandedEventId === event.id ? 'expanded' : ''}`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div className="pp-event-summary">
                      <div className="pp-date-badge">
                        <span className="pp-date-day">{new Date(event.date_debut).getDate()}</span>
                        <span className="pp-date-month">
                          {new Date(event.date_debut).toLocaleDateString("en-GB", { month: 'short' })}
                        </span>
                      </div>
                      <div className="pp-event-info">
                        <h2 className="pp-event-title">{event.title}</h2>
                        <div className="pp-event-meta">
                          <span className="pp-meta-item">
                            <MapPin size={14} /> {event.place}
                          </span>
                          <span className="pp-meta-item">
                            <Clock size={14} /> {formatEventDate(event.date_debut)} - {formatEventDate(event.date_fin)}
                          </span>
                        </div>
                      </div>
                      <div className="pp-event-status">
                        <span className={`pp-status-pill status-${event.status?.toLowerCase() || 'confirmed'}`}>
                          {event.status === 'a_payer' ? 'Payment Pending' : 'Confirmed'}
                        </span>
                        <span className="pp-expand-hint">
                          {expandedEventId === event.id ? 'Hide Program' : 'View Program'}
                        </span>
                      </div>
                    </div>

                    {expandedEventId === event.id && (
                      <div className="pp-event-details">
                        <h3 className="pp-details-heading">My Schedule</h3>
                        {event.items && event.items.length > 0 ? (
                          <div className="pp-timeline-items">
                            {event.items.map((item) => (
                              <div key={`${item.type}-${item.id}`} className="pp-timeline-item">
                                <div className="pp-time-col">
                                  <span className="pp-time-start">{formatTime(item.date)}</span>
                                </div>
                                <div className="pp-content-col">
                                  <div className="pp-item-card">
                                    <div className="pp-item-header">
                                      <span className={`pp-type-badge ${item.type.toLowerCase()}`}>
                                        {item.type}
                                      </span>
                                      {item.place && <span className="pp-item-room">Room: {item.place}</span>}
                                    </div>
                                    <h4 className="pp-item-title">{item.title}</h4>
                                    {item.responsable_nom && (
                                      <div className="pp-item-speaker">
                                        with {item.responsable_prenom} {item.responsable_nom}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="pp-no-items">No specific sessions or workshops scheduled yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantProgramme;
