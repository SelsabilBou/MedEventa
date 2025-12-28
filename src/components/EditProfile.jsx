// src/components/EditProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // read once from localStorage, outside of effect
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    role: storedUser?.role || "",
    domain: storedUser?.domain || "",
    institution: storedUser?.institution || "",
    bio: storedUser?.bio || "",
    photoUrl: storedUser?.photoUrl || "",
  });

  // effect is now only for syncing if user changes elsewhere
  useEffect(() => {
    if (!storedUser) return;
    setForm((prev) => ({
      ...prev,
      name: storedUser.name || "",
      email: storedUser.email || "",
      role: storedUser.role || "",
      domain: storedUser.domain || "",
      institution: storedUser.institution || "",
      bio: storedUser.bio || "",
      photoUrl: storedUser.photoUrl || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const goBackToProfile = () => {
    navigate("/profile");
  };

  const handleSave = (e) => {
    e.preventDefault();

    const raw = localStorage.getItem("user");
    const oldUser = raw ? JSON.parse(raw) : {};

    const newUser = {
      ...oldUser,
      name: form.name,
      email: form.email,
      role: form.role,
      domain: form.domain,
      institution: form.institution,
      bio: form.bio,
      photoUrl: form.photoUrl,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    goBackToProfile();
  };

  return (
    <div className="edit-page">
      <div className="edit-container">
        {/* header */}
        <div className="edit-topbar">
          <div>
            <h1>Update Identity</h1>
            <p>Refresh your professional presence on MedEventa.</p>
          </div>
          <button className="btn-back-edit" onClick={goBackToProfile}>
            Back to profile
          </button>
        </div>

        {/* photo section */}
        <div className="edit-card image-card">
          <div className="image-wrapper">
            <div className="image-circle">
              {form.photoUrl ? (
                <img
                  src={form.photoUrl}
                  alt={form.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "999px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span className="image-initial">
                  {form.name ? form.name[0] : "A"}
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handlePhotoSelected}
            />

            <button
              type="button"
              className="btn-change-photo"
              onClick={handleChangePhotoClick}
            >
              Change photo
            </button>
          </div>
          <p className="image-hint">PNG, JPG recommended</p>
        </div>

        {/* form */}
        <form onSubmit={handleSave} className="edit-form-grid">
          <div className="edit-card">
            <label>
              Full name
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </label>
          </div>

          <div className="edit-card">
            <label>
              Email identity
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </label>
          </div>

          <div className="edit-card">
            <label>
              Platform status
              <input
                type="text"
                placeholder="Participant / Author / Committee"
                value={form.role}
                onChange={handleChange("role")}
              />
            </label>
          </div>

          <div className="edit-card">
            <label>
              Field of research
              <input
                type="text"
                value={form.domain}
                onChange={handleChange("domain")}
              />
            </label>
          </div>

          <div className="edit-card full-width">
            <label>
              Primary institution
              <input
                type="text"
                value={form.institution}
                onChange={handleChange("institution")}
              />
            </label>
          </div>

          <div className="edit-card full-width">
            <label>
              Professional biography
              <textarea
                rows={4}
                value={form.bio}
                onChange={handleChange("bio")}
                placeholder="Briefly describe your research interests and experience."
              />
            </label>
          </div>

          <div className="edit-actions">
            <button
              type="button"
              className="btn-discard-edit"
              onClick={goBackToProfile}
            >
              Discard changes
            </button>
            <button type="submit" className="btn-save-edit">
              Save profile update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
