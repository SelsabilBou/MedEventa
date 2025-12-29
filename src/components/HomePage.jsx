import React, { useEffect } from "react";
import "./HomePage.css";
import heroImage from "../assets/hero-doctor.jpg";

import Navbar from "./NavBar";
import EventsPage from "./EventsPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import "./ContactPage.css";

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
              <p className="hero-text">professional network with MedEventa.</p>
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col">
            <h3>MedEventa</h3>
            <h4>Join our community</h4>
            <p>+213 555 605 560</p>
            <p>support@medeventa.com</p>
            <p>Platform for scientific health events.</p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <p>Discover conferences &amp; congresses</p>
            <p>Submit and track abstracts</p>
            <p>Manage registrations online</p>
          </div>

          <div className="footer-col">
            <h4>Social media</h4>
            <p>Instagram: @MedEventa</p>
            <p>Facebook: MedEventa</p>
            <p>LinkedIn: MedEventa</p>
          </div>

          <div className="footer-donate">
            <h4>Support MedEventa</h4>
            <div className="donate-box">
              <span>Support us</span>
              <button>Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
