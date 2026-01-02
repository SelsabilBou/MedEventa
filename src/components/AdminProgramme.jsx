import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiPlus, FiMoreVertical, FiClock, FiMapPin, FiUser, FiX, FiSave } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import "./AdminProgramme.css";

const AdminProgramme = () => {
    const location = useLocation();
    const [activeDay, setActiveDay] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [events, setEvents] = useState([]);
    const [potentialChairs, setPotentialChairs] = useState([]); // List of users for dropdown
    const [selectedEventId, setSelectedEventId] = useState("");
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showWorkshopModal, setShowWorkshopModal] = useState(false);

    const [sessionForm, setSessionForm] = useState({
        titre: "",
        salle: "",
        date: "",
        heure_debut: "",
        heure_fin: "",
        president: "" // This will store the ID
    });

    const [workshopForm, setWorkshopForm] = useState({
        titre: "",
        description: "",
        salle: "",
        date: "",
        nb_places: 30,
        responsable_id: "" // Changed from name/prenom to ID
    });

    useEffect(() => {
        fetchEvents();
        fetchPotentialChairs(); // Fetch chairs on mount
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchProgramme();
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                if (data.length > 0) {
                    if (location.state?.eventId) {
                        const exists = data.find(e => e.id == location.state.eventId || e._id == location.state.eventId);
                        if (exists) {
                            setSelectedEventId(exists.id || exists._id);
                            return;
                        }
                    }
                    if (!selectedEventId) {
                        setSelectedEventId(data[0].id);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchPotentialChairs = async () => {
        try {
            const token = localStorage.getItem("token");
            // Fetch users with relevant roles, including RESP_WORKSHOP
            const response = await fetch("/api/auth/users?roles=ORGANISATEUR,MEMBRE_COMITE,COMMUNICANT,SUPER_ADMIN,RESP_WORKSHOP", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPotentialChairs(data);
            }
        } catch (error) {
            console.error("Error fetching potential chairs:", error);
        }
    };

    const fetchProgramme = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch sessions
            const sessionsRes = await fetch(`/api/events/${selectedEventId}/program`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                setSessions(data.sessions || []);
            }

            // Fetch workshops
            const workshopsRes = await fetch(`/api/events/${selectedEventId}/workshops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (workshopsRes.ok) {
                const data = await workshopsRes.json();
                setWorkshops(data || []);
            }
        } catch (error) {
            console.error("Error fetching programme:", error);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const targetEventId = sessionForm.eventId || selectedEventId;

            // Construct payload matching backend requirements
            const payload = {
                titre: sessionForm.titre,
                salle: sessionForm.salle,
                horaire: `${sessionForm.date}T${sessionForm.heure_debut}:00`, // Combine date and time
                president_id: parseInt(sessionForm.president) || 1, // Fallback to 1 if not a number, or handle strictly
                evenement_id: targetEventId
            };

            console.log("Sending session payload:", JSON.stringify(payload, null, 2));

            const response = await fetch(`/api/events/${targetEventId}/sessions/create`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Session created successfully!");
                setShowSessionModal(false);
                setSessionForm({
                    titre: "",
                    salle: "",
                    date: "",
                    heure_debut: "",
                    heure_fin: "",
                    president: "",
                    eventId: "",
                    workshopId: ""
                });
                fetchProgramme();
            } else {
                const error = await response.json();
                console.error("Session creation error:", error);
                const errorMsg = error.errors ? error.errors.map(e => e.msg).join(', ') : (error.message || "Failed to create session");
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error creating session:", error);
            alert("Failed to create session");
        }
    };

    const handleCreateWorkshop = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            // Ensure date is properly formatted (append seconds if needed, though usually not strict)
            // Backend expects ISO8601. datetime-local gives 'YYYY-MM-DDTHH:MM' which is valid.

            const payload = {
                ...workshopForm,
                responsable_id: parseInt(workshopForm.responsable_id),
                nb_places: parseInt(workshopForm.nb_places)
            };

            const response = await fetch(`/api/events/${selectedEventId}/workshops`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Workshop created successfully!");
                setShowWorkshopModal(false);
                setWorkshopForm({
                    titre: "",
                    description: "",
                    salle: "",
                    date: "",
                    nb_places: 30,
                    responsable_id: ""
                });
                fetchProgramme();
            } else {
                const error = await response.json();
                const errorMsg = error.errors ? error.errors.map(e => e.msg).join(', ') : (error.message || "Failed to create workshop");
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Error creating workshop:", error);
            alert("Failed to create workshop");
        }
    };

    return (
        <AdminLayout>
            <div className="admin-programme-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Scientific Programme</h1>
                        <p>Build sessions, assign speakers, and manage the event schedule.</p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button className="btn-primary" onClick={() => setShowSessionModal(true)}>
                            <FiPlus /> New Session
                        </button>
                        <button className="btn-primary" onClick={() => setShowWorkshopModal(true)}>
                            <FiPlus /> New Workshop
                        </button>
                    </div>
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

                <div className="programme-days-tabs">
                    <button
                        className={`day-tab ${activeDay === 1 ? "active" : ""}`}
                        onClick={() => setActiveDay(1)}
                    >
                        All Sessions
                    </button>
                    <button
                        className={`day-tab ${activeDay === 2 ? "active" : ""}`}
                        onClick={() => setActiveDay(2)}
                    >
                        All Workshops
                    </button>
                </div>

                <div className="sessions-timeline">
                    {activeDay === 1 && sessions.map(session => (
                        <div key={session.id} className="timeline-session-card">
                            <div className="session-time">
                                <FiClock /> {session.heure_debut} - {session.heure_fin}
                            </div>
                            <div className="session-content">
                                <div className="session-header">
                                    <h3>{session.titre}</h3>
                                    <button className="btn-more"><FiMoreVertical /></button>
                                </div>
                                <div className="session-details">
                                    <span><FiMapPin /> {session.salle}</span>
                                    <span><FiUser /> Chair: {session.president}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {activeDay === 2 && workshops.map(workshop => (
                        <div key={workshop.id} className="timeline-session-card">
                            <div className="session-time">
                                <FiClock /> {new Date(workshop.date).toLocaleTimeString()}
                            </div>
                            <div className="session-content">
                                <div className="session-header">
                                    <h3>{workshop.titre}</h3>
                                    <button className="btn-more"><FiMoreVertical /></button>
                                </div>
                                <div className="session-details">
                                    <span><FiMapPin /> {workshop.salle}</span>
                                    <span><FiUser /> {workshop.responsable_prenom} {workshop.responsable_nom}</span>
                                    <span>Capacity: {workshop.nb_places}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {((activeDay === 1 && sessions.length === 0) || (activeDay === 2 && workshops.length === 0)) && (
                        <div className="empty-programme-state">No items scheduled yet.</div>
                    )}
                </div>
            </div>

            {/* Session Modal */}
            {showSessionModal && (
                <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                    <div className="modal-content session-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <div className="modal-icon">
                                    <FiClock />
                                </div>
                                <div>
                                    <h2>Create New Session</h2>
                                    <p className="modal-subtitle">Add a scientific session to your programme</p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowSessionModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSession}>
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FiUser /> Session Details
                                </h3>
                                <div className="form-group">
                                    <label>Select Event *</label>
                                    <select
                                        value={sessionForm.eventId || selectedEventId}
                                        onChange={(e) => {
                                            const newId = e.target.value;
                                            setSessionForm({ ...sessionForm, eventId: newId });
                                            setSelectedEventId(newId);
                                        }}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                                    >
                                        <option value="">Choose an event...</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.titre || event.title || event.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Link to Workshop (Optional)</label>
                                    <select
                                        value={sessionForm.workshopId || ""}
                                        onChange={(e) => {
                                            const wId = e.target.value;
                                            const workshop = workshops.find(w => w.id == wId);
                                            setSessionForm({
                                                ...sessionForm,
                                                workshopId: wId,
                                                titre: workshop ? `${workshop.titre} - Session` : sessionForm.titre
                                            });
                                        }}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                                    >
                                        <option value="">None</option>
                                        {workshops.map(workshop => (
                                            <option key={workshop.id} value={workshop.id}>{workshop.titre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Session Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Advances in Neurology"
                                        value={sessionForm.titre}
                                        onChange={(e) => setSessionForm({ ...sessionForm, titre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Chair/President *</label>
                                    <select
                                        value={sessionForm.president}
                                        onChange={(e) => setSessionForm({ ...sessionForm, president: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    >
                                        <option value="">Select a Chair...</option>
                                        {potentialChairs.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.prenom} {user.nom} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">
                                    <FiMapPin /> Location & Timing
                                </h3>
                                <div className="form-group">
                                    <label>Room *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Conference Hall A"
                                        value={sessionForm.salle}
                                        onChange={(e) => setSessionForm({ ...sessionForm, salle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={sessionForm.date}
                                        onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Time *</label>
                                        <input
                                            type="time"
                                            value={sessionForm.heure_debut}
                                            onChange={(e) => setSessionForm({ ...sessionForm, heure_debut: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time *</label>
                                        <input
                                            type="time"
                                            value={sessionForm.heure_fin}
                                            onChange={(e) => setSessionForm({ ...sessionForm, heure_fin: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowSessionModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    <FiSave /> Create Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Workshop Modal */}
            {showWorkshopModal && (
                <div className="modal-overlay" onClick={() => setShowWorkshopModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Workshop</h2>
                            <button onClick={() => setShowWorkshopModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleCreateWorkshop}>
                            <div className="form-group">
                                <label>Workshop Title</label>
                                <input
                                    type="text"
                                    value={workshopForm.titre}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, titre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={workshopForm.description}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Room</label>
                                <input
                                    type="text"
                                    value={workshopForm.salle}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, salle: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={workshopForm.date}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Capacity (Number of Seats)</label>
                                <input
                                    type="number"
                                    value={workshopForm.nb_places}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, nb_places: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Trainer (Responsible) *</label>
                                <select
                                    value={workshopForm.responsable_id}
                                    onChange={(e) => setWorkshopForm({ ...workshopForm, responsable_id: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="">Select a Trainer...</option>
                                    {potentialChairs.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.prenom} {user.nom} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowWorkshopModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save"><FiSave /> Create Workshop</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProgramme;
