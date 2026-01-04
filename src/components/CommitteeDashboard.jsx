import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
    FiClipboard, FiCheckSquare, FiMessageSquare, FiX, FiSave,
    FiFileText, FiUser, FiInfo, FiLayers, FiSearch, FiAward,
    FiDownload, FiArrowRight, FiTarget, FiStar, FiActivity
} from "react-icons/fi";
import "./CommitteeDashboard.css";

import AdminLayout from "./AdminLayout";

const CommitteeDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [formData, setFormData] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [eventStats, setEventStats] = useState(null);
    const [attestations, setAttestations] = useState([]);

    const [evalValues, setEvalValues] = useState({
        pertinence: 0,
        qualite_scientifique: 0,
        originalite: 0,
        commentaire: '',
        decision: 'corriger'
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/evaluations/committee/all-submissions");
            setAssignments(response.data);

            // If we have assignments, fetch stats for the first one's event
            if (response.data.length > 0) {
                fetchStats(response.data[0].evenement_id);
                fetchAttestations(response.data[0].evenement_id);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            setLoading(false);
        }
    };

    const fetchStats = async (eventId) => {
        try {
            const response = await api.get(`/api/events/${eventId}/stats`);
            setEventStats(response.data);
        } catch (error) {
            console.error("Error fetching event stats:", error);
        }
    };

    const fetchAttestations = async (eventId) => {
        try {
            const token = localStorage.getItem("token");
            // Assuming endpoint for my attestations exists as per routes checked
            // GET /api/attestations/evenement/:evenementId returns all attestations for that event
            // But we might want specific one for me. 
            // Let's just use existing list and filter or call generic download if available
            // For now, let's just show a generator button or something similar
        } catch (error) {
            console.error("Error fetching attestations:", error);
        }
    };

    const handleDownloadAttestation = async (eventId) => {
        try {
            const response = await api.get(`/api/attestations/me/download?evenementId=${eventId}&type=membre_comite`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attestation_comite_${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Attestation not available yet (event might not be finished).");
        }
    };

    const handleEvaluate = async (communicationId, evaluationId) => {
        try {
            let finalEvalId = evaluationId;
            if (!finalEvalId) {
                const startRes = await api.post("/api/evaluations/start-evaluation", { communicationId });
                finalEvalId = startRes.data.evaluationId;
            }

            const response = await api.get(`/api/evaluations/evaluation/${finalEvalId}/form`);
            const evalData = response.data.evaluation;
            setFormData(evalData);

            setEvalValues({
                pertinence: evalData.pertinence || 0,
                qualite_scientifique: evalData.qualite_scientifique || 0,
                originalite: evalData.originalite || 0,
                commentaire: evalData.commentaire || '',
                decision: evalData.decision || 'corriger'
            });

            setSelectedAssignment(finalEvalId);
        } catch (error) {
            console.error("Error loading form:", error);
            alert("Could not load evaluation form: " + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/evaluations/evaluation/${selectedAssignment}/submit`, evalValues);
            alert("Evaluation submitted successfully!");
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (error) {
            console.error("Error submitting evaluation:", error);
            let errorMessage = "Unknown error";

            if (error.response?.data?.errors) {
                // If express-validator returned a list of errors
                errorMessage = error.response.data.errors.map(err => err.msg).join(", ");
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = error.message;
            }

            alert("Submission failed: " + errorMessage);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvalValues(prev => ({
            ...prev,
            [name]: name === 'commentaire' || name === 'decision' ? value : Number(value)
        }));
    };

    const filteredAssignments = assignments.filter(a => {
        const statusMatch = activeTab === 'pending' ? a.status !== 'evaluated' : a.status === 'evaluated';
        const searchMatch = a.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.auteur_principal.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && searchMatch;
    });

    if (loading) return (
        <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Accessing Scientific Vault...</p>
        </div>
    );

    return (
        <AdminLayout>
            <div className="committee-dashboard-embedded">
                <header className="dashboard-header">
                    <div className="header-content">
                        <h1>Scientific Committee Portal</h1>
                        <p>Evaluate, validate, and shape the future of scientific discourse.</p>
                    </div>
                </header>

                <section className="mission-section">
                    <h2><FiTarget /> Your Missions</h2>
                    <div className="mission-list">
                        <div className="mission-item">
                            <FiStar />
                            <div>
                                <h4>Evaluate Submissions</h4>
                                <p>Review abstracts based on pertinence, scientific quality, and originality.</p>
                            </div>
                        </div>
                        <div className="mission-item">
                            <FiCheckSquare />
                            <div>
                                <h4>Scientific Advice</h4>
                                <p>Provide recommendations: Accept, Refuse, or Request Revisions.</p>
                            </div>
                        </div>
                        <div className="mission-item">
                            <FiActivity />
                            <div>
                                <h4>Impact Results</h4>
                                <p>Your decisions feed into acceptance rates and program selection.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="stats-bar">
                    <div className="stat-item">
                        <div className="stat-icon pending"><FiLayers /></div>
                        <div className="stat-text">
                            <span className="stat-value">{assignments.filter(a => a.status !== 'evaluated').length}</span>
                            <span className="stat-label">Pending Reviews</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon completed"><FiCheckSquare /></div>
                        <div className="stat-text">
                            <span className="stat-value">{assignments.filter(a => a.status === 'evaluated').length}</span>
                            <span className="stat-label">Evaluated</span>
                        </div>
                    </div>
                    {eventStats && (
                        <div className="stat-item">
                            <div className="stat-icon info"><FiAward /></div>
                            <div className="stat-text">
                                <span className="stat-value">{eventStats.acceptanceRate?.rate || 0}%</span>
                                <span className="stat-label">Acceptance Rate</span>
                            </div>
                        </div>
                    )}
                </div>

                <main className="dashboard-main">
                    <div className="list-controls">
                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pending')}
                            >
                                Pending List
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                                onClick={() => setActiveTab('completed')}
                            >
                                Evaluation History
                            </button>
                        </div>
                        <div className="search-box">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search title or researcher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="submissions-grid">
                        {filteredAssignments.length === 0 ? (
                            <div className="empty-state">
                                <FiClipboard size={48} />
                                <p>No {activeTab} submissions found in your vault.</p>
                            </div>
                        ) : (
                            filteredAssignments.map((sub, idx) => (
                                <div key={sub.evaluation_id || `sub-${sub.id}-${idx}`} className={`submission-card ${sub.status}`}>
                                    <div className="card-top">
                                        <span className="type-badge">{sub.type}</span>
                                        <span className={`status-pill ${sub.status}`}>{sub.status || 'Pending'}</span>
                                    </div>
                                    <h3>{sub.titre}</h3>
                                    <div className="author-info">
                                        <FiUser /> <span>{sub.auteur_principal}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="primary-btn" onClick={() => handleEvaluate(sub.communication_id || sub.id, sub.evaluation_id)}>
                                            {sub.status === 'evaluated' ? 'View / Modify Review' : 'Start Evaluation'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                {assignments.length > 0 && (
                    <section className="attestations-section">
                        <h2><FiAward /> Recognition & Certificates</h2>
                        <div className="attestation-list">
                            {[...new Set(assignments.map(a => a.evenement_id))].map(eventId => (
                                <div key={eventId} className="attestation-card">
                                    <div className="attestation-info">
                                        <h4>Scientific Committee Certificate</h4>
                                        <p>Event ID: #{eventId}</p>
                                    </div>
                                    <button
                                        className="download-link"
                                        onClick={() => handleDownloadAttestation(eventId)}
                                    >
                                        <FiDownload /> Generate PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {selectedAssignment && formData && (
                    <div className="modal-overlay">
                        <div className="modal-content large">
                            <div className="modal-header">
                                <div>
                                    <h2>Scientific Review Sheet</h2>
                                    <p className="subtitle">{formData.titre}</p>
                                </div>
                                <button className="close-btn-modal" onClick={() => setSelectedAssignment(null)}><FiX /></button>
                            </div>
                            <div className="modal-grid">
                                <section className="submission-details">
                                    <div className="detail-group">
                                        <label><FiInfo /> Abstract / Summary</label>
                                        <p className="abstract-text">{formData.resume || "No abstract provided."}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label><FiUser /> Authors</label>
                                        <p>{formData.auteur_prenom} {formData.auteur_nom} (Principal)</p>
                                        <p className="subtitle">{formData.auteur_email}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label><FiLayers /> Submission Type</label>
                                        <p className="type-badge">{formData.type}</p>
                                    </div>
                                </section>

                                <section className="evaluation-section">
                                    <form onSubmit={handleSubmitEvaluation} className="premium-form">
                                        <div className="score-row">
                                            <div className="form-group">
                                                <label>Relevance (1-5)</label>
                                                <input type="number" name="pertinence" min="1" max="5" value={evalValues.pertinence} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Quality (1-5)</label>
                                                <input type="number" name="qualite_scientifique" min="1" max="5" value={evalValues.qualite_scientifique} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Originality (1-5)</label>
                                                <input type="number" name="originalite" min="1" max="5" value={evalValues.originalite} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Scientific Recommendation</label>
                                            <select name="decision" value={evalValues.decision} onChange={handleChange} required>
                                                <option value="accepter">Accept Submission</option>
                                                <option value="refuser">Refuse Submission</option>
                                                <option value="corriger">Revisions Required</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Detailed Feedback (Sent to Authors)</label>
                                            <textarea
                                                name="commentaire"
                                                rows="5"
                                                value={evalValues.commentaire}
                                                onChange={handleChange}
                                                placeholder="Write your professional opinion here..."
                                            ></textarea>
                                        </div>

                                        <button type="submit" className="submit-btn"><FiSave /> Submit Final Decision</button>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CommitteeDashboard;
