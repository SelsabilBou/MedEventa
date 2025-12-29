import React, { useState, useEffect } from "react";
import {
  FaPaperPlane,
  FaEnvelope,
  FaUsers,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";
import "./EventMessagesPanel.css";

const EventMessagesPanel = ({ eventId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [filter, setFilter] = useState("all");

  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    body: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch messages for this event
  const fetchEventMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
        params: { eventId, limit: 50 },
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching event messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle broadcast message
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setComposeError("");
    setComposeSuccess(false);

    if (!broadcastForm.body.trim()) {
      setComposeError("Message body cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/messages/broadcast/${eventId}`,
        {
          contenu: broadcastForm.body,
          type: broadcastForm.subject || "broadcast",
          sujet: broadcastForm.subject,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComposeSuccess(true);
      setBroadcastForm({ subject: "", body: "" });
      setTimeout(() => {
        setComposeSuccess(false);
        setShowCompose(false);
        fetchEventMessages();
      }, 2000);
    } catch (error) {
      console.error("Error sending broadcast:", error);
      setComposeError(
        error.response?.data?.message ||
          "Failed to send broadcast message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventMessages();
    }
  }, [eventId]);

  const filteredMessages =
    filter === "all"
      ? messages
      : messages.filter((m) => m.evenement_id === parseInt(filter, 10));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (
    !currentUser ||
    (currentUser.role !== "ORGANISATEUR" && currentUser.role !== "SUPER_ADMIN")
  ) {
    return null;
  }

  return (
    <div className="event-messages-panel">
      <div className="event-messages-header">
        <div>
          <h3>
            <FaEnvelope />
            Event Communications
          </h3>
          <p>Manage messages and send broadcasts to event participants</p>
        </div>
        <button
          className="event-messages-broadcast-btn"
          onClick={() => setShowCompose(!showCompose)}
          type="button"
        >
          <FaPaperPlane />
          {showCompose ? "Cancel Broadcast" : "Send Broadcast"}
        </button>
      </div>

      {showCompose && (
        <div className="event-messages-compose">
          <h4>Broadcast Message to All Participants</h4>
          {composeSuccess && (
            <div className="event-messages-success">
              <FaCheck />
              Broadcast sent successfully!
            </div>
          )}
          {composeError && (
            <div className="event-messages-error">
              <FaTimes />
              {composeError}
            </div>
          )}
          <form
            onSubmit={handleBroadcastSubmit}
            className="event-messages-form"
          >
            <div className="event-messages-field">
              <label>Subject (Optional)</label>
              <input
                type="text"
                value={broadcastForm.subject}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    subject: e.target.value,
                  })
                }
                placeholder="e.g., Room changed, Survey available..."
                className="event-messages-input"
              />
            </div>
            <div className="event-messages-field">
              <label>Message *</label>
              <textarea
                value={broadcastForm.body}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, body: e.target.value })
                }
                required
                rows="6"
                placeholder="Type your broadcast message here..."
                className="event-messages-textarea"
              />
            </div>
            <div className="event-messages-form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowCompose(false);
                  setComposeError("");
                  setBroadcastForm({ subject: "", body: "" });
                }}
                className="event-messages-btn cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="event-messages-btn primary"
              >
                {loading ? (
                  <>
                    <FaSpinner className="spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="event-messages-content">
        <div className="event-messages-filters">
          <button
            className={`event-messages-filter-btn ${
              filter === "all" ? "active" : ""
            }`}
            onClick={() => setFilter("all")}
            type="button"
          >
            <FaFilter />
            All Messages
          </button>
          <span className="event-messages-count">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && !showCompose ? (
          <div className="event-messages-loading">
            <FaSpinner className="spin" />
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="event-messages-empty">
            <FaEnvelope />
            <p>No messages for this event yet</p>
          </div>
        ) : (
          <div className="event-messages-list">
            {filteredMessages.map((message) => (
              <div key={message.id} className="event-messages-item">
                <div className="event-messages-item-header">
                  <div>
                    <strong>
                      {message.prenom} {message.nom}
                    </strong>
                    <span className="event-messages-item-date">
                      {formatDate(message.date_envoi)}
                    </span>
                  </div>
                  {message.type && (
                    <span className="event-messages-item-type">
                      {message.type}
                    </span>
                  )}
                </div>
                <div className="event-messages-item-body">
                  {message.contenu}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventMessagesPanel;
