import React from "react";
import "./AboutPage.css";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

  const reasons = [
    {
      title: "All‑in‑One Platform",
      text: "Everything you need in one unified platform - no switching between tools.",
    },
    {
      title: "Effortlessly Simple",
      text: "Intuitive design that anyone can master in minutes.",
    },
    {
      title: "Lightning Fast",
      text: "Instant responses and processing for all your requests.",
    },
    {
      title: "Enterprise Security",
      text: "Military-grade encryption and confidentiality protocols.",
    },
    {
      title: "Accessible to All",
      text: "No technical expertise required - designed for everyone.",
    },
    {
      title: "Future-Ready",
      text: "Constantly evolving with your feedback and needs.",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Alexander Bennett",
      role: "Medical Director, Johns Hopkins",
      text: "This platform revolutionized how we manage our medical conferences. The efficiency is unmatched.",
      color: "teal",
      rating: 5,
      date: "Mar 15, 2024",
      initials: "AB",
    },
    {
      name: "Sarah Chen",
      role: "Event Manager, Mayo Clinic",
      text: "From abstract submission to post-event analytics, everything is seamless. A game-changer for healthcare events.",
      color: "teal",
      rating: 5,
      date: "Feb 28, 2024",
      initials: "SC",
    },
    {
      name: "Prof. Marcus Johnson",
      role: "Research Chair, Harvard Medical",
      text: "The security features give us peace of mind for handling sensitive medical research data.",
      color: "orange",
      rating: 5,
      date: "Apr 2, 2024",
      initials: "MJ",
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Conference Chair, Stanford Medicine",
      text: "Accessibility features make it perfect for international collaboration. Truly inclusive design.",
      color: "teal",
      rating: 5,
      date: "Jan 18, 2024",
      initials: "ER",
    },
  ];

  const stats = [
    {
      number: "500+",
      label: "Healthcare Institutions",
    },
    {
      number: "98%",
      label: "Client Satisfaction",
    },
    {
      number: "24/7",
      label: "Support Available",
    },
    {
      number: "50+",
      label: "Countries Served",
    },
  ];

  return (
    <div className="about-page">
      {/* HERO / TITLE SECTION */}
      <section className="about-hero">
        <div className="about-header">
          <div className="title-decoration">
            <div className="decoration-line" />
            <div className="decoration-dot" />
            <div className="decoration-line" />
          </div>

          <h1 className="about-title">
            6 Reasons to <span className="about-highlight">Choose</span> Us
          </h1>

          <p className="about-subtitle">
            Discover why leading healthcare institutions worldwide trust our
            platform for managing scientific events with excellence and
            precision.
          </p>

          <div className="about-underline" />
        </div>
      </section>

      {/* REASONS SECTION */}
      <section className="about-reasons-section">
        <div className="about-reasons-grid">
          {reasons.map((reason, index) => (
            <div key={reason.title} className="about-reason-card">
              <div className="card-header">
                <h3>{reason.title}</h3>
                <div className="about-reason-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <p>{reason.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="about-testimonials-section">
        <div className="section-header">
          <h2 className="section-header-title">
            Trusted by Healthcare Leaders
          </h2>
          <p className="section-header-subtitle">
            Join thousands of medical professionals who have transformed their
            event management with our platform.
          </p>
        </div>

        <div className="about-testimonials-grid">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className={`about-testimonial-card ${testimonial.color}`}
            >
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <div className="avatar-initials">{testimonial.initials}</div>
                </div>

                <div className="testimonial-info">
                  <h4 className="about-testimonial-name">{testimonial.name}</h4>
                  <p className="about-testimonial-role">{testimonial.role}</p>
                </div>

                <div className="testimonial-rating">
                  {"★".repeat(testimonial.rating)}
                </div>
              </div>

              <div className="testimonial-body">
                <div className="testimonial-quote-icon">"</div>
                <p className="about-testimonial-text">{testimonial.text}</p>
              </div>

              <div className="testimonial-footer">
                <div className="about-testimonial-date">{testimonial.date}</div>
                <div className="testimonial-verified">
                  <span className="verified-icon">✓</span> Verified
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="about-stats-section">
        {stats.map((stat) => (
          <div key={stat.label} className="about-stat-item">
            <div className="about-stat-number">{stat.number}</div>
            <div className="about-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* CTA SECTION */}
      <section className="about-cta-section">
        <div className="about-cta-container">
          <h2 className="about-cta-title">
            Ready to Elevate Your Healthcare Events?
          </h2>
          <p className="about-cta-text">
            Join the leading healthcare institutions that trust our platform for
            their medical conferences and scientific events. Experience the
            perfect blend of innovation, security, and ease of use.
          </p>
          <button
            type="button"
            className="about-cta-button"
            onClick={() => navigate("/")}
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
