import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiUsers, FiSearch, FiMail, FiDownload, FiDollarSign } from "react-icons/fi";
import "./AdminParticipants.css";

const AdminParticipants = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [participants, setParticipants] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
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
                if (data.length > 0) {
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
            const response = await fetch(`/api/events/${selectedEventId}/inscriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setParticipants(data || []);
            } else {
                // Fallback to mock data if endpoint not ready
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
            const response = await fetch(`/api/inscriptions/${inscriptionId}/payment`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ etat_paiement: newStatus })
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
        if (status === "paye" || status === "paid") {
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

                <div className="table-controls">
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Payment Status</th>
                                <th>Reg. Date</th>
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
                                            <span>{participant.prenom} {participant.nom}</span>
                                        </div>
                                    </td>
                                    <td>{participant.email}</td>
                                    <td>{participant.role || "Participant"}</td>
                                    <td>
                                        {getPaymentStatusBadge(participant.etat_paiement)}
                                    </td>
                                    <td>{new Date(participant.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td className="col-actions">
                                        <button className="btn-table-action" title="Send Email"><FiMail /></button>
                                        <button
                                            className="btn-table-action"
                                            title="Update Payment"
                                            onClick={() => {
                                                const newStatus = participant.etat_paiement === "paye" ? "a_payer" : "paye";
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
