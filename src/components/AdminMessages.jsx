import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiSend, FiUsers, FiFilter, FiPaperclip, FiMail, FiCheckCircle } from "react-icons/fi";
import "./AdminMessages.css";

const AdminMessages = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [recipient, setRecipient] = useState("all");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sentMessages, setSentMessages] = useState([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchEvents();
        fetchSentMessages();
    }, []);

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

    const fetchSentMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/messages", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSentMessages(data || []);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async () => {
        if (!message || !subject) {
            alert("Please fill in both subject and message");
            return;
        }

        try {
            setSending(true);
            const token = localStorage.getItem("token");
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    destinataire_id: recipient === "all" ? null : recipient,
                    objet: subject,
                    contenu: message,
                    type_destinataire: recipient // all, speakers, committee, pending, participants, authors
                })
            });

            if (response.ok) {
                alert("Message sent successfully!");
                setMessage("");
                setSubject("");
                fetchSentMessages();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to send message"}`);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-messages-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Internal Messaging</h1>
                        <p>Send notifications and updates to participants, speakers, or committees.</p>
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

                <div className="composer-wrapper">
                    <div className="composer-header">
                        <FiMail style={{ fontSize: "1.5rem", color: "#0f9d8a" }} />
                        <h3>New Announcement</h3>
                    </div>

                    <div className="composer-body">
                        <div className="input-group">
                            <label>Recipients *</label>
                            <div className="select-wrapper">
                                <FiUsers className="select-icon" />
                                <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                                    <option value="all">All Registered Users</option>
                                    <option value="participants">Participants Only</option>
                                    <option value="speakers">Invited Speakers Only</option>
                                    <option value="authors">Authors/Communicants</option>
                                    <option value="committee">Scientific Committee</option>
                                    <option value="pending">Users with Pending Payment</option>
                                    <option value="accepted">Users with Accepted Submissions</option>
                                    <option value="workshop_registered">Workshop Participants</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Subject *</label>
                            <input
                                type="text"
                                placeholder="e.g., Important Update on Event Schedule"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="subject-input"
                            />
                        </div>

                        <div className="input-group">
                            <label>Message Content *</label>
                            <textarea
                                placeholder="Type your announcement here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="8"
                            ></textarea>
                        </div>

                        <div className="composer-footer">
                            <button className="btn-attach"><FiPaperclip /> Attach File</button>
                            <button
                                className="btn-send"
                                onClick={handleSend}
                                disabled={!message || !subject || sending}
                            >
                                {sending ? "Sending..." : <><FiSend /> Send Announcement</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="history-wrapper">
                    <h3><FiCheckCircle /> Sent Announcements</h3>
                    {sentMessages.length > 0 ? (
                        sentMessages.map((msg, idx) => (
                            <div key={idx} className="sent-message-card">
                                <div className="sent-meta">
                                    <span className="sent-to">To: {msg.type_destinataire || "All Users"}</span>
                                    <span className="sent-date">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <h4 className="sent-subject">{msg.objet}</h4>
                                <p className="sent-preview">{msg.contenu.substring(0, 150)}...</p>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#6c8895" }}>
                            No messages sent yet.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMessages;
