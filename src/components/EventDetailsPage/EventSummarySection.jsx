import React from "react";

const EventSummarySection = ({ summaryContent }) => {
  return (
    <div className="ed-section-content">
      <div className="ed-summary-content">
        <h3 className="ed-section-subtitle">Event Summary</h3>
        <div className="ed-abstract">
          <p>{summaryContent.abstract}</p>
        </div>

        <div className="ed-summary-grid">
          <div className="ed-summary-card">
            <h4>Objectives</h4>
            <ul>
              {summaryContent.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="ed-summary-card">
            <h4>Target Audience</h4>
            <ul>
              {summaryContent.targetAudience.map((audience, idx) => (
                <li key={idx}>{audience}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSummarySection;
