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

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchQuestions();
            fetchSurveys();
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
                </div>

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
                                        <button className="btn-reply">Reply</button>
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
                                        <button className="btn-view-results">View Results</button>
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
        </AdminLayout>
    );
};

export default AdminQA;
