function Sidebar({ currentStep }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>MedEventa</h1>
        <p>Scientific events platform</p>
      </div>

      <div className="sidebar-content">
        <div className="etape-header">
          <h2>Step 0{currentStep}</h2>
          <p>Please enter accurate and complete information.</p>
        </div>

        <div className="steps-list">
          <div className={`step-item ${currentStep === 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <div className="step-label">Personal info</div>
          </div>

          <div className={`step-item ${currentStep === 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <div className="step-label">Account</div>
          </div>

          <div className={`step-item ${currentStep === 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <div className="step-label">Email confirmation</div>
          </div>

          <div className={`step-item ${currentStep === 4 ? "active" : ""}`}>
            <div className="step-number">4</div>
            <div className="step-label">Professional info</div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>© All your information is safely stored.</p>
      </div>
    </div>
  );
}

export default Sidebar;
