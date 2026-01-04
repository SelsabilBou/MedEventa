import React, { useState, useEffect } from "react";
import AuthorLayout from "./AuthorLayout";
import "./NewSubmission.css";
import { FiPlus, FiUploadCloud } from "react-icons/fi";
import { FaTimes, FaSpinner, FaPaperPlane, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Notification from "./Notification";

const NewSubmission = () => {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthorList, setShowAuthorList] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    type: "oral",
    file: null,
    fileName: "",
    authorsFormatted: "",
    correspondingAuthor: "",
    email: "",
    institution: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Robust pre-fill
  useEffect(() => {
    let userData = user;
    if (!userData) {
      try {
        const raw = localStorage.getItem("user");
        if (raw) userData = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    if (userData) {
      const name = userData.name || `${userData.prenom || ""} ${userData.nom || ""}`.trim();
      setFormData(prev => ({
        ...prev,
        authorsFormatted: name,
        correspondingAuthor: name,
        email: userData.email || "",
        institution: userData.institution || "",
      }));
    }
  }, []);

  // Fetch Events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/api/events");
        if (res.data) {
          setEvents(res.data);
          // Default to first event if available
          if (res.data.length > 0) {
            setSelectedEventId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch all users for author selection
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await api.get("/api/users");
        if (response.data) {
          setAllUsers(response.data.map(u => ({
            ...u,
            name: u.name || `${u.prenom || ""} ${u.nom || ""}`.trim()
          })));
        }
      } catch (err) {
        console.error("Error fetching users for author selection:", err);
      }
    };
    fetchAllUsers();
  }, []);

  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAuthorList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showNotify = (message, type = "success") => {
    setNotify({ message, type });
  };

  const closeNotify = () => {
    setNotify({ message: "", type: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file: file, fileName: file.name }));
    }
  };

  const handleAuthorSelect = (user) => {
    const currentAuthors = formData.authorsFormatted ? formData.authorsFormatted.split(", ").filter(a => a) : [];
    if (!currentAuthors.includes(user.name)) {
      const newAuthors = [...currentAuthors, user.name].join(", ");
      setFormData(prev => ({ ...prev, authorsFormatted: newAuthors }));
    }
    setSearchTerm("");
    setShowAuthorList(false);
  };

  const removeAuthor = (authorName) => {
    const newAuthors = formData.authorsFormatted
      .split(", ")
      .filter(a => a !== authorName)
      .join(", ");
    setFormData(prev => ({ ...prev, authorsFormatted: newAuthors }));
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      showNotify("Please select an event.", "error");
      return;
    }
    if (!formData.file) {
      showNotify("Please upload an abstract file.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("titre", formData.title);
      data.append("resume", formData.abstract);
      data.append("type", formData.type);
      data.append("resumePdf", formData.file);

      data.append("authorsFormatted", formData.authorsFormatted);
      data.append("institution", formData.institution);
      data.append("correspondingAuthor", formData.correspondingAuthor);
      data.append("email", formData.email);

      const response = await api.post(`/api/events/${selectedEventId}/submissions`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      if (response.status === 201) {
        showNotify("Submission successful!");
        setTimeout(() => navigate("/author/dashboard"), 2000);
      }
    } catch (err) {
      console.error("Submission failed", err);
      showNotify(err.response?.data?.message || "Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthorLayout title="New Submission">
      <div className="new-submission-container">
        <div className="ns-card">
          <form className="ns-form" onSubmit={handleSubmit}>
            <div className="ns-form-header">
              <h2>Submit New Abstract</h2>
              <p>Fill in the details for your scientific communication</p>
            </div>

            <div className="ns-form-grid">
              <div className="ns-section">
                <div className="ns-section-header">
                  <FiPlus /> General Information
                </div>

                <div className="ns-field">
                  <label>Select Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                  >
                    <option value="">-- Select an Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.titre || ev.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ns-field">
                  <label>Title of Communication</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter the title of your abstract"
                    required
                  />
                </div>

                <div className="ns-field">
                  <label>Type of Presentation</label>
                  <div className="ns-radio-group">
                    <label className={`ns-radio ${formData.type === "oral" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="type"
                        value="oral"
                        checked={formData.type === "oral"}
                        onChange={handleInputChange}
                      />
                      Oral Presentation
                    </label>
                    <label className={`ns-radio ${formData.type === "poster" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="type"
                        value="poster"
                        checked={formData.type === "poster"}
                        onChange={handleInputChange}
                      />
                      Poster Presentation
                    </label>
                  </div>
                </div>

                <div className="ns-field">
                  <label>Abstract Summary</label>
                  <textarea
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your work..."
                    rows="5"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="ns-section">
                <div className="ns-section-header">
                  <FiPlus /> Authors & Institution
                </div>

                <div className="ns-field">
                  <label>Authors (Select authors from database)</label>
                  <div className="ns-author-select-wrapper" style={{ position: "relative" }} ref={dropdownRef}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search or choose authors..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowAuthorList(true);
                        }}
                        onFocus={() => setShowAuthorList(true)}
                        autoComplete="off"
                        style={{ paddingRight: "30px" }}
                      />
                      <FaChevronDown
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#999",
                          pointerEvents: "none"
                        }}
                      />
                    </div>

                    {showAuthorList && (
                      <div className="ns-author-dropdown" style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #e2e8f0"
                      }}>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <div
                              key={user.id}
                              className="ns-author-option"
                              onClick={() => handleAuthorSelect(user)}
                              style={{
                                padding: "10px 15px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f8fafc"
                              }}
                            >
                              <div style={{ fontWeight: "500" }}>{user.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{user.email}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "10px 15px", color: "#94a3b8" }}>No users found</div>
                        )}
                      </div>
                    )}

                    <div className="ns-selected-authors" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {formData.authorsFormatted && formData.authorsFormatted.split(", ").filter(a => a).map((author, idx) => (
                        <span key={idx} className="ns-author-tag" style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          border: "1px solid #e2e8f0"
                        }}>
                          {author}
                          <FaTimes
                            style={{ cursor: "pointer", fontSize: "0.7rem", color: "#94a3b8" }}
                            onClick={() => removeAuthor(author)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ns-field">
                  <label>Institution / Organization</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="ns-field">
                  <label>Corresponding Author</label>
                  <input
                    type="text"
                    name="correspondingAuthor"
                    value={formData.correspondingAuthor}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="ns-field">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="ns-field ns-upload-field">
                  <label>Full Abstract PDF</label>
                  <div className={`ns-upload-box ${formData.file ? "has-file" : ""}`}>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <FiUploadCloud />
                      <span>{formData.fileName || "Upload PDF or Word Document"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="ns-form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate("/author/dashboard")}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? "Processing..." : "Submit Abstract"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {notify.message && (
        <Notification
          message={notify.message}
          type={notify.type}
          onClose={closeNotify}
        />
      )}
    </AuthorLayout>
  );
};

export default NewSubmission;
