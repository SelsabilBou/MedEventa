// src/components/ContactPage.jsx
import React from "react";
import { FaPhoneAlt, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa6";
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-section">
        <div className="contact-card">
          {/* LEFT SIDE – INFO + ICONS */}
          <div className="contact-left">
            <h2>Contact MedEventa anytime!</h2>
            <p>
              Do not hesitate to contact us through this box or by sending us a
              message on our social networks or by phone.
            </p>

            <ul className="contact-list">
              <li>
                <span className="contact-icon-circle">
                  <FaPhoneAlt />
                </span>
                <span>+213 555 605 560</span>
              </li>

              <li>
                <span className="contact-icon-circle">
                  <MdEmail />
                </span>
                <span>support@medeventa.com</span>
              </li>

              <li>
                <span className="contact-icon-circle">
                  <FaInstagram />
                </span>
                <span>instagram.com/MedEventa</span>
              </li>

              <li>
                <span className="contact-icon-circle">
                  <FaFacebookF />
                </span>
                <span>facebook.com/MedEventa</span>
              </li>

              <li>
                <span className="contact-icon-circle">
                  <FaLinkedinIn />
                </span>
                <span>linkedin.com/company/MedEventa</span>
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE – FORM */}
          <div className="contact-right">
            <h1>Contact us</h1>
            <p>Do you have a question or comment? Just send us a message!</p>

            <form className="contact-form">
              <div className="row">
                <div className="field">
                  <label>First name</label>
                  <input type="text" placeholder="First name" required />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input type="text" placeholder="Last name" required />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@email.com" required />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input type="tel" placeholder="+213 ..." />
                </div>
              </div>

              <div className="field">
                <label>Select a subject</label>
                <div className="radio-row">
                  <label>
                    <input type="radio" name="subject" defaultChecked />
                    Problem
                  </label>
                  <label>
                    <input type="radio" name="subject" />
                    Information
                  </label>
                  <label>
                    <input type="radio" name="subject" />
                    Other
                  </label>
                </div>
              </div>

              <div className="field">
                <label>How can we help you?</label>
                <textarea
                  rows="5"
                  placeholder="Your message"
                  required
                ></textarea>
              </div>

              <button type="submit" className="primary-btn">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
