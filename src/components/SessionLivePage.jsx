// src/components/SessionLivePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaQuestionCircle,
  FaThumbsUp,
  FaPaperPlane,
  FaQrcode,
  FaChartBar,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaCheckCircle,
  FaUserCheck,
  FaSignature,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import "./SessionLivePage.css";
import DashboardLayout from "./DashboardLayout";

// QR Code placeholder component
// To use actual QR codes, install: npm install qrcode.react
// Then replace this component with: import QRCode from "qrcode.react";
const QRCodePlaceholder = ({ value, size }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px dashed #0f9d8a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background: "#f0fdfa",
        color: "#0f9d8a",
        fontSize: "0.9rem",
        textAlign: "center",
        padding: "1.5rem",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "2rem" }}>📱</div>
      <div>
        <strong>QR Code</strong>
        <div style={{ fontSize: "0.8rem", marginTop: "0.5rem", wordBreak: "break-all", color: "#5d7b8a" }}>
          {value}
        </div>
        <div style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "#8ca2af" }}>
          Install qrcode.react for visual QR code
        </div>
      </div>
    </div>
  );
};

const SessionLivePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Q&A State
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [questionLikes, setQuestionLikes] = useState({});

  // Polls State
  const [currentPoll, setCurrentPoll] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [submittingPoll, setSubmittingPoll] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Presence/Attendance State
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  const currentUser = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSession(response.data);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
      fetchQuestions();
      fetchCurrentPoll();
      checkAttendance();
      // Auto-mark attendance when page loads (optional feature)
      // Uncomment the line below if you want automatic attendance marking
      // autoMarkAttendance();
    }

    // Set up real-time refresh for Q&A and polls (every 5 seconds)
    const interval = setInterval(() => {
      if (sessionId) {
        fetchQuestions();
        fetchCurrentPoll();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, fetchQuestions]);

  // Optional: Auto-mark attendance on page load
  const autoMarkAttendance = async () => {
    if (!currentUser || attendanceMarked) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/sessions/${sessionId}/attendance`,
        { type: "auto" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAttendanceMarked(true);
    } catch (error) {
      // Silently fail for auto-attendance
      console.log("Auto-attendance not marked:", error);
    }
  };

  // Check if attendance is already marked
  const checkAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/sessions/${sessionId}/attendance/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceMarked(response.data.marked || false);
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  // Mark attendance (presence tracking)
  const handleMarkAttendance = async () => {
    if (!currentUser) {
      setAttendanceError("Please log in to mark attendance");
      return;
    }

    try {
      setMarkingAttendance(true);
      setAttendanceError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/sessions/${sessionId}/attendance`,
        { type: "qr_code" }, // or "signature" if using signature
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAttendanceMarked(true);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setAttendanceError(
        error.response?.data?.message || "Failed to mark attendance"
      );
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    if (!sessionId) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/api/sessions/${sessionId}/questions`, {
        headers,
      });
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      // If error due to auth, questions will remain empty
      if (error.response?.status === 401) {
        // User not authenticated - this is okay for viewing
        setQuestions([]);
      }
    }
  }, [sessionId]);

  // Fetch current poll
  const fetchCurrentPoll = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/sessions/${sessionId}/poll/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.poll) {
        setCurrentPoll(response.data.poll);
        setHasVoted(response.data.hasVoted || false);
        if (response.data.results) {
          setPollResults(response.data.results);
        }
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
    }
  };

  // Submit question
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setQuestionError("Please enter your question");
      return;
    }

    if (!currentUser) {
      // Redirect to login with return URL
      const returnUrl = `/sessions/${sessionId}/live`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setSubmittingQuestion(true);
      setQuestionError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/sessions/${sessionId}/questions`,
        { content: questionText.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setQuestionText("");
      await fetchQuestions();
    } catch (error) {
      console.error("Error submitting question:", error);
      setQuestionError(
        error.response?.data?.message || "Failed to submit question"
      );
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Like question
  const handleLikeQuestion = async (questionId) => {
    if (!currentUser) {
      // Redirect to login with return URL
      const returnUrl = `/sessions/${sessionId}/live`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/questions/${questionId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestionLikes((prev) => ({
        ...prev,
        [questionId]: !prev[questionId],
      }));
      await fetchQuestions();
    } catch (error) {
      console.error("Error liking question:", error);
    }
  };

  // Submit poll answer
  const handleSubmitPoll = async () => {
    if (!selectedAnswer || !currentPoll) return;

    if (!currentUser) {
      // Redirect to login with return URL
      const returnUrl = `/sessions/${sessionId}/live`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setSubmittingPoll(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/sessions/${sessionId}/poll/vote`,
        { pollId: currentPoll.id, answerId: selectedAnswer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setHasVoted(true);
      await fetchCurrentPoll();
    } catch (error) {
      console.error("Error submitting poll:", error);
    } finally {
      setSubmittingPoll(false);
    }
  };

  const sessionUrl = `${window.location.origin}/sessions/${sessionId}/live`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="session-live-loading">Loading session...</div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="session-live-error">Session not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="session-live-container">
        {/* Session Header */}
        <div className="session-live-header">
          <div className="session-live-header-info">
            <h1>{session.title || "Session Live"}</h1>
            {session.chair && (
              <div className="session-live-meta">
                <FaUser /> <span>Chair: {session.chair}</span>
              </div>
            )}
            {session.time && (
              <div className="session-live-meta">
                <FaClock /> <span>{session.time}</span>
              </div>
            )}
            {session.room && (
              <div className="session-live-meta">
                <FaMapMarkerAlt /> <span>{session.room}</span>
              </div>
            )}
          </div>
          <div className="session-live-header-actions">
            {/* Attendance/Presence Tracking Button */}
            {!attendanceMarked ? (
              <button
                className="session-live-attendance-btn"
                onClick={handleMarkAttendance}
                disabled={markingAttendance}
              >
                {markingAttendance ? (
                  <>
                    <FaSpinner className="spin" /> Marking...
                  </>
                ) : (
                  <>
                    <FaUserCheck /> Mark Attendance
                  </>
                )}
              </button>
            ) : (
              <div className="session-live-attendance-marked">
                <FaCheckCircle /> Attendance Marked
              </div>
            )}
            <button
              className="session-live-qr-btn"
              onClick={() => setShowQR(!showQR)}
            >
              <FaQrcode /> Show QR Code
            </button>
          </div>
        </div>
        {attendanceError && (
          <div className="session-live-error-message">
            {attendanceError}
          </div>
        )}

        {/* QR Code Modal */}
        {showQR && (
          <div className="session-live-qr-modal" onClick={() => setShowQR(false)}>
            <div className="session-live-qr-content" onClick={(e) => e.stopPropagation()}>
              <h3>Scan QR Code to Join Session</h3>
              <p className="session-live-qr-instruction">
                Participants can scan this code to access Q&A and polls for this session.
              </p>
              <QRCodePlaceholder value={sessionUrl} size={256} />
              <div className="session-live-qr-url-container">
                <p className="session-live-qr-url">{sessionUrl}</p>
                <button
                  className="session-live-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(sessionUrl);
                    alert("URL copied to clipboard!");
                  }}
                >
                  Copy URL
                </button>
              </div>
              <button className="session-live-close-btn" onClick={() => setShowQR(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Two Columns */}
        <div className="session-live-content">
          {/* Q&A Panel */}
          <div className="session-live-panel session-live-qa">
            <div className="session-live-panel-header">
              <FaQuestionCircle />
              <h2>Q&A</h2>
            </div>

            {/* Login Prompt for Unauthenticated Users */}
            {!currentUser && (
              <div className="session-live-login-prompt">
                <p>
                  <FaQuestionCircle /> Please log in to ask questions and participate in polls.
                </p>
                <button
                  onClick={() => {
                    const returnUrl = `/sessions/${sessionId}/live`;
                    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                  }}
                  className="session-live-login-btn"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Question Form */}
            <form onSubmit={handleSubmitQuestion} className="session-live-question-form">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={currentUser ? "Ask a question..." : "Log in to ask a question..."}
                rows={3}
                maxLength={500}
                disabled={submittingQuestion || !currentUser}
              />
              <div className="session-live-form-footer">
                <span className="session-live-char-count">
                  {questionText.length}/500
                </span>
                {questionError && (
                  <span className="session-live-error-text">{questionError}</span>
                )}
                <button
                  type="submit"
                  disabled={submittingQuestion || !questionText.trim() || !currentUser}
                  className="session-live-submit-btn"
                  title={!currentUser ? "Please log in to ask questions" : ""}
                >
                  <FaPaperPlane />
                  {submittingQuestion ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>

            {/* Questions List */}
            <div className="session-live-questions-list">
              {questions.length === 0 ? (
                <div className="session-live-empty">No questions yet. Be the first to ask!</div>
              ) : (
                questions
                  .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                  .map((question) => (
                    <div key={question.id} className="session-live-question-item">
                      <div className="session-live-question-content">
                        <p>{question.content}</p>
                        <div className="session-live-question-meta">
                          <span>{question.author || "Anonymous"}</span>
                          <span>{new Date(question.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        className="session-live-like-btn"
                        onClick={() => handleLikeQuestion(question.id)}
                        title={!currentUser ? "Log in to upvote" : "Upvote this question"}
                      >
                        <FaThumbsUp />
                        {question.likes || 0}
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Polls Panel */}
          <div className="session-live-panel session-live-polls">
            <div className="session-live-panel-header">
              <FaChartBar />
              <h2>Live Poll</h2>
            </div>

            {!currentPoll ? (
              <div className="session-live-empty">No active poll at the moment.</div>
            ) : hasVoted || pollResults ? (
              <div className="session-live-poll-results">
                <h3>{currentPoll.question}</h3>
                <div className="session-live-results-list">
                  {currentPoll.options.map((option) => {
                    const votes = pollResults?.[option.id] || 0;
                    const total = Object.values(pollResults || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (votes / total) * 100 : 0;
                    return (
                      <div key={option.id} className="session-live-result-item">
                        <div className="session-live-result-label">{option.text}</div>
                        <div className="session-live-result-bar">
                          <div
                            className="session-live-result-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="session-live-result-stats">
                          {votes} vote{votes !== 1 ? "s" : ""} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasVoted && (
                  <div className="session-live-voted-badge">
                    <FaCheckCircle /> You have voted
                  </div>
                )}
              </div>
            ) : (
              <div className="session-live-poll-active">
                <h3>{currentPoll.question}</h3>
                <div className="session-live-poll-options">
                  {currentPoll.options.map((option) => (
                    <button
                      key={option.id}
                      className={`session-live-poll-option ${
                        selectedAnswer === option.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedAnswer(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
                <button
                  className="session-live-submit-btn"
                  onClick={handleSubmitPoll}
                  disabled={!selectedAnswer || submittingPoll}
                >
                  {submittingPoll ? "Submitting..." : "Submit Vote"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SessionLivePage;

