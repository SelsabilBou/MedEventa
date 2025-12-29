// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";
import StepFour from "./components/StepFour";
import Sidebar from "./components/Sidebar";
import SuccessModal from "./components/SuccessModal";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ContactPage from "./components/ContactPage";

// participant pages
import ParticipantDashboard from "./components/ParticipantDashboard";
import ParticipantOverview from "./components/ParticipantOverview";
import ParticipantRegistrations from "./components/ParticipantRegistrations";
import ParticipantCertificates from "./components/ParticipantCertificates";
import ParticipantProgramme from "./components/ParticipantProgramme";
import ParticipantSurveys from "./components/ParticipantSurveys";
import ActivityFeed from "./components/ActivityFeed";

// events
import EventsPage from "./components/EventsPage";
import EventDetailsPage from "./components/EventDetailsPage";

// sessions
import SessionLivePage from "./components/SessionLivePage";

// messages
import Messages from "./components/Messages";

function SignupFlow() {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    photo: null,
    email: "",
    password: "",
    confirmPassword: "",
    googleAuth: false,
    photoURL: "",
    code: "",
    role: "",
    domaine: "",
    institution: "",
    acceptTerms: false,
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleNext = () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return;
    nextStep();
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return;

    let photoUrl = formData.photoURL;

    if (!photoUrl && formData.photo) {
      photoUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(formData.photo);
      });
    }

    const userToStore = {
      name: `${formData.prenom} ${formData.nom}`,
      email: formData.email,
      role: formData.role,
      domain: formData.domaine,
      institution: formData.institution,
      photoUrl,
    };

    localStorage.setItem("user", JSON.stringify(userToStore));
    setShowSuccess(true);
  };

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    navigate("/");
  };

  const renderStep = () => {
    if (step === 1) {
      return <StepOne formData={formData} updateFormData={updateFormData} />;
    }
    if (step === 2) {
      return <StepTwo formData={formData} updateFormData={updateFormData} />;
    }
    if (step === 3) {
      return <StepThree formData={formData} updateFormData={updateFormData} />;
    }
    return <StepFour formData={formData} updateFormData={updateFormData} />;
  };

  return (
    <>
      <div className="signup-wrapper">
        <div className="app-container">
          <Sidebar currentStep={step} />

          <div className="content-area">
            <form ref={formRef} className="step-content" noValidate>
              {renderStep()}
            </form>

            <div className="navigation-buttons">
              <button
                type="button"
                className="btn-previous"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </button>

              <button
                type="button"
                className="btn-next"
                onClick={step < 4 ? handleNext : handleFinish}
              >
                {step < 4 ? "Next" : "Finish signup"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && <SuccessModal onClose={handleSuccessConfirm} />}
    </>
  );
}

function App() {
  const navigate = useNavigate();

  // admin‑created events (dynamic)
  const [adminEvents] = useState([]);

  // shared participant registrations
  const STORAGE_KEY = "userRegistrations";

  // Load registrations from localStorage on mount
  const [registrations, setRegistrations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save registrations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    } catch (error) {
      console.error("Error saving registrations to localStorage:", error);
    }
  }, [registrations]);

  // Listen for registration updates
  useEffect(() => {
    const handleRegistrationUpdate = (event) => {
      const newRegistration = event.detail;

      // Check if registration already exists (avoid duplicates)
      setRegistrations((prev) => {
        const exists = prev.some(
          (reg) =>
            reg.title === newRegistration.title &&
            reg.type === newRegistration.type &&
            reg.date === newRegistration.date
        );

        if (!exists) {
          return [...prev, newRegistration];
        }
        return prev;
      });
    };

    window.addEventListener("registration-updated", handleRegistrationUpdate);

    return () => {
      window.removeEventListener(
        "registration-updated",
        handleRegistrationUpdate
      );
    };
  }, []);

  const addRegistration = (registration) => {
    setRegistrations((prev) => {
      const exists = prev.some(
        (reg) =>
          reg.title === registration.title &&
          reg.type === registration.type &&
          reg.date === registration.date
      );

      if (!exists) {
        return [...prev, registration];
      }
      return prev;
    });
  };

  return (
    <Routes>
      {/* Public pages */}
      <Route
        path="/"
        element={
          <HomePage
            onGoLogin={() => navigate("/login")}
            onGoSignup={() => navigate("/signup")}
            onGoProfile={() => navigate("/profile")}
            onGoContact={() => navigate("/contact")}
            onGoParticipantDashboard={() => navigate("/participant/dashboard")}
          />
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />

      {/* Contact */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Participant pages */}
      <Route
        path="/participant/dashboard"
        element={
          <ParticipantDashboard
            onGoRegistrations={() => navigate("/participant/registrations")}
            onGoCertificates={() => navigate("/participant/certificates")}
            onGoProgramme={() => navigate("/participant/programme")}
            onGoSurveys={() => navigate("/participant/surveys")}
            onGoOverview={() => navigate("/participant/overview")}
            onGoActivity={() => navigate("/participant/activity")}
            onGoHome={() => navigate("/")}
            onAddRegistration={addRegistration}
          />
        }
      />

      <Route
        path="/participant/registrations"
        element={<ParticipantRegistrations registrations={registrations} />}
      />

      <Route
        path="/participant/certificates"
        element={<ParticipantCertificates registrations={registrations} />}
      />

      <Route
        path="/participant/programme"
        element={<ParticipantProgramme registrations={registrations} />}
      />

      <Route
        path="/participant/surveys"
        element={<ParticipantSurveys registrations={registrations} />}
      />

      <Route path="/participant/overview" element={<ParticipantOverview />} />

      {/* Activity feed */}
      <Route path="/participant/activity" element={<ActivityFeed />} />

      {/* Signup */}
      <Route path="/signup" element={<SignupFlow />} />

      {/* Events list + details, with admin events */}
      <Route
        path="/events"
        element={<EventsPage extraEvents={adminEvents} />}
      />
      <Route path="/events/:id" element={<EventDetailsPage />} />

      {/* Sessions */}
      <Route path="/sessions/:sessionId/live" element={<SessionLivePage />} />

      {/* Messages */}
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
}

export default App;
