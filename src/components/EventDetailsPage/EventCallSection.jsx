import React from "react";
import {
  FaPaperPlane,
  FaUpload,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFilePdf,
  FaInfoCircle,
  FaChevronDown,
} from "react-icons/fa";

const EventCallSection = (props) => {
  const {
    callForPapers,
    showSubmissionForm,
    setShowSubmissionForm,
    submissionSuccess,
    submissionError,
    submissionForm,
    handleSubmissionChange,
    handleSubmitSubmission,
    loading,
    isAuthor = false,
    allUsers = [],
  } = props;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showAuthorList, setShowAuthorList] = React.useState(false);

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAuthorSelect = (user) => {
    const currentAuthors = submissionForm.authors ? submissionForm.authors.split(", ").filter(a => a) : [];
    if (!currentAuthors.includes(user.name)) {
      const newAuthors = [...currentAuthors, user.name].join(", ");
      handleSubmissionChange({ target: { name: "authors", value: newAuthors } });
    }
    setSearchTerm("");
    setShowAuthorList(false);
  };

  const removeAuthor = (authorName) => {
    const newAuthors = submissionForm.authors
      .split(", ")
      .filter(a => a !== authorName)
      .join(", ");
    handleSubmissionChange({ target: { name: "authors", value: newAuthors } });
  };

  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
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
  return (
    <div className="ed-section-content">
      {/* Call for Communications Section */}
      <div className="ed-call-for-papers">
        <div className="ed-call-header">
          <FaPaperPlane className="ed-call-icon" />
          <h3 className="ed-call-title">{callForPapers.title}</h3>
          <span className="ed-call-deadline">
            Submission Deadline: <strong>{callForPapers.deadline}</strong>
          </span>
        </div>

        <div className="ed-call-description">
          <p>
            A <strong>Call for Communications (Appel à Communications)</strong>{" "}
            is an invitation for researchers, clinicians, and healthcare
            professionals to submit their work for presentation at this
            scientific event. Share your findings, innovations, and insights
            with an international audience.
          </p>
        </div>

        <div className="ed-call-details-grid">
          <div className="ed-call-card">
            <h4>Important Dates</h4>
            <ul className="ed-call-list">
              <li>
                <strong>Submission Deadline:</strong> {callForPapers.deadline}
              </li>
              <li>
                <strong>Notification of Acceptance:</strong>{" "}
                {callForPapers.notificationDate}
              </li>
              <li>
                <strong>Final Submission:</strong> May 1, 2024
              </li>
            </ul>
          </div>

          <div className="ed-call-card">
            <h4>Contact for Submissions</h4>
            <ul className="ed-call-list">
              <li>
                <strong>Name:</strong> {callForPapers.contact.name}
              </li>
              <li>
                <strong>Email:</strong> {callForPapers.contact.email}
              </li>
              <li>
                <strong>Phone:</strong> {callForPapers.contact.phone}
              </li>
            </ul>
          </div>
        </div>

        <div className="ed-call-topics">
          <h4>Suggested Topics</h4>
          <div className="ed-topics-grid">
            {callForPapers.topics.map((topic, index) => (
              <span key={index} className="ed-topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="ed-call-guidelines">
          <h4>Submission Guidelines</h4>
          <ul className="ed-guidelines-list">
            {callForPapers.guidelines.map((guideline, index) => (
              <li key={index}>
                <FaCheck className="ed-guideline-check" /> {guideline}
              </li>
            ))}
          </ul>
        </div>

        {!showSubmissionForm ? (
          <div className="ed-call-actions">
            {isAuthor ? (
              <button
                className="ed-btn primary wide"
                onClick={() => setShowSubmissionForm(true)}
              >
                <FaUpload /> Submit Your Abstract
              </button>
            ) : (
              <div
                className="ed-message-info"
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "8px",
                  color: "#1976d2",
                }}
              >
                <FaInfoCircle style={{ marginRight: "0.5rem" }} />
                Only the event author can submit submissions.
              </div>
            )}
          </div>
        ) : isAuthor ? (
          <div className="ed-submission-form-container">
            {submissionSuccess ? (
              <div className="ed-submission-success">
                <FaCheck className="ed-success-icon" />
                <h4>Submission Successful!</h4>
                <p>
                  Your abstract has been submitted successfully. You will
                  receive a confirmation email shortly.
                </p>
                <button
                  className="ed-btn secondary"
                  onClick={() => setShowSubmissionForm(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                className="ed-submission-form"
                onSubmit={handleSubmitSubmission}
              >
                {submissionError && (
                  <div className="ed-message-error">
                    <FaTimes /> {submissionError}
                  </div>
                )}
                <h4>Submit Your Abstract</h4>

                <div className="ed-form-grid">
                  <div className="ed-form-group">
                    <label>
                      Title of Abstract <span className="ed-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={submissionForm.title}
                      onChange={handleSubmissionChange}
                      placeholder="Enter the title of your abstract"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>
                      Authors <span className="ed-required">*</span>
                    </label>
                    <div className="ed-author-select-container" style={{ position: "relative" }} ref={dropdownRef}>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          placeholder="Search or choose authors from database..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowAuthorList(true);
                          }}
                          onFocus={() => setShowAuthorList(true)}
                          disabled={loading}
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
                        <div className="ed-author-dropdown" style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          borderRadius: "4px",
                          zIndex: 1000,
                          maxHeight: "200px",
                          overflowY: "auto"
                        }}>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                              <div
                                key={user.id}
                                className="ed-author-option"
                                onClick={() => handleAuthorSelect(user)}
                                style={{
                                  padding: "8px 12px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f0f0f0"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                              >
                                {user.name} ({user.email})
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: "8px 12px", color: "#999" }}>No authors found</div>
                          )}
                        </div>
                      )}

                      <div className="ed-selected-authors" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {submissionForm.authors && submissionForm.authors.split(", ").filter(a => a).map((author, idx) => (
                          <span key={idx} className="ed-author-chip" style={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            padding: "4px 8px",
                            borderRadius: "16px",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            {author}
                            <FaTimes
                              style={{ cursor: "pointer", fontSize: "0.7rem" }}
                              onClick={() => removeAuthor(author)}
                            />
                          </span>
                        ))}
                      </div>

                      {/* Removed mandatory message as requested */}
                    </div>
                  </div>

                  <div className="ed-form-group">
                    <label>
                      Corresponding Author{" "}
                      <span className="ed-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="correspondingAuthor"
                      value={submissionForm.correspondingAuthor}
                      onChange={handleSubmissionChange}
                      placeholder="Full name of corresponding author"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>
                      Email <span className="ed-required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={submissionForm.email}
                      onChange={handleSubmissionChange}
                      placeholder="corresponding.author@institution.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>
                      Institution/Affiliation{" "}
                      <span className="ed-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={submissionForm.institution}
                      onChange={handleSubmissionChange}
                      placeholder="Your institution or affiliation"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>
                      Presentation Type <span className="ed-required">*</span>
                    </label>
                    <select
                      name="presentationType"
                      value={submissionForm.presentationType}
                      onChange={handleSubmissionChange}
                      required
                      disabled={loading}
                    >
                      <option value="oral">Oral Presentation</option>
                      <option value="poster">Poster Presentation</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>

                  <div className="ed-form-group full-width">
                    <label>
                      Abstract <span className="ed-required">*</span>
                    </label>
                    <textarea
                      name="abstract"
                      value={submissionForm.abstract}
                      onChange={handleSubmissionChange}
                      placeholder="Enter your abstract (maximum 300 words)"
                      rows="6"
                      required
                      disabled={loading}
                    />
                    <small className="ed-word-count">
                      {submissionForm.abstract.length} characters
                    </small>
                  </div>

                  <div className="ed-form-group">
                    <label>Keywords</label>
                    <input
                      type="text"
                      name="keywords"
                      value={submissionForm.keywords}
                      onChange={handleSubmissionChange}
                      placeholder="e.g., AI, Cardiology, Clinical Trials"
                      disabled={loading}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>Upload PDF (Optional)</label>
                    <div className="ed-file-upload">
                      <input
                        type="file"
                        name="file"
                        onChange={handleSubmissionChange}
                        accept=".pdf,.doc,.docx"
                        id="submission-file"
                        disabled={loading}
                      />
                      <label
                        htmlFor="submission-file"
                        className="ed-file-label"
                      >
                        <FaFilePdf /> {submissionForm.fileName || "Choose File"}
                      </label>
                    </div>
                    {submissionForm.fileName && (
                      <small className="ed-file-name">
                        {submissionForm.fileName}
                      </small>
                    )}
                  </div>
                </div>

                <div className="ed-terms">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    id="submission-terms"
                    checked={submissionForm.termsAccepted}
                    onChange={handleSubmissionChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="submission-terms">
                    I confirm that this abstract is original work and has not
                    been published previously. I agree to the{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>terms and conditions</a>.
                  </label>
                </div>

                <div className="ed-form-actions">
                  <button
                    type="button"
                    className="ed-btn secondary"
                    onClick={() => setShowSubmissionForm(false)}
                    disabled={loading}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="ed-btn primary wide"
                    disabled={!submissionForm.termsAccepted || loading}
                  >
                    {loading ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                    {loading ? "Submitting..." : "Submit Abstract"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div
            className="ed-message-error"
            style={{ padding: "1rem", textAlign: "center" }}
          >
            <FaTimes /> Only the event author can submit submissions.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCallSection;
