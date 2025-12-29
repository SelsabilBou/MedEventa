import React from "react";
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPaperPlane,
  FaInfoCircle,
  FaStar,
} from "react-icons/fa";

const EventFeedbackSection = ({
  currentUser,
  feedbackRating,
  setFeedbackRating,
  feedbackComment,
  setFeedbackComment,
  feedbackSubmitted,
  feedbackError,
  setFeedbackError,
  loadingFeedback,
  handleSubmitFeedback,
}) => {
  return (
    <div className="ed-section-content">
      <div className="ed-feedback-header">
        <h3 className="ed-section-subtitle">Share Your Feedback</h3>
        <p>Help us improve by sharing your experience at this event.</p>
      </div>

      {feedbackSubmitted ? (
        <div className="ed-submission-success">
          <FaCheck className="ed-success-icon" />
          <h4>Thank You!</h4>
          <p>Your feedback has been submitted successfully.</p>
        </div>
      ) : currentUser ? (
        <form className="ed-qna-form" onSubmit={handleSubmitFeedback}>
          {feedbackError && (
            <div className="ed-message-error">
              <FaTimes /> {feedbackError}
            </div>
          )}
          <div className="ed-form-group">
            <label>Overall Rating *</label>
            <div className="ed-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={feedbackRating >= star ? "filled" : ""}
                  onClick={() => {
                    setFeedbackRating(star);
                    setFeedbackError("");
                  }}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
            {feedbackRating === 0 && feedbackError && (
              <div className="ed-field-error">Please select a rating</div>
            )}
          </div>

          <div className="ed-form-group">
            <label>Your Feedback (Optional)</label>
            <textarea
              value={feedbackComment}
              onChange={(e) => {
                setFeedbackComment(e.target.value);
                setFeedbackError("");
              }}
              placeholder="Share your thoughts, suggestions, or comments..."
              rows="6"
              maxLength={1000}
              disabled={loadingFeedback}
              className={feedbackError ? "ed-input-error" : ""}
            />
            <div className="ed-char-count">
              {feedbackComment.length}/1000 characters
            </div>
          </div>

          <div className="ed-form-footer">
            <button
              type="submit"
              className="ed-btn primary"
              disabled={loadingFeedback || feedbackRating === 0}
            >
              {loadingFeedback ? (
                <>
                  <FaSpinner className="spin" /> Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="ed-login-prompt">
          <FaInfoCircle /> Please log in to submit feedback
        </div>
      )}
    </div>
  );
};

export default EventFeedbackSection;
