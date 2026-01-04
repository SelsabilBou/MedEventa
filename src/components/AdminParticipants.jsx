import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiUsers, FiSearch, FiMail, FiDownload, FiDollarSign } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import "./AdminParticipants.css";

const AdminParticipants = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [participants, setParticipants] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || "");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchParticipants();
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const response = await fetch("/api/events");
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                if (data.length > 0 && !selectedEventId) {
                    setSelectedEventId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            // Correct endpoint: /api/inscriptions/event/:eventId/participants
            const response = await fetch(`/api/inscriptions/event/${selectedEventId}/participants`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Map backend fields to frontend state
                const mapped = (data.participants || []).map(p => ({
                    id: p.inscriptionId,
                    utilisateurId: p.utilisateurId,
                    nom: p.nom,
                    prenom: p.prenom,
                    email: p.email,
                    role: p.profil,
                    etat_paiement: p.statut_paiement,
                    created_at: p.date_inscription,
                    workshops: p.workshops,
                    sessions: p.sessions,
                    communications: p.communications
                }));
                setParticipants(mapped);
            } else {
                setParticipants([]);
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
            setParticipants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePayment = async (inscriptionId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/inscriptions/${inscriptionId}/payment-status`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ statut_paiement: newStatus })
            });

            if (response.ok) {
                setParticipants(prev => prev.map(p =>
                    p.id === inscriptionId ? { ...p, etat_paiement: newStatus } : p
                ));
                alert(`Payment status updated to ${newStatus}`);
            } else {
                alert("Failed to update payment status");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Failed to update payment status");
        }
    };

    const filteredParticipants = participants.filter(p =>
        (p.nom && p.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.prenom && p.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getPaymentStatusBadge = (status) => {
        if (status === "paye" || status === "paid" || status === "paye_sur_place" || status === "paye_en_ligne") {
            return <span className="status-badge status-accepted">Paid</span>;
        }
        return <span className="status-badge status-pending">To Pay</span>;
    };

    return (
        <AdminLayout>
            <div className="admin-participants-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Participants & Registrations</h1>
                        <p>Monitor registrations and payment statuses for your event.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary"><FiDownload /> Export CSV</button>
                    </div>
                </header>

                <div className="table-controls">
                    <div className="event-selector-admin">
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.titre || event.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="submissions-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Participant</th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th>Involvement</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParticipants.map(participant => (
                                <tr key={participant.id}>
                                    <td className="col-name">
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {(participant.prenom || participant.nom || "U").charAt(0)}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: 600 }}>{participant.prenom} {participant.nom}</span>
                                                <span style={{ fontSize: "0.75rem", color: "#6c8895" }}>Registered: {new Date(participant.created_at || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "0.9rem" }}>{participant.email}</div>
                                    </td>
                                    <td>
                                        <span className="role-badge" style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "#6c8895" }}>
                                            {participant.role || "Participant"}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: "300px" }}>
                                        <div className="involvement-details" style={{ fontSize: "0.85rem" }}>
                                            {participant.workshops && (
                                                <div title={participant.workshops} style={{ marginBottom: "0.25rem" }}>
                                                    <strong>Workshops:</strong> <span style={{ color: "#0f9d8a" }}>{participant.workshops}</span>
                                                </div>
                                            )}
                                            {participant.sessions && (
                                                <div title={participant.sessions} style={{ marginBottom: "0.25rem" }}>
                                                    <strong>Sessions:</strong> <span style={{ color: "#3182ce" }}>{participant.sessions}</span>
                                                </div>
                                            )}
                                            {participant.communications && (
                                                <div title={participant.communications}>
                                                    <strong>Papers:</strong> <span style={{ fontStyle: "italic", color: "#718096" }}>{participant.communications}</span>
                                                </div>
                                            )}
                                            {!participant.workshops && !participant.sessions && !participant.communications && (
                                                <span style={{ color: "#a0aec0" }}>Attendee only</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {getPaymentStatusBadge(participant.etat_paiement)}
                                    </td>
                                    <td className="col-actions">
                                        <button className="btn-table-action" title="Send Email"><FiMail /></button>
                                        <button
                                            className="btn-table-action"
                                            title="Update Payment"
                                            onClick={() => {
                                                const newStatus = (participant.etat_paiement === "paye_sur_place" || participant.etat_paiement === "paye_en_ligne") ? "a_payer" : "paye_sur_place";
                                                handleUpdatePayment(participant.id, newStatus);
                                            }}
                                        >
                                            <FiDollarSign />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredParticipants.length === 0 && !loading && (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#6c8895" }}>
                            No participants registered yet for this event.
                        </div>
                    )}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#6c8895" }}>
                            Loading participants...
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminParticipants;
