import React, { useState, useEffect } from "react";
import AuthorLayout from "./AuthorLayout";
import "./AuthorProgramme.css";
import { FiCoffee, FiEdit2, FiEye, FiX, FiUser, FiFileText, FiPlus } from "react-icons/fi";
import api from "../api/axios";

const AuthorProgramme = () => {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const token = localStorage.getItem("token");

    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPresentation, setSelectedPresentation] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", abstract: "" });

    // Fetch Events and then Program
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Events
                const eventsRes = await api.get("/api/events");
                const fetchedEvents = eventsRes.data || [];
                setEvents(fetchedEvents);

                // 2. Fetch My Interventions
                const programRes = await api.get("/api/my-interventions");
                const myInterventions = programRes.data || [];

                let eventToSelect = "";

                if (myInterventions.length > 0) {
                    // Find the first event ID from interventions that exists in fetchedEvents
                    // (Just in case the intervention is for an archived/hidden event)
                    const distinctEventIds = [...new Set(myInterventions.map(i => i.evenement_id))];

                    // Prefer the event matching the first intervention found
                    eventToSelect = distinctEventIds[0];
                }

                if (!eventToSelect && fetchedEvents.length > 0) {
                    eventToSelect = fetchedEvents[0].id;
                }

                if (eventToSelect) {
                    setSelectedEventId(eventToSelect);
                    // We already fetched the data, but the existing processProgram/filter logic depends on state or re-run
                    // To keep it simple, we'll process the data we just got
                    processProgram(myInterventions, eventToSelect);
                } else {
                    setSchedule([]);
                }

            } catch (err) {
                console.error("Failed to load initial data", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [token]);

    const processProgram = (allInterventions, eventId) => {
        if (!allInterventions) return;

        // Filter by the selected event
        const myItems = allInterventions.filter(item =>
            item.evenement_id?.toString() === eventId.toString()
        );

        // Map results to schedule format
        const mappedSchedule = myItems.map(item => {
            const isSpeaker = item.role === 'speaker' || item.comm_id !== null;
            const presentations = isSpeaker ? [{
                id: item.comm_id,
                title: item.comm_titre || item.titre,
                authors: "You (Presenter)",
                affiliation: "",
                isMyPresentation: true,
                abstractText: item.comm_resume || item.resume || "",
                type: item.comm_type || item.type
            }] : [];

            return {
                id: item.session_id || `unscheduled-${item.comm_id}`,
                time: item.session_horaire || "TBA",
                title: item.session_titre || (item.comm_titre || "Unscheduled Presentation"),
                room: item.session_salle || "Pending Room Allocation",
                type: item.session_id ? "session" : "unscheduled",
                role: item.role || 'speaker',
                presentations
            };
        });

        // Sort by time
        mappedSchedule.sort((a, b) => {
            if (a.time === "TBA") return 1;
            if (b.time === "TBA") return -1;
            return a.time.localeCompare(b.time);
        });

        setSchedule(mappedSchedule);
    };

    const fetchProgram = async (eventId) => {
        try {
            const res = await api.get("/api/my-interventions");
            processProgram(res.data, eventId);
        } catch (err) {
            console.error("Failed to fetch personal program", err);
            setSchedule([]);
        }
    };



    const handleEventChange = (e) => {
        const id = e.target.value;
        setSelectedEventId(id);
        fetchProgram(id);
    };

    const handleView = (pres) => {
        setSelectedPresentation(pres);
        setViewModalOpen(true);
    };

    const handleEdit = (pres) => {
        setSelectedPresentation(pres);
        setEditForm({
            title: pres.title,
            abstract: pres.abstractText || ""
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Call real backend API to update
            await api.put(`/api/events/submissions/${selectedPresentation.id}`,
                { titre: editForm.title, resume: editForm.abstract }
            );

            // Update local state for immediate feedback
            setSchedule(prev => prev.map(item => {
                if (item.presentations) {
                    return {
                        ...item,
                        presentations: item.presentations.map(p => {
                            if (p.id === selectedPresentation.id) {
                                return { ...p, title: editForm.title, abstractText: editForm.abstract };
                            }
                            return p;
                        })
                    };
                }
                return item;
            }));

            alert("Abstract updated successfully!");
            setEditModalOpen(false);
        } catch (err) {
            console.error("Update failed", err);
            alert(err.response?.data?.message || "Failed to update abstract.");
        }
    };

    const closeModal = () => {
        setViewModalOpen(false);
        setEditModalOpen(false);
        setSelectedPresentation(null);
    };

    return (
        <AuthorLayout>
            <div className="ap-container">
                <div className="ap-header">
                    <div className="ap-header-top">
                        <div>
                            <h1>My Scientific Programme</h1>
                            <p>Your personalized schedule of interventions and presentations.</p>
                        </div>
                        {events.length > 0 && (
                            <div className="ap-event-selector">
                                <label>Select Event: </label>
                                <select
                                    value={selectedEventId}
                                    onChange={handleEventChange}
                                    className="ap-select"
                                >
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.titre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p>Loading your schedule...</p>
                ) : schedule.length === 0 ? (
                    <div className="ap-no-data">
                        <FiFileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>You have no scheduled interventions for this event.</p>
                        <button className="btn-primary-ns" onClick={() => navigate("/author/new-submission")}>
                            <FiPlus /> Submit New Abstract
                        </button>
                    </div>
                ) : (
                    <div className="ap-timeline">
                        {schedule.map((item) => (
                            <div key={item.id} className="ap-timeline-item">
                                <div className="ap-time-marker"></div>
                                <span className="ap-time-label">
                                    {item.time === 'TBA' ? 'TBA' : (
                                        !isNaN(new Date(item.time).getTime())
                                            ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : item.time
                                    )}
                                </span>

                                <div className="ap-session-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 className="ap-session-title">{item.title}</h3>
                                        {item.role === 'chair' && (
                                            <span style={{ fontSize: '0.7rem', background: '#12324a', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                CHAIR / MODERATOR
                                            </span>
                                        )}
                                    </div>
                                    <div className="ap-session-meta">{item.room}</div>

                                    {item.presentations && item.presentations.length > 0 ? (
                                        item.presentations.map(pres => (
                                            <div key={pres.id} className="ap-abstract-box">
                                                <div>
                                                    <div className="ap-abstract-title">{pres.title}</div>
                                                    <div className="ap-authors">
                                                        <FiUser /> {pres.authors}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "#0f9d8a", fontWeight: "bold", marginTop: "0.25rem" }}>
                                                        YOUR PRESENTATION
                                                    </div>
                                                </div>
                                                <div className="ap-actions">
                                                    <button className="ap-view-btn" onClick={() => handleView(pres)}>
                                                        <FiEye /> View
                                                    </button>
                                                    <button className="ap-edit-btn" onClick={() => handleEdit(pres)} style={{ marginLeft: "8px" }}>
                                                        <FiEdit2 /> Edit
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        item.role === 'chair' && (
                                            <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b' }}>
                                                You are presiding over this session.
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VIEW MODAL */}
                {viewModalOpen && selectedPresentation && (
                    <div className="modal-overlay">
                        <div className="modal-content review-modal">
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                            <h2>{selectedPresentation.title}</h2>
                            <p className="modal-meta" style={{ color: '#64748b', marginBottom: '1rem' }}>
                                {selectedPresentation.authors}
                            </p>
                            <div className="modal-body">
                                <h4>Abstract</h4>
                                <p>{selectedPresentation.abstractText || "No abstract details available."}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {editModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content review-modal">
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                            <h2>Edit Abstract</h2>
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Abstract</label>
                                    <textarea
                                        rows={6}
                                        value={editForm.abstract}
                                        onChange={(e) => setEditForm({ ...editForm, abstract: e.target.value })}
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={closeModal} style={{ marginRight: '1rem' }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ background: '#0f9d8a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthorLayout>
    );
};

export default AuthorProgramme;
