import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiMessageSquare, FiBarChart2, FiPlus, FiX, FiSave, FiTrash } from "react-icons/fi";
import "./AdminQA.css";

const AdminQA = () => {
    const [activeTab, setActiveTab] = useState("questions");
    const [questions, setQuestions] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [showSurveyModal, setShowSurveyModal] = useState(false);

    const [surveyForm, setSurveyForm] = useState({
        titre: "",
        description: "",
        questions: [{ question: "", type: "text" }]
    });

    // Results Modal State
    const [resultsModal, setResultsModal] = useState({
        show: false,
        loading: false,
        data: null,
        surveyTitle: ""
    });

    // Reply Modal State
    const [replyModal, setReplyModal] = useState({
        show: false,
        question: null,
        content: ""
    });

    const handleReplyClick = (question) => {
        setReplyModal({
            show: true,
            question: question,
            content: `Replying to your question: "${question.contenu}"\n\n`
        });
    };

    const handleSendReply = async () => {
        if (!replyModal.content.trim()) return;

        if (!replyModal.question?.user?.id) {
            alert("Error: Cannot reply to this user (User not found).");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    destinataire_id: replyModal.question.user.id,
                    evenement_id: selectedEventId,
                    contenu: replyModal.content,
                    type: "reponse"
                })
            });

            if (response.ok) {
                alert("Reply sent successfully!");
                setReplyModal({ show: false, question: null, content: "" });
            } else {
                const errData = await response.json();
                alert(`Failed to send reply: ${errData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error sending reply:", error);
            alert("Error sending reply.");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchQuestions();
            fetchSurveys();
            fetchFeedback();

            // Poll every 10 seconds for real-time updates
            const intervalId = setInterval(() => {
                fetchQuestions();
                fetchSurveys();
                fetchFeedback();
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                if (data.length > 0) {
                    setSelectedEventId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/questions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setQuestions(data.questions || []);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const fetchSurveys = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/surveys`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSurveys(data || []);
            }
        } catch (error) {
            console.error("Error fetching surveys:", error);
        }
    };

    const [feedbackList, setFeedbackList] = useState([]);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/feedback`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFeedbackList(data || []);
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/surveys/create`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(surveyForm)
            });

            if (response.ok) {
                alert("Survey created successfully!");
                setShowSurveyModal(false);
                setSurveyForm({
                    titre: "",
                    description: "",
                    questions: [{ question: "", type: "text" }]
                });
                fetchSurveys();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to create survey"}`);
            }
        } catch (error) {
            console.error("Error creating survey:", error);
            alert("Failed to create survey");
        }
    };

    const addSurveyQuestion = () => {
        setSurveyForm({
            ...surveyForm,
            questions: [...surveyForm.questions, { question: "", type: "text" }]
        });
    };

    const removeSurveyQuestion = (index) => {
        const newQuestions = surveyForm.questions.filter((_, i) => i !== index);
        setSurveyForm({ ...surveyForm, questions: newQuestions });
    };

    const updateSurveyQuestion = (index, field, value) => {
        const newQuestions = [...surveyForm.questions];
        newQuestions[index][field] = value;
        setSurveyForm({ ...surveyForm, questions: newQuestions });
    };

    const handleViewResults = async (survey) => {
        setResultsModal({ show: true, loading: true, data: null, surveyTitle: survey.titre });
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/surveys/${survey.id}/results`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setResultsModal({ show: true, loading: false, data: data, surveyTitle: survey.titre });
            } else {
                alert("Failed to fetch results");
                setResultsModal({ ...resultsModal, show: false });
            }
        } catch (error) {
            console.error("Error fetching results:", error);
            setResultsModal({ ...resultsModal, show: false });
        }
    };

    return (
        <AdminLayout>
            <div className="admin-qa-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Q&A & Surveys</h1>
                        <p>Manage participant questions and create feedback surveys.</p>
                    </div>
                    {activeTab === "surveys" && (
                        <button className="btn-primary" onClick={() => setShowSurveyModal(true)}>
                            <FiPlus /> Create Survey
                        </button>
                    )}
                </header>

                <div className="event-selector" style={{ marginBottom: "2rem" }}>
                    <label style={{ fontWeight: 600, marginRight: "1rem" }}>Select Event:</label>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    >
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.titre || event.name}</option>
                        ))}
                    </select>
                </div>

                <div className="qa-tabs">
                    <button
                        className={`qa-tab ${activeTab === "questions" ? "active" : ""}`}
                        onClick={() => setActiveTab("questions")}
                    >
                        <FiMessageSquare /> Participants Questions
                    </button>
                    <button
                        className={`qa-tab ${activeTab === "surveys" ? "active" : ""}`}
                        onClick={() => setActiveTab("surveys")}
                    >
                        <FiBarChart2 /> Surveys & Polls
                    </button>
                    <button
                        className={`qa-tab ${activeTab === "feedback" ? "active" : ""}`}
                        onClick={() => setActiveTab("feedback")}
                    >
                        <FiMessageSquare /> Feedback
                    </button>
                </div>

                {activeTab === "feedback" && (
                    <div className="feedback-list">
                        <h3>Event Feedback</h3>
                        {feedbackList.length === 0 ? (
                            <p>No feedback received yet.</p>
                        ) : (
                            feedbackList.map(f => (
                                <div key={f.id} className="question-card">
                                    <div className="question-header">
                                        <strong>{f.user_name || "Anonymous"} {f.user_firstname}</strong>
                                        <span className="question-time">{new Date(f.created_at).toLocaleString()}</span>
                                    </div>
                                    <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}>
                                        {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                                    </div>
                                    <p>{f.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className="questions-list">
                        {questions.length > 0 ? (
                            questions.map(q => (
                                <div key={q.id} className="question-card">
                                    <div className="question-header">
                                        <div className="user-info">
                                            <div className="user-avatar">{q.user_name?.charAt(0) || "U"}</div>
                                            <div>
                                                <strong>{q.user_name || "Anonymous"}</strong>
                                                <span className="question-time">{new Date(q.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="question-content">{q.contenu}</p>
                                    <div className="question-actions">
                                        <button
                                            className="btn-reply"
                                            onClick={() => handleReplyClick(q)}
                                        >
                                            Reply
                                        </button>
                                        <button className="btn-dismiss">Dismiss</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#6c8895" }}>
                                No questions submitted yet.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "surveys" && (
                    <div className="surveys-list">
                        {surveys.length > 0 ? (
                            surveys.map(survey => (
                                <div key={survey.id} className="survey-row">
                                    <div className="survey-info">
                                        <h4>{survey.titre}</h4>
                                        <p>{survey.description}</p>
                                    </div>
                                    <div className="survey-stats">
                                        <span className="response-count">{survey.response_count || 0} responses</span>
                                    </div>
                                    <div className="survey-actions">
                                        <button
                                            className="btn-view-results"
                                            onClick={() => handleViewResults(survey)}
                                        >
                                            View Results
                                        </button>
                                        <button className="btn-more">More Options</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "3rem", color: "#6c8895" }}>
                                No surveys created yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Survey Results Modal */}
            {resultsModal.show && (
                <div className="modal-overlay" onClick={() => setResultsModal({ ...resultsModal, show: false })}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Survey Results</h2>
                                <p className="modal-subtitle">{resultsModal.surveyTitle}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setResultsModal({ ...resultsModal, show: false })}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {resultsModal.loading ? (
                                <p style={{ textAlign: "center", padding: "2rem" }}>Loading results...</p>
                            ) : resultsModal.data && resultsModal.data.questions ? (
                                resultsModal.data.questions.map((q, index) => (
                                    <div key={index} className="results-question">
                                        <h4>{q.questionText}</h4>
                                        {q.responses && q.responses.length > 0 ? (
                                            <div className="responses-list">
                                                {q.responses.map((resp, i) => (
                                                    <div key={i} className="response-item">
                                                        <div className="response-user">{resp.userName || "Anonymous"}</div>
                                                        <div className="response-text">{resp.answer}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-responses">No responses yet.</div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No results available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Survey Creation Modal */}
            {showSurveyModal && (
                <div className="modal-overlay" onClick={() => setShowSurveyModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <div className="modal-icon">
                                    <FiBarChart2 />
                                </div>
                                <div>
                                    <h2>Create New Survey</h2>
                                    <p className="modal-subtitle">Collect feedback from participants</p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowSurveyModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSurvey}>
                            <div className="form-group">
                                <label>Survey Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Event Satisfaction Survey"
                                    value={surveyForm.titre}
                                    onChange={(e) => setSurveyForm({ ...surveyForm, titre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Brief description of the survey purpose"
                                    value={surveyForm.description}
                                    onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <h3>Survey Questions</h3>
                                    <button type="button" className="btn-add-question" onClick={addSurveyQuestion}>
                                        <FiPlus /> Add Question
                                    </button>
                                </div>
                                {surveyForm.questions.map((q, index) => (
                                    <div key={index} className="question-input-group">
                                        <div className="form-group">
                                            <label>Question {index + 1}</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your question"
                                                value={q.question}
                                                onChange={(e) => updateSurveyQuestion(index, "question", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Answer Type</label>
                                                <select
                                                    value={q.type}
                                                    onChange={(e) => updateSurveyQuestion(index, "type", e.target.value)}
                                                >
                                                    <option value="text">Text Answer</option>
                                                    <option value="rating">Rating (1-5)</option>
                                                    <option value="yesno">Yes/No</option>
                                                    <option value="multiple">Multiple Choice</option>
                                                </select>
                                            </div>
                                            {surveyForm.questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-question"
                                                    onClick={() => removeSurveyQuestion(index)}
                                                >
                                                    <FiTrash /> Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowSurveyModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    <FiSave /> Create Survey
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Reply Modal */}
            {replyModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Reply to {replyModal.question?.user_name || "User"}</h3>
                            <button className="close-btn" onClick={() => setReplyModal({ ...replyModal, show: false })}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <textarea
                                value={replyModal.content}
                                onChange={(e) => setReplyModal({ ...replyModal, content: e.target.value })}
                                placeholder="Type your reply here..."
                                rows="6"
                                style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setReplyModal({ ...replyModal, show: false })}>Cancel</button>
                            <button className="btn-primary" onClick={handleSendReply}>Send Reply</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminQA;
