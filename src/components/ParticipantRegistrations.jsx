import React, { useState } from "react";
import {
  ArrowLeft,
  Filter,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
} from "lucide-react";
import "./ParticipantRegistrations.css";
import { useNavigate } from "react-router-dom";

const ParticipantRegistrations = ({ registrations }) => {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredRegistrations = registrations.filter((reg) =>
    filter === "All" ? true : reg.type === filter
  );

  const handleBack = () => {
    navigate("/participant/dashboard");
  };

  const formatPaymentStatus = (reg) => {
    const status = reg.paymentStatus || reg.status;

    if (status === "paid" || status === "paye" || status === "PAID") {
      return { label: "PAID", className: "pr-status-paid" };
    }

    return { label: "NOT PAID", className: "pr-status-notpaid" };
  };

  return (
    <div className="pr-wrapper">
      <div className="floating-element" />
      <div className="floating-element" />

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
                <span>{registrations.length} total registrations</span>
              </div>
              <div className="meta-item">
                <Clock />
                <span>Stay up to date with your program</span>
              </div>
            </div>
          </div>

          <div className="pr-header-right">
            <div className="pr-filters">
              <Filter />
              {["All", "Event", "Workshop", "Session"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`pr-filter-chip ${
                    filter === type ? "active" : ""
                  }`}
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <button type="button" className="pr-back-btn" onClick={handleBack}>
              <ArrowLeft />
              <span>Back to dashboard</span>
            </button>
          </div>
        </header>

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
                  <tr key={reg.id}>
                    <td>
                      <div className="pr-event-main">
                        <span className="pr-event-title">{reg.title}</span>
                        {reg.parent && (
                          <span className="pr-event-parent">{reg.parent}</span>
                        )}
                        <span className="pr-event-place">
                          <MapPin className="pr-place-icon" />
                          {reg.place}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="pr-date-wrapper">
                        <Calendar className="pr-date-icon" />
                        <span>{reg.date}</span>
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
                    No registrations yet for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParticipantRegistrations;
