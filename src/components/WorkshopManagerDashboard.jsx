import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FiCalendar, FiUsers, FiFileText, FiTrash2, FiUpload,
    FiClock, FiMapPin, FiCheckCircle, FiInfo, FiX, FiDownload,
    FiPlus, FiEdit, FiAward, FiMessageSquare, FiShare2, FiBox
} from "react-icons/fi";
import "./WorkshopManagerDashboard.css";
import AdminLayout from "./AdminLayout";

const WorkshopManagerDashboard = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [supports, setSupports] = useState([]);
    const [viewMode, setViewMode] = useState(null); // 'attendees', 'supports', or 'create'
    const [events, setEvents] = useState([]);
    const [workshopForm, setWorkshopForm] = useState({
        titre: '',
        description: '',
        date: '',
        salle: '',
        level: 'beginner',
        price: 0,
        nb_places: 30,
        evenement_id: ''
    });
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const rawUser = localStorage.getItem("user");
    const currentUser = rawUser ? JSON.parse(rawUser) : null;

    useEffect(() => {
        fetchMyWorkshops();
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get("/api/events");
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchMyWorkshops = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/events/my-workshops", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkshops(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching workshops:", error);
            setLoading(false);
        }
    };

    const fetchAttendees = async (workshopId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`/api/events/workshops/${workshopId}/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendees(response.data);
        } catch (error) {
            console.error("Error fetching attendees:", error);
        }
    };

    const fetchSupports = async (workshopId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`/api/events/workshops/${workshopId}/supports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupports(response.data);
        } catch (error) {
            console.error("Error fetching supports:", error);
        }
    };

    const handleOpenManage = (workshop, mode) => {
        setSelectedWorkshop(workshop);
        setViewMode(mode);
        if (mode === 'attendees') fetchAttendees(workshop.id);
        if (mode === 'supports') fetchSupports(workshop.id);
        if (mode === 'edit') {
            setWorkshopForm({
                titre: workshop.titre || '',
                description: workshop.description || '',
                date: workshop.date ? workshop.date.slice(0, 16) : '',
                salle: workshop.salle || '',
                level: workshop.level || 'beginner',
                price: workshop.price || 0,
                nb_places: workshop.nb_places || 30,
                evenement_id: workshop.evenement_id || ''
            });
        }
    };

    const handleOpenCreate = () => {
        setWorkshopForm({
            titre: '',
            description: '',
            date: '',
            salle: '',
            level: 'beginner',
            price: 0,
            nb_places: 30,
            evenement_id: events.length > 0 ? events[0].id : ''
        });
        setViewMode('create');
    };

    const handleCloseManage = () => {
        setSelectedWorkshop(null);
        setViewMode(null);
        setAttendees([]);
        setSupports([]);
        setWorkshopForm({
            titre: '',
            description: '',
            date: '',
            salle: '',
            level: 'beginner',
            price: 0,
            nb_places: 30,
            evenement_id: ''
        });
        setBroadcastMsg("");
        setIsBroadcasting(false);
    };

    const handleRemoveAttendee = async (participantId) => {
        if (!window.confirm("Are you sure you want to remove this attendee?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/events/workshops/${selectedWorkshop.id}/participants/${participantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendees(attendees.filter(a => Number(a.participant_id) !== Number(participantId)));
        } catch (error) {
            console.error("Error removing attendee:", error);
            alert("Failed to remove attendee");
        }
    };

    const handleUploadSupport = async (e) => {
        e.preventDefault();
        const type = e.target.elements.type.value;
        const title = e.target.elements.title.value;
        const token = localStorage.getItem("token");

        if (type === 'link') {
            const url = e.target.elements.url.value;
            try {
                await axios.post(`/api/events/workshops/${selectedWorkshop.id}/supports`,
                    { type: 'link', titre: title, url },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchSupports(selectedWorkshop.id);
                e.target.reset();
            } catch (error) {
                alert("Failed to add link");
            }
            return;
        }

        const formData = new FormData();
        const fileInput = e.target.elements.file;

        if (!fileInput.files[0]) return;

        formData.append("file", fileInput.files[0]);
        formData.append("type", type);
        formData.append("titre", title);

        try {
            await axios.post(`/api/events/workshops/${selectedWorkshop.id}/supports`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            fetchSupports(selectedWorkshop.id);
            e.target.reset();
        } catch (error) {
            console.error("Error uploading support:", error);
            alert("Upload failed. Max 20MB.");
        }
    };

    const handleDeleteSupport = async (supportId) => {
        if (!window.confirm("Delete this support file?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/events/workshops/supports/${supportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupports(supports.filter(s => s.id !== supportId));
        } catch (error) {
            console.error("Error deleting support:", error);
        }
    };

    const handleToggleRegistration = async (workshop) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/events/workshops/${workshop.id}`,
                { ouvert: !workshop.ouvert },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMyWorkshops();
        } catch (error) {
            console.error("Error toggling registration:", error);
            alert("Failed to update status");
        }
    };

    const handlePresenceToggle = async (attendee) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/events/workshops/registrations/${attendee.inscription_id}/presence`,
                { presence: !attendee.presence },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAttendees(attendees.map(a => a.inscription_id === attendee.inscription_id ? { ...a, presence: !a.presence } : a));
        } catch (error) {
            console.error("Error toggling presence:", error);
        }
    };

    const handleConfirmationToggle = async (attendee) => {
        const nextStatus = attendee.confirmation_status === 'confirmed' ? 'pending' : 'confirmed';
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/events/workshops/registrations/${attendee.inscription_id}/confirmation`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAttendees(attendees.map(a => a.inscription_id === attendee.inscription_id ? { ...a, confirmation_status: nextStatus } : a));
        } catch (error) {
            console.error("Error toggling confirmation:", error);
        }
    };

    const handleCreateWorkshop = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/events/${workshopForm.evenement_id}/workshops`,
                {
                    ...workshopForm,
                    responsable_id: currentUser.id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Workshop created successfully!");
            handleCloseManage();
            fetchMyWorkshops();
            // Notify Event Details page to refresh workshops
            window.dispatchEvent(new CustomEvent('workshop-created', {
                detail: { eventId: workshopForm.evenement_id }
            }));
        } catch (error) {
            console.error("Error creating workshop:", error);
            alert(error.response?.data?.message || "Failed to create workshop");
        }
    };

    const handleUpdateWorkshop = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`/api/events/workshops/${selectedWorkshop.id}`,
                workshopForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Workshop updated successfully!");
            handleCloseManage();
            fetchMyWorkshops();
        } catch (error) {
            console.error("Error updating workshop:", error);
            alert(error.response?.data?.message || "Failed to update workshop");
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/messages/broadcast/workshop/${selectedWorkshop.id}`,
                {
                    contenu: broadcastMsg,
                    evenement_id: selectedWorkshop.evenement_id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Message sent to all participants!");
            setBroadcastMsg("");
            setViewMode('attendees');
        } catch (error) {
            console.error("Error sending broadcast:", error);
            alert(error.response?.data?.message || "Failed to send broadcast");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleDownloadCertificate = async (workshop) => {
        try {
            const token = localStorage.getItem("token");
            // Assuming type 'animateur' or 'responsable'
            await axios.post("/api/attestations/me/generate",
                { evenementId: workshop.evenement_id, type: 'organisateur' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.open(`/api/attestations/me/download?type=organisateur&eventId=${workshop.evenement_id}&token=${token}`, '_blank');
        } catch (error) {
            alert("Certificate generation failed. It may only be available after the event ends.");
        }
    };

    const exportToCSV = () => {
        if (!attendees.length) return;
        const headers = "Name,Email,Status,Presence\n";
        const rows = attendees.map(a => `${a.nom} ${a.prenom},${a.email},${a.confirmation_status},${a.presence ? 'Present' : 'Absent'}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `attendees_${selectedWorkshop.titre.replace(/\s+/g, '_')}.csv`);
        a.click();
    };

    const totalPlaces = workshops.reduce((sum, ws) => sum + (ws.nb_places || 0), 0);
    const totalRegistered = workshops.reduce((sum, ws) => sum + (ws.registered_count || 0), 0);
    const occupancyRate = totalPlaces > 0 ? Math.round((totalRegistered / totalPlaces) * 100) : 0;

    if (loading) return (
        <div className="workshop-loading">
            <div className="spinner"></div>
            <p>Loading your workshops...</p>
        </div>
    );

    return (
        <AdminLayout>
            <div className="workshop-manager-dashboard">
                <header className="dashboard-header">
                    <div className="header-flex">
                        <div>
                            <h1>Workshop Solutions</h1>
                            <p>Manage speakers, materials, and certificates.</p>
                        </div>
                        <button className="btn-primary" onClick={handleOpenCreate}>
                            <FiPlus /> New Workshop
                        </button>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <FiCalendar className="icon ws" />
                        <div className="stat-info">
                            <h3>{workshops.length}</h3>
                            <p>Workshops</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiUsers className="icon users" />
                        <div className="stat-info">
                            <h3>{totalPlaces}</h3>
                            <p>Total Capacity</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FiCheckCircle className="icon success" />
                        <div className="stat-info">
                            <h3>{occupancyRate}%</h3>
                            <p>Occupancy Rate</p>
                        </div>
                    </div>
                </div>

                <main className="dashboard-main">
                    <div className="section-header">
                        <h2>My Assigned Workshops</h2>
                    </div>

                    {workshops.length === 0 ? (
                        <div className="empty-state">
                            <FiInfo size={48} />
                            <p>No workshops have been assigned to you yet.</p>
                            <button className="btn-primary" onClick={handleOpenCreate} style={{ marginTop: '1.5rem' }}>
                                <FiPlus /> Create Your First Workshop
                            </button>
                        </div>
                    ) : (
                        <div className="workshops-grid">
                            {workshops.map(ws => (
                                <div key={ws.id} className="workshop-card">
                                    <div className="card-header">
                                        <span className="event-badge">{ws.event_titre || "MedEventa Event"}</span>
                                        <h3 className="workshop-title">{ws.titre}</h3>
                                    </div>

                                    <div className="workshop-meta">
                                        <div className="meta-item">
                                            <FiClock /> <span>{new Date(ws.date).toLocaleString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <FiMapPin /> <span>{ws.salle || 'Room TBD'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <FiUsers /> <span>{ws.registered_count || 0} / {ws.nb_places} Places ({ws.ouvert ? 'Open' : 'Closed'})</span>
                                        </div>
                                    </div>

                                    <div className="card-actions-v2">
                                        <button
                                            className={`btn-toggle ${ws.ouvert ? 'open' : 'closed'}`}
                                            onClick={() => handleToggleRegistration(ws)}
                                        >
                                            {ws.ouvert ? 'Close Registration' : 'Open Registration'}
                                        </button>
                                    </div>

                                    <div className="card-actions">
                                        <button className="btn-secondary" onClick={() => handleOpenManage(ws, 'attendees')}>
                                            <FiUsers /> Attendees
                                        </button>
                                        <button className="btn-secondary" onClick={() => handleOpenManage(ws, 'edit')}>
                                            <FiEdit /> Edit
                                        </button>
                                        <button className="btn-primary" onClick={() => handleOpenManage(ws, 'supports')}>
                                            <FiFileText /> Materials
                                        </button>
                                        <button className="btn-outline btn-cert" onClick={() => handleDownloadCertificate(ws)}>
                                            <FiAward /> Certificate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Management Modal */}
                {(selectedWorkshop || viewMode === 'create') && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div>
                                    <h2>
                                        {viewMode === 'attendees' ? 'Manage Attendees' :
                                            viewMode === 'supports' ? 'Course Materials' :
                                                viewMode === 'edit' ? 'Edit Workshop' :
                                                    viewMode === 'broadcast' ? 'Broadcast Message' :
                                                        'Create New Workshop'}
                                    </h2>
                                    <p className="subtitle">
                                        {viewMode === 'create' ? 'Define a new session' :
                                            viewMode === 'edit' ? `Editing: ${selectedWorkshop?.titre || 'Workshop'}` :
                                                viewMode === 'broadcast' ? `To: All participants of ${selectedWorkshop?.titre}` :
                                                    selectedWorkshop?.titre || 'Loading...'}
                                    </p>
                                </div>
                                <button className="close-btn" onClick={handleCloseManage}><FiX /></button>
                            </div>

                            <div className="modal-body">
                                {viewMode === 'attendees' && (
                                    <div className="attendees-panel">
                                        <div className="panel-actions">
                                            <div className="panel-stats">
                                                <span>Registered: <strong>{attendees.length}</strong> / {selectedWorkshop.nb_places}</span>
                                                <span className="waitlist-tag">Waitlist: {selectedWorkshop.waitlist_count || 0}</span>
                                            </div>
                                            <div className="panel-buttons">
                                                <button className="btn-outline btn-small" onClick={exportToCSV}>
                                                    <FiDownload /> Export CSV
                                                </button>
                                                <button className="btn-primary btn-small" onClick={() => setViewMode('broadcast')}>
                                                    <FiMessageSquare /> Message All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="attendees-list">
                                            {attendees.length === 0 ? (
                                                <p className="empty-msg">No one has registered for this workshop yet.</p>
                                            ) : (
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Status</th>
                                                            <th>Presence</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {attendees.map(att => (
                                                            <tr key={att.participant_id}>
                                                                <td>{att.nom} {att.prenom}</td>
                                                                <td className="dimmed">{att.email}</td>
                                                                <td>
                                                                    <button
                                                                        className={`status-pill ${att.confirmation_status}`}
                                                                        onClick={() => handleConfirmationToggle(att)}
                                                                    >
                                                                        {att.confirmation_status}
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <div className="presence-check" onClick={() => handlePresenceToggle(att)}>
                                                                        {att.presence ? <FiCheckCircle className="checked" /> : <div className="unchecked" />}
                                                                        <span>Present</span>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button className="btn-danger-icon" onClick={() => handleRemoveAttendee(att.participant_id)}>
                                                                        <FiTrash2 />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'supports' && (
                                    <div className="supports-panel">
                                        <form onSubmit={handleUploadSupport} className="upload-box">
                                            <h4>Add Resource</h4>
                                            <div className="upload-inputs-v2">
                                                <div className="form-group-v2">
                                                    <label>Resource Title</label>
                                                    <input type="text" name="title" placeholder="e.g. Workshop Slides" required />
                                                </div>
                                                <div className="form-group-v2">
                                                    <label>Type</label>
                                                    <select name="type" id="support-type" onChange={(e) => {
                                                        const fileGroup = document.getElementById('file-input-group');
                                                        const urlGroup = document.getElementById('url-input-group');
                                                        if (e.target.value === 'link') {
                                                            fileGroup.style.display = 'none';
                                                            urlGroup.style.display = 'block';
                                                        } else {
                                                            fileGroup.style.display = 'block';
                                                            urlGroup.style.display = 'none';
                                                        }
                                                    }}>
                                                        <option value="pdf">PDF Document</option>
                                                        <option value="ppt">PowerPoint (PPT)</option>
                                                        <option value="zip">Source Code (ZIP)</option>
                                                        <option value="link">External Link</option>
                                                    </select>
                                                </div>
                                                <div className="form-group-v2" id="file-input-group">
                                                    <label>File</label>
                                                    <div className="file-input-wrapper">
                                                        <input type="file" name="file" id="file" />
                                                        <label htmlFor="file" className="file-label"><FiUpload /> Select File</label>
                                                    </div>
                                                </div>
                                                <div className="form-group-v2" id="url-input-group" style={{ display: 'none' }}>
                                                    <label>URL</label>
                                                    <input type="url" name="url" placeholder="https://..." />
                                                </div>
                                                <button type="submit" className="btn-primary">Add Resource</button>
                                            </div>
                                        </form>

                                        <div className="materials-list">
                                            <h4>Shared Resources</h4>
                                            {supports.length === 0 ? (
                                                <p className="empty-msg">No materials uploaded yet.</p>
                                            ) : (
                                                <div className="materials-grid">
                                                    {supports.map(sup => (
                                                        <div key={sup.id} className="material-item">
                                                            {sup.type === 'link' ? <FiShare2 className="doc-icon link" /> :
                                                                sup.type === 'zip' ? <FiBox className="doc-icon zip" /> :
                                                                    <FiFileText className="doc-icon" />}
                                                            <div className="doc-info">
                                                                <a href={sup.type === 'link' ? sup.url : `http://localhost:5000/${sup.url}`} target="_blank" rel="noopener noreferrer">
                                                                    {sup.titre}
                                                                </a>
                                                                <span>{sup.type.toUpperCase()} Support</span>
                                                            </div>
                                                            <button className="btn-danger-icon" onClick={() => handleDeleteSupport(sup.id)}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'broadcast' && (
                                    <div className="broadcast-panel">
                                        <form onSubmit={handleSendBroadcast}>
                                            <div className="form-group">
                                                <label>Your Message</label>
                                                <textarea
                                                    value={broadcastMsg}
                                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                                    placeholder="Type your message to all attendees..."
                                                    rows="6"
                                                    required
                                                    className="broadcast-textarea"
                                                />
                                            </div>
                                            <div className="panel-buttons" style={{ marginTop: '1rem' }}>
                                                <button type="submit" className="btn-primary" disabled={isBroadcasting}>
                                                    {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
                                                </button>
                                                <button type="button" className="btn-secondary" onClick={() => setViewMode('attendees')}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {(viewMode === 'create' || viewMode === 'edit') && (
                                    <div className="create-panel">
                                        <form onSubmit={viewMode === 'create' ? handleCreateWorkshop : handleUpdateWorkshop} className="modern-form">
                                            {viewMode === 'create' && (
                                                <div className="form-group">
                                                    <label>Event</label>
                                                    <select
                                                        value={workshopForm.evenement_id}
                                                        onChange={e => setWorkshopForm({ ...workshopForm, evenement_id: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select an Event</option>
                                                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.titre}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label>Workshop Title</label>
                                                <input
                                                    type="text"
                                                    value={workshopForm.titre}
                                                    onChange={e => setWorkshopForm({ ...workshopForm, titre: e.target.value })}
                                                    placeholder="Workshop title..."
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    value={workshopForm.description}
                                                    onChange={e => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                                                    placeholder="A brief summary of what participants will learn..."
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={workshopForm.date}
                                                        onChange={e => setWorkshopForm({ ...workshopForm, date: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Room / Location</label>
                                                    <input
                                                        type="text"
                                                        value={workshopForm.salle}
                                                        onChange={e => setWorkshopForm({ ...workshopForm, salle: e.target.value })}
                                                        placeholder="Hall B, Room 102..."
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Level</label>
                                                    <select
                                                        value={workshopForm.level}
                                                        onChange={e => setWorkshopForm({ ...workshopForm, level: e.target.value })}
                                                    >
                                                        <option value="beginner">Beginner</option>
                                                        <option value="advanced">Advanced</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Price ($)</label>
                                                    <input
                                                        type="number"
                                                        value={workshopForm.price}
                                                        onChange={e => setWorkshopForm({ ...workshopForm, price: e.target.value })}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Capacity</label>
                                                <input
                                                    type="number"
                                                    value={workshopForm.nb_places}
                                                    onChange={e => setWorkshopForm({ ...workshopForm, nb_places: e.target.value })}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <div className="modal-actions-footer">
                                                <button type="button" className="btn-secondary" onClick={handleCloseManage}>Cancel</button>
                                                <button type="submit" className="btn-primary">
                                                    {viewMode === 'create' ? 'Create Workshop' : 'Update Workshop'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default WorkshopManagerDashboard;
