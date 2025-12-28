function StepFour({ formData, updateFormData }) {
  return (
    <div className="step-content">
      <h2>Professional information</h2>
      <p className="step-description">
        Please enter information about your role and your institution
      </p>

      <div className="form-group">
        <label htmlFor="role">
          Enter your role <span className="required">*</span>
        </label>
        <select
          id="role"
          value={formData.role || ""}
          onChange={(e) => updateFormData("role", e.target.value)}
          required
        >
          <option value="" disabled>
            Select your role
          </option>
          <option value="administrateur">
            Administrator (Event organizer)
          </option>
          <option value="communicant">Presenter (Author)</option>
          <option value="comite-scientifique">
            Scientific committee member
          </option>
          <option value="participant">Participant</option>
          <option value="invite-conferencier">Invited speaker</option>
          <option value="animateur-workshop">Workshop facilitator</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="domaine">
          Please enter your research field <span className="required">*</span>
        </label>
        <input
          id="domaine"
          type="text"
          placeholder="Ex: Medicine, Public Health, Pharmacology, etc."
          value={formData.domaine || ""}
          onChange={(e) => updateFormData("domaine", e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="institution">
          Enter your institution <span className="required">*</span>
        </label>
        <input
          id="institution"
          type="text"
          placeholder="Ex: University Constantine 2, Laboratory, Company, etc."
          value={formData.institution || ""}
          onChange={(e) => updateFormData("institution", e.target.value)}
          required
        />
      </div>
    </div>
  );
}

export default StepFour;
