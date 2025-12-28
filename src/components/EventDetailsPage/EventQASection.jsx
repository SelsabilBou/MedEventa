import React from "react";
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPaperPlane,
  FaInfoCircle,
  FaUserCircle,
  FaThumbsUp,
  FaStar,
  FaTrash,
} from "react-icons/fa";

const EventQASection = ({
  currentUser,
  questionText,
  setQuestionText,
  questionError,
  setQuestionError,
  questionSuccess,
  submittingQuestion,
  handleSubmitQuestion,
  questionSort,
  setQuestionSort,
  loadingQuestions,
  sortedQuestions,
  questionLikes,
  handleLikeQuestion,
  confirmDeleteQuestion,
}) => {
  return (
    <div className="ed-section-content">
      <div className="ed-qna-header">
        <h3 className="ed-section-subtitle">Questions & Answers</h3>
        <p>
          Ask questions about this event. Most liked questions appear first.
        </p>
      </div>

      {/* Sort controls */}
      <div className="ed-qna-controls">
        <button
          type="button"
          className={`ed-sort-btn ${
            questionSort === "popular" ? "active" : ""
          }`}
          onClick={() => setQuestionSort("popular")}
        >
          Most Popular
        </button>
        <button
          type="button"
          className={`ed-sort-btn ${questionSort === "recent" ? "active" : ""}`}
          onClick={() => setQuestionSort("recent")}
        >
          Most Recent
        </button>
      </div>

      {/* Question form */}
      {currentUser ? (
        <div className="ed-qna-form">
          {questionSuccess && (
            <div className="ed-message-success">
              <FaCheck /> Question submitted successfully!
            </div>
          )}
          {questionError && (
            <div className="ed-message-error">
              <FaTimes /> {questionError}
            </div>
          )}
          <form onSubmit={handleSubmitQuestion}>
            <div className="ed-form-group">
              <label>Ask a Question</label>
              <textarea
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setQuestionError("");
                }}
                placeholder="Type your question here..."
                rows="4"
                maxLength={500}
                required
                disabled={submittingQuestion}
                className={questionError ? "ed-input-error" : ""}
              />
              <div className="ed-char-count">
                {questionText.length}/500 characters
              </div>
            </div>
            <div className="ed-form-footer">
              <button
                type="submit"
                className="ed-btn primary"
                disabled={submittingQuestion || !questionText.trim()}
              >
                {submittingQuestion ? (
                  <>
                    <FaSpinner className="spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Submit Question
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="ed-login-prompt">
          <FaInfoCircle /> Please log in to ask questions
        </div>
      )}

      {/* Questions list */}
      {loadingQuestions ? (
        <div className="ed-empty-message">Loading questions...</div>
      ) : sortedQuestions.length > 0 ? (
        <div className="ed-questions-list">
          {sortedQuestions.map((question) => (
            <div key={question.id} className="ed-question-card">
              <div className="ed-question-header">
                <div className="ed-question-author">
                  <FaUserCircle />
                  <span>
                    {question.user?.name || question.userName || "Anonymous"}
                    {question.date_creation && (
                      <>
                        {" "}
                        •{" "}
                        {new Date(question.date_creation).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </>
                    )}
                  </span>
                </div>
                {question.user?.id === currentUser?.id ||
                question.userId === currentUser?.id ? (
                  <button
                    type="button"
                    className="ed-delete-btn"
                    onClick={() => confirmDeleteQuestion(question.id)}
                  >
                    <FaTrash />
                  </button>
                ) : null}
              </div>
              <div className="ed-question-text">
                {question.content || question.contenu || question.text}
              </div>
              <div className="ed-question-footer">
                <button
                  type="button"
                  className={`ed-like-btn ${
                    questionLikes[question.id] ? "liked" : ""
                  }`}
                  onClick={() => handleLikeQuestion(question.id)}
                >
                  <FaThumbsUp />
                  <span>{question.likes || 0}</span>
                </button>
                {(question.likes || 0) > 5 && (
                  <span className="ed-popular-badge">
                    <FaStar /> Popular
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ed-empty-message">
          No questions yet. Be the first to ask!
        </div>
      )}
    </div>
  );
};

export default EventQASection;
