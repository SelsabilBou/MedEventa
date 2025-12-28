import React from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";

const EventInfoSection = ({ eventInfo }) => {
  return (
    <div className="ed-section-content">
      <div className="ed-info-grid">
        <div className="ed-info-card">
          <FaCalendarAlt className="ed-info-icon" />
          <h4>Dates</h4>
          <p>{eventInfo.dates}</p>
        </div>
        <div className="ed-info-card">
          <FaMapMarkerAlt className="ed-info-icon" />
          <h4>Location</h4>
          <p>{eventInfo.location}</p>
          <small>{eventInfo.address}</small>
        </div>
        <div className="ed-info-card">
          <FaBuilding className="ed-info-icon" />
          <h4>Capacity</h4>
          <p>{eventInfo.capacity}</p>
        </div>
        <div className="ed-info-card">
          <FaGlobe className="ed-info-icon" />
          <h4>Languages</h4>
          <p>{eventInfo.language}</p>
        </div>
        <div className="ed-info-card">
          <FaUsers className="ed-info-icon" />
          <h4>Accreditation</h4>
          <p>{eventInfo.accreditation}</p>
        </div>
        <div className="ed-info-card">
          <FaEnvelope className="ed-info-icon" />
          <h4>Contact</h4>
          <p>{eventInfo.contactEmail}</p>
          <small>{eventInfo.contactPhone}</small>
        </div>
      </div>
      <div className="ed-info-details">
        <h3>Description</h3>
        <p>{eventInfo.description}</p>
        <h3>Website</h3>
        <a href={`https://${eventInfo.website}`} className="ed-website-link">
          {eventInfo.website}
        </a>
      </div>
    </div>
  );
};

export default EventInfoSection;
