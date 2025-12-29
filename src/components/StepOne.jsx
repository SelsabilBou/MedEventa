import { useRef } from "react";

function StepOne({ formData, updateFormData }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateFormData("photo", file);
    }
  };

  return (
    <div className="step-content">
      <h2>Your Personal Information</h2>
      <p className="step-description">
        Please enter your personal information
      </p>

      <div className="step-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nom">
              Last name <span className="required">*</span>
            </label>
            <input
              id="nom"
              type="text"
              placeholder="Your last name"
              value={formData.nom || ""}
              onChange={(e) => updateFormData("nom", e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenom">
              First name <span className="required">*</span>
            </label>
            <input
              id="prenom"
              type="text"
              placeholder="Your first name"
              value={formData.prenom || ""}
              onChange={(e) => updateFormData("prenom", e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photo-upload">Profile photo</label>
          <div className="upload-box">
            <input
              ref={fileInputRef}
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <label htmlFor="photo-upload" className="upload-label">
              <span>
                {formData.photo ? "File selected" : "Click to upload a file"}
              </span>
            </label>
            {formData.photo && (
              <p className="file-name">{formData.photo.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepOne;
