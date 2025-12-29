function StepThree({ formData, updateFormData }) {
  return (
    <div className="step-content">
      <h2>Email confirmation</h2>
      <p className="step-description">
        Please enter the code sent to your email inbox
      </p>

      <div className="form-group">
        <label htmlFor="code">
          Code <span className="required">*</span>
        </label>
        <input
          id="code"
          type="text"
          placeholder="XXXXXX"
          value={formData.code || ""}
          onChange={(e) => updateFormData("code", e.target.value)}
          required
          minLength="6"
          maxLength="6"
          pattern="[0-9]{6}"
          title="The code must contain exactly 6 digits"
          autoComplete="one-time-code"
        />
      </div>
    </div>
  );
}

export default StepThree;
