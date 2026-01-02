import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FiMic, FiEdit, FiUpload, FiX, FiSave, FiFileText,
    FiClock, FiMapPin, FiCalendar, FiArrowRight, FiInfo
} from "react-icons/fi";
import "./GuestDashboard.css";
import AdminLayout from "./AdminLayout";

const GuestDashboard = () => {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [editMode, setEditMode] = useState(null); // 'session_details', 'upload_presentation', or 'feedback'
    const [feedback, setFeedback] = useState(null);

    // Form states
    const [sessionForm, setSessionForm] = useState({ titre: '', salle: '', horaire: '' });
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        fetchInterventions();
    }, []);

    const fetchInterventions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // Adjusted endpoint to match backend (mounted on /api)
            const response = await axios.get("/api/my-interventions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterventions(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching interventions:", error);
            setLoading(false);
        }
    };

    const handleEditSession = (session) => {
        setSelectedSession(session);
        setEditMode('session_details');
        setSessionForm({
            titre: session.titre || '',
            salle: session.salle || '',
            horaire: session.horaire ? session.horaire.slice(0, 16) : ''
        });
    };

    const handleUploadPresentation = (session) => {
        setSelectedSession(session);
        setEditMode('upload_presentation');
        setUploadFile(null);
    };

    const handleSubmitSessionUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            // Corrected API path
            await axios.put(`/api/sessions/${selectedSession.id}/update`, sessionForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Session details updated!");
            setEditMode(null);
            fetchInterventions();
        } catch (error) {
            console.error("Error updating session:", error);
            alert("Update failed. Check your permissions.");
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSession.comm_id) {
            alert("Error: No communication linked to this session.");
            return;
        }

        const formData = new FormData();
        formData.append("resumePdf", uploadFile);

        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/events/submissions/${selectedSession.comm_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("Presentation material uploaded successfully!");
            setEditMode(null);
        } catch (error) {
            console.error("Error uploading presentation:", error);
            alert("Upload failed. Make sure the file is a PDF.");
        }
    };

    const handleDownloadCertificate = async (eventId) => {
        try {
            const token = localStorage.getItem("token");
            // First generate it to be sure
            await axios.post("/api/attestations/me/generate",
                { evenementId: eventId, type: 'invite' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Then download
            window.open(`/api/attestations/me/download?type=invite&eventId=${eventId}&token=${token}`, '_blank');
        } catch (error) {
            console.error("Error downloading certificate:", error);
            alert(error.response?.data?.message || "Certificate not available yet. It usually becomes available after the event finishes.");
        }
    };

    const handleViewFeedback = async (session) => {
        if (!session.comm_id) {
            alert("This session is not linked to a specific communication.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`/api/evaluations/my-assignments`, { // Reuse or specific endpoint for feedback
                headers: { Authorization: `Bearer ${token}` }
            });
            // We need a specific endpoint for speaker to see THEIR feedback
            // For now, let's assume we fetch evaluation report if public
            alert("Feedback view feature coming soon! Currently checking eligibility.");
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    if (loading) return (
        <div className="guest-loading">
            <div className="spinner"></div>
            <p>Loading your space...</p>
        </div>
    );

    const nextIntervention = interventions.length > 0 ? interventions[0] : null;

    return (
        <AdminLayout>
            <div className="guest-dashboard-embedded">
                <header className="dashboard-header">
                    <div>
                        <h1>Speaker Portal</h1>
                        <p>Manage your interventions and materials.</p>
                    </div>
                </header>

                {nextIntervention && (
                    <div className="next-session-hero">
                        <div className="hero-content">
                            <div className="hero-tag">NEXT INTERVENTION</div>
                            <h2>{nextIntervention.titre}</h2>
                            <div className="hero-meta">
                                <span><FiClock /> {new Date(nextIntervention.horaire).toLocaleString()}</span>
                                <span><FiMapPin /> {nextIntervention.salle || "Hall TBD"}</span>
                            </div>
                        </div>
                        <div className="hero-action">
                            {nextIntervention.role === 'speaker' ? (
                                <button className="glass-btn" onClick={() => handleUploadPresentation(nextIntervention)}>
                                    <FiUpload /> Prepare Slides
                                </button>
                            ) : (
                                <button className="glass-btn" onClick={() => handleEditSession(nextIntervention)}>
                                    <FiEdit /> Edit Details
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <section className="dashboard-quick-actions">
                    <div className="section-title">
                        <h2>My Certificates</h2>
                    </div>
                    <div className="certificates-grid">
                        {interventions.length === 0 ? (
                            <p className="dimmed">No certificates available yet.</p>
                        ) : (
                            // Unique events from interventions
                            Array.from(new Set(interventions.map(i => i.evenement_id))).map(eventId => {
                                const int = interventions.find(i => i.evenement_id === eventId);
                                return (
                                    <div key={eventId} className="certificate-card">
                                        <div className="cert-info">
                                            <FiFileText className="cert-icon" />
                                            <div>
                                                <h4>Speaker Certificate</h4>
                                                <p>{int.event_titre}</p>
                                            </div>
                                        </div>
                                        <button className="btn-download" onClick={() => handleDownloadCertificate(eventId)}>
                                            <FiDownload /> Download
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <main className="dashboard-main">
                    <div className="section-title">
                        <h2>Full Schedule ({interventions.length})</h2>
                    </div>

                    {interventions.length === 0 ? (
                        <div className="empty-state">
                            <FiMic size={48} />
                            <p>You haven't been assigned to any sessions yet.</p>
                        </div>
                    ) : (
                        <div className="interventions-list">
                            {interventions.map(int => (
                                <div key={`${int.id}-${int.role}`} className="intervention-card">
                                    <div className="card-top">
                                        <span className={`role-tag ${int.role}`}>
                                            {int.role === 'speaker' ? 'Speaker' : 'Chair / Moderator'}
                                        </span>
                                        <span className="event-name">{int.event_titre}</span>
                                    </div>

                                    <h3>{int.titre}</h3>

                                    <div className="card-meta">
                                        <div className="meta-item"><FiClock /> {new Date(int.horaire).toLocaleString()}</div>
                                        <div className="meta-item"><FiMapPin /> {int.salle || 'Room TBD'}</div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="footer-links">
                                            <button
                                                className="action-link"
                                                onClick={() => int.role === 'speaker' ? handleUploadPresentation(int) : handleEditSession(int)}
                                            >
                                                {int.role === 'speaker' ? 'Materials' : 'Details'} <FiArrowRight />
                                            </button>
                                            {int.role === 'speaker' && (
                                                <button className="action-link secondary" onClick={() => handleViewFeedback(int)}>
                                                    Feedback <FiInfo />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Modals */}
                {editMode && (
                    <div className="modal-overlay">
                        <div className="modal-wrapper">
                            <div className="modal-card">
                                <div className="modal-header">
                                    <h3>{editMode === 'session_details' ? 'Edit Session Info' : 'Upload Slides'}</h3>
                                    <button className="close-btn" onClick={() => setEditMode(null)}><FiX /></button>
                                </div>

                                <div className="modal-body">
                                    {editMode === 'session_details' ? (
                                        <form onSubmit={handleSubmitSessionUpdate} className="modern-form">
                                            <div className="form-group">
                                                <label>Session Title</label>
                                                <input type="text" value={sessionForm.titre} onChange={e => setSessionForm({ ...sessionForm, titre: e.target.value })} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Location / Room</label>
                                                <input type="text" value={sessionForm.salle} onChange={e => setSessionForm({ ...sessionForm, salle: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Time</label>
                                                <input type="datetime-local" value={sessionForm.horaire} onChange={e => setSessionForm({ ...sessionForm, horaire: e.target.value })} />
                                            </div>
                                            <button type="submit" className="save-btn"><FiSave /> Update Session</button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleUploadSubmit} className="modern-form">
                                            <div className="upload-area">
                                                <FiFileText size={48} className="doc-icon" />
                                                <p>Select your final presentation PDF</p>
                                                <input type="file" accept="application/pdf" onChange={e => setUploadFile(e.target.files[0])} required />
                                            </div>
                                            <button type="submit" className="save-btn"><FiUpload /> Complete Upload</button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default GuestDashboard;
