import React from "react";
import { FaUserTie } from "react-icons/fa";

const EventCommitteeSection = ({ committeeMembers }) => {
  return (
    <div className="ed-section-content">
      <h3 className="ed-section-subtitle">Scientific Committee</h3>
      <div className="ed-committee-grid">
        {committeeMembers.map((member, index) => (
          <div key={`${member.id}-${index}`} className="ed-committee-card">
            <div className="ed-committee-avatar">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="ed-committee-img" />
              ) : (
                <FaUserTie />
              )}
            </div>
            <h4>{member.name}</h4>
            <p className="ed-committee-role">{member.role}</p>
            <p className="ed-committee-org">{member.organisation}</p>
            <p className="ed-committee-specialty">{member.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCommitteeSection;
