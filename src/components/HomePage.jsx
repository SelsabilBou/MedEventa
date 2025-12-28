import React, { useEffect } from "react";
import "./HomePage.css";
import heroImage from "../assets/hero-doctor.jpg";

import Navbar from "./NavBar";
import EventsPage from "./EventsPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDiscoverEvents = () => scrollToId("events");

  const handleWatchVideo = () => {
    window.open("https://www.youtube.com/watch?v=0jRrBxUF5Ms", "_blank");
  };

  return (
    <div className="homepage">
      {/* floating dots background */}
      <div className="dots-pattern">
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
        <div className="dot dot-4" />
        <div className="dot dot-5" />
        <div className="dot dot-6" />
        <div className="dot dot-7" />
      </div>

      {/* Navbar now handles routing itself (via useNavigate) */}
      <Navbar />

      <main className="hero-section" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-highlight">Find</span> the best Events
              <br />
              to execute your
              <br />
              creative ideas!
            </h1>

            <div className="hero-text-block">
              <p className="hero-text">
                Discover scientific health events, submit your
              </p>
              <p className="hero-text">
                articles, participate in conferences and expand your
              </p>
              <p className="hero-text">
                professional network with MedEventa.
              </p>
            </div>

            <div className="hero-buttons">
              <button
                type="button"
                className="btn-primary"
                onClick={handleDiscoverEvents}
              >
                <span className="btn-icon-circle">
                  <span className="arrow-icon" />
                </span>
                Discover our EVENTS
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleWatchVideo}
              >
                <span className="btn-icon-play" />
                Watch video
              </button>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="image-container">
              <div className="white-circle" />
              <div className="image-frame">
                <img
                  src={heroImage}
                  alt="Doctor with laptop"
                  className="doctor-image"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="events">
        <EventsPage />
      </section>

      <section id="about">
        <AboutPage />
      </section>

      <section id="contact">
        <ContactPage />
      </section>
    </div>
  );
};

export default HomePage;
