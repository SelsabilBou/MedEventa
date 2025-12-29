import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Download,
  Home,
  Calendar,
  Clipboard,
  Award,
  BarChart2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ParticipantCertificates.css";
import CertificatePreview from "./CertificatePreview";
import { useNavigate } from "react-router-dom";

const ParticipantCertificates = ({ registrations }) => {
  const navigate = useNavigate();

  // only confirmed registrations with past dates
  const certificateItems = registrations.filter((reg) => {
    if (reg.status !== "confirmed") return false;
    const eventDate = new Date(reg.date); // expects parsable date string
    const today = new Date();
    return eventDate < today;
  });

  const [currentCert, setCurrentCert] = useState(null);
  const certRef = useRef(null);

  const handleDownload = async (reg) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const participantName = user.name || "Participant";

    // set data for hidden certificate
    setCurrentCert({
      participantName,
      title: reg.title,
      date: reg.date,
    });

    // let React render the hidden component
    requestAnimationFrame(async () => {
      if (!certRef.current) return;

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${reg.title}-certificate.pdf`);
    });
  };

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
        {currentCert && (
          <CertificatePreview
            ref={certRef}
            participantName={currentCert.participantName}
            eventTitle={currentCert.title}
            date={currentCert.date}
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
              <div className="pc-header-content">
                <div className="pc-header-title-row">
                  <h1>My Certificates</h1>
                  <span className="pc-header-pill">Download PDFs</span>
                </div>
                <p className="pc-subtitle">
                  Download certificates for events and workshops you have
                  successfully attended.
                </p>

                <div className="pc-header-meta">
                  <div className="pc-meta-item">
                    <Award />
                    <span>
                      {certificateItems.length} available certificates
                    </span>
                  </div>
                  <div className="pc-meta-item">
                    <Download />
                    <span>Ready to download</span>
                  </div>
                </div>
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
                    <tr key={reg.id}>
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
                          <span>{reg.date}</span>
                        </div>
                      </td>
                      <td>
                        <span className="pc-status-pill pc-status-completed">
                          COMPLETED
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="pc-download-btn"
                          onClick={() => handleDownload(reg)}
                        >
                          <Download />
                          <span>Download PDF</span>
                        </button>
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
