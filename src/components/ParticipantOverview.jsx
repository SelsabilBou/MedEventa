// src/components/ParticipantOverview.jsx
import React from "react";
import "./ParticipantOverview.css";

const ParticipantOverview = () => {
  // fake stats for now
  const stats = {
    registrations: 15,
    attendedEvents: 13,
    feedbacks: 236,
    certificates: 8,
  };

  return (
    <div className="po-wrapper">
      {/* Search bar (top) */}
      <div className="po-search-bar">
        <input
          type="text"
          placeholder="Search events, sessions, speakers..."
          className="po-search-input"
        />
      </div>

      {/* Top stats cards */}
      <div className="po-stats-row">
        <div className="po-stat-card">
          <div className="po-stat-label">My Registrations</div>
          <div className="po-stat-value">{stats.registrations}</div>
          <div className="po-stat-sub">active registrations</div>
        </div>

        <div className="po-stat-card">
          <div className="po-stat-label">Attended Events</div>
          <div className="po-stat-value">{stats.attendedEvents}</div>
          <div className="po-stat-sub">events participated</div>
        </div>

        <div className="po-stat-card">
          <div className="po-stat-label">Session Feedbacks</div>
          <div className="po-stat-value">{stats.feedbacks}</div>
          <div className="po-stat-sub">survey responses</div>
        </div>

        <div className="po-stat-card">
          <div className="po-stat-label">Certificates Earned</div>
          <div className="po-stat-value">{stats.certificates}</div>
          <div className="po-stat-sub">available certificates</div>
        </div>
      </div>

      {/* Fake chart area */}
      <section className="po-chart-card">
        <h2 className="po-chart-title">Participation Engagement Performance</h2>
        <div className="po-chart-placeholder">
          <span>Chart placeholder</span>
        </div>
      </section>

      {/* Bottom spotlight */}
      <section className="po-spotlight">
        <div className="po-spotlight-icon">★</div>
        <div className="po-spotlight-text">
          <h3>Participant spotlight</h3>
          <p>Achievements and feedback update.</p>
        </div>
        <div className="po-spotlight-quote">
          “Welcome to your Participant Space. From here you can manage your
          registrations, programmes, certificates and surveys to stay engaged
          and keep learning.”
        </div>
      </section>
    </div>
  );
};

export default ParticipantOverview;
