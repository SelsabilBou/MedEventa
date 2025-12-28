import React from "react";
import { FaStar, FaMicrophone } from "react-icons/fa";

const EventGuestsSection = ({ guests }) => {
  return (
    <div className="ed-section-content">
      <h3 className="ed-section-subtitle">Honorary Guests</h3>
      <div className="ed-guests-grid">
        {guests.map((guest) => (
          <div key={guest.id} className="ed-guest-card">
            <div className="ed-guest-header">
              <div className="ed-guest-avatar">
                <FaStar />
              </div>
              <div className="ed-guest-title">
                <h4>{guest.name}</h4>
                <span className="ed-guest-country">{guest.country}</span>
              </div>
            </div>
            <div className="ed-guest-body">
              <p className="ed-guest-position">{guest.title}</p>
              <p className="ed-guest-org">{guest.organisation}</p>
              <div className="ed-guest-talk">
                <FaMicrophone />
                <span>{guest.talkTitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventGuestsSection;
