import React from "react";
import {
  FaFilter,
  FaChalkboardTeacher,
  FaUsers,
  FaLayerGroup,
  FaMicrophone,
  FaMapMarkerAlt,
  FaPen,
  FaBook,
  FaUserTie,
} from "react-icons/fa";

const EventProgramSection = ({
  days,
  activeDayIndex,
  setActiveDayIndex,
  programFilter,
  setProgramFilter,
  filteredConferences,
  filteredWorkshops,
  filteredSessions,
  showConferences,
  showWorkshops,
  showSessions,
  currentUser,
  handleWorkshopRegister,
  handleSessionRegister,
}) => {
  return (
    <div className="ed-section-content">
      <div className="ed-program-controls">
        {/* Day tabs */}
        <div className="ed-day-tabs-container">
          <div className="ed-day-tabs">
            {days.map((day, idx) => (
              <button
                key={day}
                type="button"
                className={`ed-day-tab ${idx === activeDayIndex ? "active" : ""
                  }`}
                onClick={() => setActiveDayIndex(idx)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Program type filter */}
        <div className="ed-program-filter">
          <span className="ed-filter-label">
            <FaFilter /> Filter:
          </span>
          <button
            className={`ed-filter-btn ${programFilter === "all" ? "active" : ""
              }`}
            onClick={() => setProgramFilter("all")}
          >
            All
          </button>
          <button
            className={`ed-filter-btn ${programFilter === "conferences" ? "active" : ""
              }`}
            onClick={() => setProgramFilter("conferences")}
          >
            Conferences
          </button>
          <button
            className={`ed-filter-btn ${programFilter === "workshops" ? "active" : ""
              }`}
            onClick={() => setProgramFilter("workshops")}
          >
            Workshops
          </button>
          <button
            className={`ed-filter-btn ${programFilter === "sessions" ? "active" : ""
              }`}
            onClick={() => setProgramFilter("sessions")}
          >
            Sessions
          </button>
        </div>
      </div>

      <div className="ed-program-detailed">
        {/* Conferences - Only shows when filter is "all" or "conferences" */}
        {showConferences && (
          <div className="ed-program-category">
            <div className="ed-category-header">
              <h3 className="ed-program-category-title">
                <FaChalkboardTeacher /> Conferences
              </h3>
              <span className="ed-category-count">
                {filteredConferences.length} conferences
              </span>
            </div>
            {filteredConferences.length > 0 ? (
              filteredConferences.map((c) => (
                <div key={`conference-${c.id}`} className="ed-detailed-session">
                  <div className="ed-session-time-badge">{c.time}</div>
                  <div className="ed-session-content">
                    <h4>{c.title}</h4>
                    <div className="ed-session-speaker">
                      <FaMicrophone /> {c.speaker}
                    </div>
                    <div className="ed-session-location">
                      <FaMapMarkerAlt /> {c.room}
                    </div>
                    {c.description && (
                      <p className="ed-session-desc">{c.description}</p>
                    )}
                    <div className="ed-session-tag">{c.type}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="ed-empty-message">
                No conferences scheduled for this day.
              </p>
            )}
          </div>
        )}

        {/* Workshops - Only shows when filter is "all" or "workshops" */}
        {showWorkshops && (
          <div className="ed-program-category">
            <div className="ed-category-header">
              <h3 className="ed-program-category-title">
                <FaUsers /> Workshops
              </h3>
              <span className="ed-category-count">
                {filteredWorkshops.length} workshops
              </span>
            </div>
            {filteredWorkshops.length > 0 ? (
              filteredWorkshops.map((w) => (
                <div
                  key={`workshop-${w.id}`}
                  className="ed-detailed-session with-registration"
                >
                  <div className="ed-session-time-badge">{w.time}</div>
                  <div className="ed-session-content">
                    <div className="ed-session-header">
                      <h4>{w.title}</h4>
                      <span className="ed-registration-status">
                        {w.registeredCount}/{w.capacity} registered
                      </span>
                    </div>
                    <div className="ed-session-speaker">
                      <FaUserTie /> Trainer: {w.trainer}
                    </div>
                    <div className="ed-session-meta">
                      <span className="ed-meta-item">
                        <FaUsers /> {w.capacity} spots
                      </span>
                      <span className="ed-meta-item">Level: {w.level}</span>
                      <span className="ed-meta-item">
                        <FaMapMarkerAlt /> {w.room}
                      </span>
                    </div>
                    {w.description && (
                      <p className="ed-session-desc">{w.description}</p>
                    )}
                    <div className="ed-session-actions">
                      <button
                        type="button"
                        className={`ed-register-btn ${w.registeredCount >= w.capacity ? "disabled" : ""
                          }`}
                        onClick={() => handleWorkshopRegister(w)}
                        disabled={
                          w.registeredCount >= w.capacity ||
                          currentUser?.role?.toUpperCase() !== "PARTICIPANT"
                        }
                      >
                        <FaPen /> Register for Workshop
                      </button>
                      {w.registeredCount >= w.capacity && (
                        <span className="ed-full-badge">Full</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="ed-empty-message">
                No workshops scheduled for this day.
              </p>
            )}
          </div>
        )}

        {/* Sessions - Only shows when filter is "all" or "sessions" */}
        {showSessions && (
          <div className="ed-program-category">
            <div className="ed-category-header">
              <h3 className="ed-program-category-title">
                <FaLayerGroup /> Sessions
              </h3>
              <span className="ed-category-count">
                {filteredSessions.length} sessions
              </span>
            </div>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((s) => (
                <div
                  key={`session-${s.id}`}
                  className="ed-detailed-session with-registration"
                >
                  <div className="ed-session-time-badge">{s.time}</div>
                  <div className="ed-session-content">
                    <div className="ed-session-header">
                      <h4>{s.title}</h4>
                      <span className="ed-registration-status">
                        {s.registeredCount}/{s.capacity} registered
                      </span>
                    </div>
                    <div className="ed-session-speaker">
                      <FaUserTie /> Chair: {s.chair}
                    </div>
                    <div className="ed-session-meta">
                      <span className="ed-meta-item">
                        <FaMapMarkerAlt /> {s.room}
                      </span>
                      {s.count && (
                        <span className="ed-meta-item">{s.count}</span>
                      )}
                      {s.participants && (
                        <span className="ed-meta-item">{s.participants}</span>
                      )}
                      <span className="ed-session-type-tag">{s.type}</span>
                    </div>
                    {s.description && (
                      <p className="ed-session-desc">{s.description}</p>
                    )}
                    <div className="ed-session-actions">
                      <button
                        type="button"
                        className={`ed-register-btn ${s.registeredCount >= s.capacity ? "disabled" : ""
                          }`}
                        onClick={() => handleSessionRegister(s)}
                        disabled={
                          s.registeredCount >= s.capacity ||
                          currentUser?.role?.toUpperCase() !== "PARTICIPANT"
                        }
                      >
                        <FaBook /> Register for Session
                      </button>
                      {s.registeredCount >= s.capacity && (
                        <span className="ed-full-badge">Full</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="ed-empty-message">
                No sessions scheduled for this day.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventProgramSection;
