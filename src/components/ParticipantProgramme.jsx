// src/components/ParticipantProgramme.jsx
import React, { useMemo } from "react";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import "./ParticipantProgramme.css";
import { useNavigate } from "react-router-dom";

const ParticipantProgramme = ({ registrations }) => {
  const navigate = useNavigate();

  // keep only upcoming workshops/sessions/events
  const upcomingByDate = useMemo(() => {
    const today = new Date();
    const upcoming = registrations.filter((reg) => {
      const d = new Date(reg.date);
      return d >= today;
    });

    // group by date string "YYYY-MM-DD"
    const map = new Map();
    for (const reg of upcoming) {
      const d = new Date(reg.date);
      const key = d.toISOString().slice(0, 10);
      const list = map.get(key) || [];
      list.push(reg);
      map.set(key, list);
    }

    // sort by date and by time inside each date (if you later add time)
    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, items]) => ({
        dateKey: key,
        dateObj: new Date(key),
        items: items,
      }));
  }, [registrations]);

  const formatDate = (d) =>
    d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleBack = () => {
    navigate("/participant/dashboard");
  };

  return (
    <div className="pp-wrapper">
      <div className="pp-inner">
        <header className="pp-header">
          <div className="pp-header-left">
            <h1>My Programme</h1>
            <p className="pp-subtitle">
              Your upcoming events, workshops and sessions, organized by day.
            </p>
          </div>

          <button type="button" className="pp-back-btn" onClick={handleBack}>
            <ArrowLeft />
            <span>Back to dashboard</span>
          </button>
        </header>

        {upcomingByDate.length === 0 && (
          <div className="pp-empty">
            No upcoming activities yet. Once you register to events or
            workshops, your programme will appear here.
          </div>
        )}

        <div className="pp-timeline">
          {upcomingByDate.map((group) => (
            <div key={group.dateKey} className="pp-day">
              {/* left column – date chip */}
              <div className="pp-day-label">
                <div className="pp-day-chip">
                  <CalendarDays className="pp-day-icon" />
                  <span>{formatDate(group.dateObj)}</span>
                </div>
              </div>

              {/* right column – vertical line + cards */}
              <div className="pp-day-content">
                <div className="pp-line" />
                <div className="pp-cards">
                  {group.items.map((reg) => (
                    <article key={reg.id} className="pp-card">
                      <div className="pp-card-header">
                        <span className="pp-type-pill">{reg.type}</span>
                        <span
                          className={`pp-status-dot pp-status-${reg.status.toLowerCase()}`}
                        />
                      </div>

                      <h2 className="pp-card-title">{reg.title}</h2>

                      {reg.parent && (
                        <p className="pp-card-parent">{reg.parent}</p>
                      )}

                      <div className="pp-card-meta">
                        <span className="pp-meta-item">
                          <Clock className="pp-meta-icon" />
                          <span>{reg.date}</span>
                        </span>
                        <span className="pp-meta-item">
                          <MapPin className="pp-meta-icon" />
                          <span>{reg.place}</span>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantProgramme;
