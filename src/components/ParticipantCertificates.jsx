import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Home,
  Calendar,
  Clipboard,
  Award,
  BarChart2,
  Search,
  SlidersHorizontal
} from "lucide-react";
import axios from "axios";
import "./ParticipantCertificates.css";
import { useNavigate } from "react-router-dom";

const ParticipantCertificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : {};

  // Fetch certificates on mount
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/attestations/me/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertificates(res.data.attestations || []);
      } catch (err) {
        console.error("Error fetching certificates", err);
        setError("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);


  const handleDownloadPDF = (cert) => {
    // Trigger backend download endpoint
    // /api/attestations/me/download?type=workshop&eventId=X&workshopId=Y
    const token = localStorage.getItem("token");
    let url = `/api/attestations/me/download?token=${token}&type=${cert.type}&eventId=${cert.evenement_id}`;
    if (cert.workshop_id) {
      url += `&workshopId=${cert.workshop_id}`;
    }
    window.open(url, '_blank');
  };

  const handleBack = () => {
    navigate("/participant/dashboard");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Filter logic
  const filteredCertificates = certificates.filter(c => {
    const title = c.type === 'workshop'
      ? (c.workshop_titre || `Workshop #${c.workshop_id}`)
      : (c.event_titre || `Event #${c.evenement_id}`);
    return title.toLowerCase().includes(search.toLowerCase());
  });

  // Navigation menu items
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
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
      path: "/participant/certificates",
      active: true,
    },
  ];

  return (
    <>
      <div className="pc-wrapper">
        {/* App Bar at the top */}
        <div className="pc-appbar">
          <div className="pc-appbar-brand">
            <div className="pc-appbar-logo">ME</div>
            <span className="pc-appbar-title">MedEventa</span>
          </div>

          <button type="button" className="pc-home-btn" onClick={handleHome}>
            <Home className="pc-home-icon" />
            Back to home
          </button>
        </div>

        {/* Navigation Sidebar */}
        <nav className="pc-sidebar">
          <div className="pc-sidebar-header">
            <div className="pc-user-info">
              <div className="pc-user-avatar">
                {user?.name?.charAt(0) || user?.prenom?.charAt(0) || "U"}
              </div>
              <div className="pc-user-details">
                <span className="pc-user-name">
                  {user?.name || `${user.prenom || ''} ${user.nom || ''}` || "User"}
                </span>
                <span className="pc-user-role">Participant</span>
              </div>
            </div>
          </div>

          <div className="pc-nav-items">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pc-nav-item ${item.active ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="pc-nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pc-sidebar-footer">
            <button
              type="button"
              className="pc-logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pc-main-content">
          <div className="pc-inner">
            <header className="pc-header">
              <div>
                <h1>My Certificates</h1>
                <p className="pc-subtitle">
                  Download your certificates of attendance for past events.
                </p>
              </div>

              <button
                type="button"
                className="pc-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft />
                <span>Back to dashboard</span>
              </button>
            </header>

            {/* search bar */}
            <div className="pc-toolbar">
              <div className="pc-search">
                <Search className="pc-search-icon" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="pc-filter-btn">
                <SlidersHorizontal />
              </button>
            </div>

            <div className="pc-table-container">
              {loading ? (
                <p style={{ padding: '2rem' }}>Loading certificates...</p>
              ) : (
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Event / Workshop</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id}>
                        <td>
                          <div className="pc-event-main">
                            <span className="pc-event-title">
                              {cert.type === 'workshop' ? cert.workshop_titre : cert.event_titre}
                            </span>
                            {cert.type === 'workshop' && (
                              <span className="pc-event-parent">
                                Event: {cert.event_titre}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`pc-status-pill ${cert.type === 'workshop' ? 'pc-status-upcoming' : 'pc-status-completed'}`}
                            style={cert.type === 'workshop' ? { background: '#e3f2fd', color: '#0d47a1' } : {}}
                          >
                            {cert.type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="pc-date-wrapper">
                            <Calendar className="pc-date-icon" />
                            <span>
                              {cert.date_generation
                                ? new Date(cert.date_generation).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pc-download-btn"
                            onClick={() => handleDownloadPDF(cert)}
                          >
                            <Download />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredCertificates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="pc-empty">
                          <div className="pc-empty-state">
                            <Award className="pc-empty-icon" />
                            <h3>No certificates found</h3>
                            <p>
                              Certificates will appear here once generated.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantCertificates;
