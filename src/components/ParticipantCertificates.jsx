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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ParticipantCertificates.css";
import CertificatePreview from "./CertificatePreview";
import { useNavigate } from "react-router-dom";

const ParticipantCertificates = ({ registrations }) => {
  const navigate = useNavigate();

  // Show all registrations, but handle status display
  const certificateItems = registrations
    .map(reg => {
      const eventDate = new Date(reg.date);
      const today = new Date();
      // If date is invalid, assume it's past so they can get cert if needed (or handle error)
      const isUpcoming = !isNaN(eventDate) && eventDate > today;
      return { ...reg, isUpcoming };
    });

  const [activeCertificate, setActiveCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);
  const [search, setSearch] = useState(""); // Added search state

  const handleDownload = async (item) => {
    // Set the active certificate to trigger the useEffect for download
    setActiveCertificate(item);
  };

  // Trigger download when activeCertificate changes
  useEffect(() => {
    if (activeCertificate) {
      const generate = async () => {
        setDownloading(true);
        try {
          // small delay to allow render
          await new Promise((r) => setTimeout(r, 500));
          const element = certRef.current;
          if (!element) {
            console.error("Certificate preview element not found.");
            return;
          }
          const canvas = await html2canvas(element, {
            scale: 2, // better resolution
            useCORS: true,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("l", "mm", "a4"); // landscape
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save(`Certificate_${activeCertificate.title}.pdf`);
        } catch (e) {
          console.error("Certificate generation failed", e);
        } finally {
          setDownloading(false);
          setActiveCertificate(null); // reset
        }
      };
      generate();
    }
  }, [activeCertificate]);

  const handleBack = () => {
    navigate("/participant/dashboard");
  };

  const handleHome = () => {
    navigate("/");
  };

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
      {/* hidden certificate used only for PDF capture */}
      <div style={{ position: "fixed", top: -9999, left: -9999 }}>
        {activeCertificate && (
          <CertificatePreview
            ref={certRef}
            participantName={JSON.parse(localStorage.getItem("user") || "{}")?.name || "Participant"}
            eventTitle={activeCertificate.title}
            date={activeCertificate.date}
          />
        )}
      </div>

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
                {JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(
                  0
                ) || "U"}
              </div>
              <div className="pc-user-details">
                <span className="pc-user-name">
                  {JSON.parse(localStorage.getItem("user") || "{}")?.name ||
                    "User"}
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
                localStorage.removeItem("user");
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
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Event / Workshop</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {certificateItems.map((reg) => (
                    <tr key={`${reg.type}-${reg.id}`}>
                      <td>
                        <div className="pc-event-main">
                          <span className="pc-event-title">{reg.title}</span>
                          {reg.parent && (
                            <span className="pc-event-parent">
                              {reg.parent}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="pc-date-wrapper">
                          <Calendar className="pc-date-icon" />
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
                        {reg.isUpcoming ? (
                          <span className="pc-status-pill pc-status-upcoming" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>
                            UPCOMING
                          </span>
                        ) : (
                          <span className="pc-status-pill pc-status-completed">
                            READY
                          </span>
                        )}
                      </td>
                      <td>
                        {reg.isUpcoming ? (
                          <button className="pc-action-btn pc-action-secondary" disabled title="Available after event ends">
                            Available later
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pc-download-btn"
                            onClick={() => handleDownload(reg)}
                            disabled={downloading}
                          >
                            <Download />
                            <span>Download PDF</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {certificateItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="pc-empty">
                        <div className="pc-empty-state">
                          <Award className="pc-empty-icon" />
                          <h3>No certificates available yet</h3>
                          <p>
                            Certificates will appear here once an event is
                            finished and your registration is confirmed.
                          </p>
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

export default ParticipantCertificates;
