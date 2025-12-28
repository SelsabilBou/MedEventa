import React from "react";
import {
  FaPaperPlane,
  FaUpload,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFilePdf,
} from "react-icons/fa";

const EventCallSection = ({
  callForPapers,
  showSubmissionForm,
  setShowSubmissionForm,
  submissionSuccess,
  submissionError,
  submissionForm,
  handleSubmissionChange,
  handleSubmitSubmission,
  loading,
}) => {
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
            <button
              className="ed-btn primary wide"
              onClick={() => setShowSubmissionForm(true)}
            >
              <FaUpload /> Submit Your Abstract
            </button>
          </div>
        ) : (
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
                    <input
                      type="text"
                      name="authors"
                      value={submissionForm.authors}
                      onChange={handleSubmissionChange}
                      placeholder="List all authors separated by commas"
                      required
                      disabled={loading}
                    />
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
                    <a href="#">terms and conditions</a>.
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
        )}
      </div>
    </div>
  );
};

export default EventCallSection;
