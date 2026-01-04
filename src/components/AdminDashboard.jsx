import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";
import { FiUsers, FiClipboard, FiCalendar, FiCheckCircle, FiTrendingUp, FiDollarSign, FiMapPin, FiClock, FiStar, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        acceptanceRate: 0,
        checkInsToday: 0,
        upcomingEvents: 0,
        totalParticipants: 0,
        totalRevenue: 0
    });
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [recentProgramme, setRecentProgramme] = useState([]);
    const [eventWorkshops, setEventWorkshops] = useState([]); // All workshops for the selected event
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showWorkshopModal, setShowWorkshopModal] = useState(false);
    const [showCommitteeModal, setShowCommitteeModal] = useState(false);
    const [showGuestsModal, setShowGuestsModal] = useState(false);
    const [showLeadersModal, setShowLeadersModal] = useState(false);

    const [communicants, setCommunicants] = useState([]);
    const [workshopResponsables, setWorkshopResponsables] = useState([]);
    const [committeeUsers, setCommitteeUsers] = useState([]);
    const [potentialGuests, setPotentialGuests] = useState([]);

    const [sessionForm, setSessionForm] = useState({ eventId: "", titre: "", horaire: "", salle: "", president_id: "" });
    const [workshopForm, setWorkshopForm] = useState({ eventId: "", titre: "", date: "", salle: "", responsable_id: "", nb_places: "" });

    // Assignment selections
    const [selectedCommittee, setSelectedCommittee] = useState([]); // Array of user IDs
    const [selectedGuests, setSelectedGuests] = useState([]); // Array of {nom, prenom, email, sujet, utilisateur_id}
    const [selectedLeaders, setSelectedLeaders] = useState([]); // Array of user IDs

    const [saveStatus, setSaveStatus] = useState("");

    useEffect(() => {
        fetchEvents();
        fetchCommunicants();
        fetchWorkshopResponsables();
        fetchCommitteeUsers();
        fetchPotentialGuests();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchStats();
            fetchRecentSubmissions();
            fetchRecentProgramme();
            fetchCurrentAssignments(selectedEventId);
        }
    }, [selectedEventId]);

    const fetchCommunicants = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/users/role/COMMUNICANT", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCommunicants(data);
            }
        } catch (error) {
            console.error("Error fetching communicants:", error);
        }
    };

    const fetchWorkshopResponsables = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/users/role/RESP_WORKSHOP", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWorkshopResponsables(data);
            }
        } catch (error) {
            console.error("Error fetching workshopos responsibles:", error);
        }
    };

    const fetchCommitteeUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/users/role/MEMBRE_COMITE", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCommitteeUsers(data);
            }
        } catch (error) {
            console.error("Error fetching committee users:", error);
        }
    };

    const fetchPotentialGuests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/users/role/INVITE", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPotentialGuests(data);
            }
        } catch (error) {
            console.error("Error fetching potential guests:", error);
        }
    };

    const fetchCurrentAssignments = async (eventId) => {
        try {
            const response = await fetch(`/api/events/${eventId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedCommittee(data.comite?.map(m => m.id) || []);
                setSelectedGuests(data.invites || []);
                setSelectedLeaders(data.animateurs?.map(a => a.id) || []);
            }

            // Fetch workshops specifically for leaders mapping
            const token = localStorage.getItem("token");
            const progRes = await fetch(`/api/events/${eventId}/program`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (progRes.ok) {
                const progData = await progRes.json();
                setEventWorkshops(progData.workshops || []);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const fetchAllWorkshops = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/events/my-workshops", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEventWorkshops(data || []);
            }
        } catch (error) {
            console.error("Error fetching all workshops:", error);
        }
    };

    const updateLocalWorkshopLeader = (workshopId, leaderId) => {
        setEventWorkshops(prev => prev.map(w =>
            w.id === workshopId ? { ...w, responsable_id: leaderId ? parseInt(leaderId) : null } : w
        ));
    };

    const handleSaveCommittee = async () => {
        if (!selectedEventId) {
            alert("No event selected. Please select an event first.");
            return;
        }
        setSaveStatus("Saving committee...");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/add-comite`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ membres: selectedCommittee })
            });
            if (response.ok) {
                alert("Committee updated successfully!");
                setShowCommitteeModal(false);
                setSaveStatus("");
                fetchStats();
            } else {
                const errData = await response.json();
                alert("Error: " + (errData.message || "Unknown error"));
                setSaveStatus(errData.message || "Save failed");
            }
        } catch (error) {
            console.error("Error saving committee:", error);
            alert("Network error occurred while saving.");
            setSaveStatus("Network error");
        }
    };

    const handleSaveGuests = async () => {
        if (!selectedEventId) {
            alert("No event selected. Please select an event first.");
            return;
        }
        setSaveStatus("Saving guests...");
        try {
            const token = localStorage.getItem("token");
            const currentEvent = events.find(e => String(e.id) === String(selectedEventId));
            const eventTitle = currentEvent ? currentEvent.titre : "Scientific Conference";

            const payload = {
                invites: selectedGuests.map(g => ({
                    ...g,
                    sujet_conference: g.sujet_conference || eventTitle
                }))
            };

            const response = await fetch(`/api/events/${selectedEventId}/add-invite`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert("Guests updated successfully!");
                setShowGuestsModal(false);
                setSaveStatus("");
            } else {
                const errData = await response.json();
                alert("Error: " + (errData.message || "Unknown error"));
                setSaveStatus(errData.message || "Save failed");
            }
        } catch (error) {
            console.error("Error saving guests:", error);
            alert("Network error occurred while saving.");
            setSaveStatus("Network error");
        }
    };

    const handleSaveLeaders = async () => {
        if (!selectedEventId) {
            alert("No event selected. Please select an event first.");
            return;
        }
        setSaveStatus("Saving and syncing leaders...");
        try {
            const token = localStorage.getItem("token");

            // Collect both event-level pool and workshop-level assignments
            const payload = {
                animateurs: selectedLeaders,
                workshopAssignments: eventWorkshops.map(w => ({
                    workshopId: w.id,
                    leaderId: w.responsable_id
                })).filter(a => a.leaderId !== null)
            };

            const response = await fetch(`/api/events/${selectedEventId}/manage-animateurs`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert("Leaders and Workshops synchronized successfully!");
                setShowLeadersModal(false);
                setSaveStatus("");
                fetchRecentProgramme(); // Refresh dashboard
            } else {
                const errData = await response.json();
                alert("Error: " + (errData.message || "Unknown error"));
                setSaveStatus(errData.message || "Save failed");
            }
        } catch (error) {
            console.error("Error saving leaders:", error);
            alert("Network error occurred while saving.");
            setSaveStatus("Network error");
        }
    };

    const toggleCommitteeMember = (userId) => {
        setSelectedCommittee(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleLeader = (userId) => {
        setSelectedLeaders(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const addGuest = (user) => {
        if (selectedGuests.find(g => g.utilisateur_id === user.id)) return;

        const newGuest = {
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            sujet_conference: "",
            utilisateur_id: user.id
        };
        setSelectedGuests([...selectedGuests, newGuest]);
    };

    const removeGuest = (userId) => {
        setSelectedGuests(prev => prev.filter(g => g.utilisateur_id !== userId));
    };

    const updateGuestSujet = (userId, sujet) => {
        setSelectedGuests(prev => prev.map(g =>
            g.utilisateur_id === userId ? { ...g, sujet_conference: sujet } : g
        ));
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            if (response.ok) {
                const data = await response.json();
                const eventList = Array.isArray(data) ? data : (data.events || []);
                setEvents(eventList);
                if (eventList.length > 0) {
                    setSelectedEventId(eventList[0].id);
                } else {
                    setLoading(false);
                }
            } else {
                console.error("Failed to fetch events:", response.status);
                setEvents([]);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalSubmissions: data.submissionsCount || 0,
                    acceptanceRate: data.acceptanceRate?.rate || 0,
                    checkInsToday: 0,
                    upcomingEvents: events.length || 0,
                    totalParticipants: data.participantsByCountry?.reduce((sum, p) => sum + (p.count || 0), 0) || 0,
                    totalRevenue: 0
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentSubmissions = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/${selectedEventId}/submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const recent = (data || []).slice(0, 5);
                setRecentSubmissions(recent);
            }
        } catch (error) {
            console.error("Error fetching recent submissions:", error);
        }
    };

    const fetchRecentProgramme = async () => {
        try {
            const token = localStorage.getItem("token");

            const sessionsRes = await fetch(`/api/events/${selectedEventId}/program`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let recentSessions = [];
            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                recentSessions = (data.sessions || []).map(s => ({ ...s, type: 'session' }));
            }

            const workshopsRes = await fetch(`/api/events/${selectedEventId}/workshops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let recentWorkshops = [];
            if (workshopsRes.ok) {
                const data = await workshopsRes.json();
                recentWorkshops = (data || []).map(w => ({ ...w, type: 'workshop' }));
            }

            const combined = [...recentSessions, ...recentWorkshops]
                .sort((a, b) => b.id - a.id)
                .slice(0, 5);

            setRecentProgramme(combined);
        } catch (error) {
            console.error("Error fetching recent programme:", error);
        }
    };

    const statsData = [
        { label: "Total Submissions", value: loading ? "..." : stats.totalSubmissions.toString(), icon: <FiClipboard />, color: "#0f9d8a" },
        { label: "Acceptance Rate", value: loading ? "..." : `${stats.acceptanceRate}%`, icon: <FiCheckCircle />, color: "#1a5c8a" },
        { label: "Total Participants", value: loading ? "..." : stats.totalParticipants.toString(), icon: <FiUsers />, color: "#f39c12" },
        { label: "Upcoming Events", value: loading ? "..." : stats.upcomingEvents.toString(), icon: <FiCalendar />, color: "#e74c3c" },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: "Pending", class: "status-pending" },
            accepted: { text: "Accepted", class: "status-accepted" },
            rejected: { text: "Rejected", class: "status-rejected" },
            revision: { text: "Revision", class: "status-revision" }
        };
        return badges[status] || badges.pending;
    };

    return (
        <AdminLayout>
            <div className="admin-dashboard-container">
                <header className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome back! Here's what's happening today.</p>
                    </div>
                </header>

                <div className="quick-actions-section" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <button onClick={() => navigate('/admin/events/new')} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #0f9d8a 0%, #0c7f70 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(15, 157, 138, 0.3)', transition: 'transform 0.2s' }}>
                        <FiCalendar size={20} /> Create Event
                    </button>
                    <button onClick={() => setShowSessionModal(true)} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #1a5c8a 0%, #144a6e 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(26, 92, 138, 0.3)', transition: 'transform 0.2s' }}>
                        <FiCheckCircle size={20} /> Create Session
                    </button>
                    <button onClick={() => setShowWorkshopModal(true)} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)', transition: 'transform 0.2s' }}>
                        <FiUsers size={20} /> Create Workshop
                    </button>
                    <button onClick={() => navigate("/admin/programme", { state: { eventId: selectedEventId } })} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(142, 68, 173, 0.3)', transition: 'transform 0.2s' }} disabled={!selectedEventId}>
                        <FiTrendingUp size={20} /> View Programme
                    </button>
                    <button onClick={() => { fetchCurrentAssignments(selectedEventId); setShowCommitteeModal(true); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)', transition: 'transform 0.2s' }} disabled={!selectedEventId}>
                        <FiAward size={20} /> Committee
                    </button>
                    <button onClick={() => { fetchCurrentAssignments(selectedEventId); setShowGuestsModal(true); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)', transition: 'transform 0.2s' }} disabled={!selectedEventId}>
                        <FiStar size={20} /> Guests
                    </button>
                    <button onClick={() => { fetchAllWorkshops(); setShowLeadersModal(true); }} style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)', transition: 'transform 0.2s' }}>
                        <FiUsers size={20} /> Leaders
                    </button>
                </div>

                {events.length === 0 && !loading ? (
                    <div className="admin-empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f8f9fa', borderRadius: '12px', margin: '2rem 0' }}>
                        <FiCalendar size={64} style={{ color: '#cbd5e0', marginBottom: '1rem' }} />
                        <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>No Events Yet</h2>
                        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Create your first event to start seeing dashboard statistics.</p>
                        <button onClick={() => navigate('/admin/events')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0f9d8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>Create Event</button>
                    </div>
                ) : (
                    <>
                        <div className="event-selector" style={{ marginBottom: "2rem" }}>
                            <label style={{ fontWeight: 600, marginRight: "1rem" }}>Select Event:</label>
                            <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.titre || event.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card" onClick={() => navigate('/admin/submissions', { state: { eventId: selectedEventId } })} style={{ cursor: 'pointer' }}>
                                <div className="stat-icon" style={{ backgroundColor: `${statsData[0].color}15`, color: statsData[0].color }}>{statsData[0].icon}</div>
                                <div className="stat-info"><h3>{statsData[0].value}</h3><p>{statsData[0].label}</p></div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon" style={{ backgroundColor: `${statsData[1].color}15`, color: statsData[1].color }}>{statsData[1].icon}</div>
                                <div className="stat-info"><h3>{statsData[1].value}</h3><p>{statsData[1].label}</p></div>
                            </div>
                            <div className="admin-stat-card" onClick={() => navigate('/admin/participants', { state: { eventId: selectedEventId } })} style={{ cursor: 'pointer' }}>
                                <div className="stat-icon" style={{ backgroundColor: `${statsData[2].color}15`, color: statsData[2].color }}>{statsData[2].icon}</div>
                                <div className="stat-info"><h3>{statsData[2].value}</h3><p>{statsData[2].label}</p></div>
                            </div>
                            <div className="admin-stat-card" onClick={() => navigate('/admin/events')} style={{ cursor: 'pointer' }}>
                                <div className="stat-icon" style={{ backgroundColor: `${statsData[3].color}15`, color: statsData[3].color }}>{statsData[3].icon}</div>
                                <div className="stat-info"><h3>{statsData[3].value}</h3><p>{statsData[3].label}</p></div>
                            </div>
                        </div>
                        <div className="admin-dashboard-grids" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                            <div className="admin-recent-activity">
                                <h2>Recent Submissions</h2>
                                {recentSubmissions.length > 0 ? (
                                    <div className="submissions-list">
                                        {recentSubmissions.map((submission) => (
                                            <div key={submission.id} className="submission-item">
                                                <div className="submission-info">
                                                    <h4>{submission.titre}</h4>
                                                    <p className="submission-author">by {submission.auteur_principal_prenom} {submission.auteur_principal_nom}</p>
                                                </div>
                                                <div className="submission-meta">
                                                    <span className={`status-badge ${getStatusBadge(submission.statut).class}`}>{getStatusBadge(submission.statut).text}</span>
                                                    <span className="submission-date">{new Date(submission.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="activity-placeholder"><p>No recent submissions yet.</p></div>
                                )}
                            </div>
                            <div className="admin-recent-activity">
                                <h2>Recent Programme Items</h2>
                                {recentProgramme.length > 0 ? (
                                    <div className="submissions-list">
                                        {recentProgramme.map((item) => (
                                            <div key={`${item.type}-${item.id}`} className="submission-item">
                                                <div className="submission-info">
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: item.type === 'session' ? '#1a5c8a' : '#f39c12', color: 'white', textTransform: 'uppercase', fontWeight: 'bold' }}>{item.type}</span>
                                                        <h4 style={{ margin: 0 }}>{item.titre}</h4>
                                                    </div>
                                                    <p className="submission-author"><FiMapPin size={12} /> {item.salle} | <FiClock size={12} /> {item.type === 'session' ? new Date(item.horaire).toLocaleTimeString() : new Date(item.date).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="submission-meta"><button onClick={() => navigate(item.type === 'session' ? '/admin/sessions' : '/admin/workshops', { state: { eventId: selectedEventId } })} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>Manage</button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="activity-placeholder"><p>No sessions or workshops yet.</p></div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Session Creation Modal */}
                {showSessionModal && (
                    <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: '#12324a' }}>Create New Session</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const token = localStorage.getItem("token");
                                    const response = await fetch(`/api/events/${sessionForm.eventId}/sessions/create`, {
                                        method: "POST",
                                        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                                        body: JSON.stringify({ titre: sessionForm.titre, horaire: sessionForm.horaire, salle: sessionForm.salle, president_id: sessionForm.president_id })
                                    });
                                    if (response.ok) {
                                        alert("Session created successfully!");
                                        setShowSessionModal(false);
                                        const eventId = sessionForm.eventId;
                                        setSessionForm({ eventId: "", titre: "", horaire: "", salle: "", president_id: "" });
                                        navigate("/admin/sessions", { state: { eventId: eventId } });
                                    } else {
                                        const error = await response.json();
                                        alert(`Error: ${error.message}`);
                                    }
                                } catch (error) {
                                    console.error("Error creating session:", error);
                                    alert("Failed to create session");
                                }
                            }}>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Event *</label><select required value={sessionForm.eventId} onChange={(e) => setSessionForm({ ...sessionForm, eventId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Choose an event...</option>{events.map(event => (<option key={event.id} value={event.id}>{event.titre || event.title}</option>))}</select></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Session Title *</label><input type="text" required value={sessionForm.titre} onChange={(e) => setSessionForm({ ...sessionForm, titre: e.target.value })} placeholder="e.g., Advances in Neurology" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date & Time *</label><input type="datetime-local" required value={sessionForm.horaire} onChange={(e) => setSessionForm({ ...sessionForm, horaire: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Room/Location *</label><input type="text" required value={sessionForm.salle} onChange={(e) => setSessionForm({ ...sessionForm, salle: e.target.value })} placeholder="e.g., Hall A" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Chair/President *</label><select required value={sessionForm.president_id} onChange={(e) => setSessionForm({ ...sessionForm, president_id: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Select a speaker...</option>{communicants.map(c => (<option key={c.id} value={c.id}>{c.nom} {c.prenom} ({c.institution || 'N/A'})</option>))}</select></div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}><button type="button" onClick={() => setShowSessionModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button><button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#1a5c8a', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Create Session</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Workshop Creation Modal */}
                {showWorkshopModal && (
                    <div className="modal-overlay" onClick={() => setShowWorkshopModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: '#12324a' }}>Create New Workshop</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const token = localStorage.getItem("token");
                                    const response = await fetch(`/api/events/${workshopForm.eventId}/workshops`, {
                                        method: "POST",
                                        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                                        body: JSON.stringify({ titre: workshopForm.titre, date: workshopForm.date, salle: workshopForm.salle, responsable_id: parseInt(workshopForm.responsable_id), nb_places: parseInt(workshopForm.nb_places) })
                                    });
                                    if (response.ok) {
                                        alert("Workshop created successfully!");
                                        setShowWorkshopModal(false);
                                        const eventId = workshopForm.eventId;
                                        setWorkshopForm({ eventId: "", titre: "", date: "", salle: "", responsable_id: "", nb_places: "" });
                                        navigate("/admin/workshops", { state: { eventId: eventId } });
                                    } else {
                                        const error = await response.json();
                                        alert(`Error: ${error.message || (error.errors && error.errors[0].msg) || "Bad Request"}`);
                                    }
                                } catch (error) {
                                    console.error("Error creating workshop:", error);
                                    alert("Failed to create workshop");
                                }
                            }}>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Event *</label><select required value={workshopForm.eventId} onChange={(e) => setWorkshopForm({ ...workshopForm, eventId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Choose an event...</option>{events.map(event => (<option key={event.id} value={event.id}>{event.titre || event.title}</option>))}</select></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Workshop Title *</label><input type="text" required value={workshopForm.titre} onChange={(e) => setWorkshopForm({ ...workshopForm, titre: e.target.value })} placeholder="e.g., Hands-on Surgery Techniques" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date & Time *</label><input type="datetime-local" required value={workshopForm.date} onChange={(e) => setWorkshopForm({ ...workshopForm, date: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Room/Location *</label><input type="text" required value={workshopForm.salle} onChange={(e) => setWorkshopForm({ ...workshopForm, salle: e.target.value })} placeholder="e.g., Workshop Room 1" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Responsible (Workshop Manager) *</label><select required value={workshopForm.responsable_id} onChange={(e) => setWorkshopForm({ ...workshopForm, responsable_id: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><option value="">Select a workshop responsible...</option>{workshopResponsables.map(c => (<option key={c.id} value={c.id}>{c.nom} {c.prenom} ({c.institution || 'N/A'})</option>))}</select></div>
                                <div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Capacity (Places) *</label><input type="number" required value={workshopForm.nb_places} onChange={(e) => setWorkshopForm({ ...workshopForm, nb_places: e.target.value })} placeholder="e.g., 30" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}><button type="button" onClick={() => setShowWorkshopModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button><button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#f39c12', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Create Workshop</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Committee Management Modal */}
                {showCommitteeModal && (
                    <div className="modal-overlay" onClick={() => { setShowCommitteeModal(false); setSaveStatus(""); }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', background: 'white', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: '#12324a' }}>Manage Scientific Committee</h2>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Event:</label>
                                <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <option value="">Select an Event</option>
                                    {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.titre}</option>))}
                                </select>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                                {committeeUsers.map(user => (
                                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f0f0f0', gap: '1rem' }}>
                                        <input type="checkbox" checked={selectedCommittee.includes(user.id)} onChange={() => toggleCommitteeMember(user.id)} style={{ width: '20px', height: '20px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600' }}>{user.nom} {user.prenom}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.institution || 'No Institution'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {saveStatus && <span style={{ color: '#0f9d8a', fontSize: '0.9rem', fontWeight: 'bold' }}>{saveStatus}</span>}
                                <button type="button" onClick={() => { setShowCommitteeModal(false); setSaveStatus(""); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="button" onClick={handleSaveCommittee} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#0f9d8a', color: 'white', cursor: 'pointer', fontWeight: '600', position: 'relative', zIndex: 10005, boxShadow: '0 4px 12px rgba(15, 157, 138, 0.4)' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guests Management Modal */}
                {showGuestsModal && (
                    <div className="modal-overlay" onClick={() => { setShowGuestsModal(false); setSaveStatus(""); }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', background: 'white', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1rem', color: '#12324a' }}>Manage Invited Guests</h2>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Event:</label>
                                <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <option value="">Select an Event</option>
                                    {events.map(ev => (<option key={ev.id} value={ev.id}>{ev.titre}</option>))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Available Users (Invitees)</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                                        {potentialGuests.map(user => (
                                            <div key={user.id} style={{ padding: '0.5rem', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{user.nom} {user.prenom}</span>
                                                <button type="button" onClick={() => addGuest(user)} disabled={selectedGuests.find(g => g.utilisateur_id === user.id)} style={{ fontSize: '0.8rem', padding: '2px 8px' }}>Add</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Selected for Event</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {selectedGuests.map(guest => (
                                            <div key={guest.utilisateur_id} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '600' }}>{guest.nom} {guest.prenom}</span>
                                                    <button type="button" onClick={() => removeGuest(guest.utilisateur_id)} style={{ color: 'red', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', alignItems: 'center' }}>
                                {saveStatus && <span style={{ color: '#e67e22', fontSize: '0.9rem', fontWeight: 'bold' }}>{saveStatus}</span>}
                                <button type="button" onClick={() => { setShowGuestsModal(false); setSaveStatus(""); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="button" onClick={handleSaveGuests} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#e67e22', color: 'white', cursor: 'pointer', fontWeight: '600', position: 'relative', zIndex: 10005, boxShadow: '0 4px 12px rgba(230, 126, 34, 0.4)' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaders Management Modal */}
                {showLeadersModal && (
                    <div className="modal-overlay" onClick={() => { setShowLeadersModal(false); setSaveStatus(""); }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', background: 'white', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '0.5rem', color: '#12324a' }}>Manage Workshop Leaders</h2>
                            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Assign leaders to any workshop in the system.</p>

                            <div style={{ maxHeight: '500px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #27ae60', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiUsers /> 1. Select a Leader to Assign
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                                    {workshopResponsables.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => setSessionForm({ ...sessionForm, president_id: user.id })} // Reusing a state temporarily or just use local logic
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                padding: '0.75rem',
                                                border: sessionForm.president_id === user.id ? '2px solid #27ae60' : '1px solid #f0f0f0',
                                                background: sessionForm.president_id === user.id ? '#f3fdf6' : 'white',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.nom} {user.prenom}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>{user.institution || 'No Institution'}</span>
                                        </div>
                                    ))}
                                </div>

                                <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiClipboard /> 2. Select Workshops for this Leader
                                </h4>

                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                                    {!sessionForm.president_id ? (
                                        <p style={{ textAlign: 'center', color: '#e67e22', fontWeight: '600', padding: '1rem' }}>Please select a leader above first</p>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {eventWorkshops.map(ws => (
                                                <div
                                                    key={ws.id}
                                                    onClick={() => updateLocalWorkshopLeader(ws.id, ws.responsable_id === sessionForm.president_id ? null : sessionForm.president_id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '1rem',
                                                        background: 'white',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                        gap: '1rem'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        readOnly
                                                        checked={ws.responsable_id === sessionForm.president_id}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', color: '#2d3748' }}>{ws.titre}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Event: {ws.event_titre || 'N/A'}</div>
                                                    </div>
                                                    {ws.responsable_id && ws.responsable_id !== sessionForm.president_id && (
                                                        <div style={{ fontSize: '0.7rem', background: '#fff5f5', color: '#c53030', padding: '2px 8px', borderRadius: '4px' }}>
                                                            Replaces: {ws.responsable_nom || 'Unknown'}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {saveStatus && <span style={{ color: '#27ae60', fontSize: '0.9rem', fontWeight: 'bold' }}>{saveStatus}</span>}
                                <button type="button" onClick={() => { setShowLeadersModal(false); setSaveStatus(""); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="button" onClick={handleSaveLeaders} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#27ae60', color: 'white', cursor: 'pointer', fontWeight: '600', position: 'relative', zIndex: 10005, boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)' }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
