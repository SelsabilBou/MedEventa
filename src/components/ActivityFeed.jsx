import React, { useState, useEffect, useCallback } from "react";
import {
  FaCheck,
  FaSync,
  FaEnvelope,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import "./ActivityFeed.css";

const ActivityFeed = ({ isOpen: externalIsOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Only open if explicitly controlled via props (from NotificationBell)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : false;
  const handleClose = onClose || (() => {});

  const currentUser = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "submission_accepted":
        return <FaCheck />;
      case "submission_refused":
        return <FaTimes />;
      case "room_change":
      case "programme_change":
        return <FaSync />;
      case "new_message":
      case "broadcast_message":
        return <FaEnvelope />;
      default:
        return <FaEnvelope />;
    }
  };

  // Get icon class based on notification type
  const getIconClass = (type) => {
    switch (type) {
      case "submission_accepted":
        return "activity-icon success";
      case "submission_refused":
        return "activity-icon error";
      case "room_change":
      case "programme_change":
        return "activity-icon warning";
      case "new_message":
      case "broadcast_message":
        return "activity-icon info";
      default:
        return "activity-icon info";
    }
  };

  // Get title from notification message
  const getNotificationTitle = (notification) => {
    const message = notification.message || "";
    const type = notification.type || "";

    // Use type to determine title
    if (type === "submission_accepted") {
      return "Submission Accepted";
    } else if (type === "submission_refused") {
      return "Submission Refused";
    } else if (
      type === "room_change" ||
      message.includes("Room") ||
      message.includes("room")
    ) {
      // Extract room change details if available
      if (message.includes("moved from") || message.includes("moved to")) {
        return "Room Change: Keynote";
      }
      return "Room Change";
    } else if (type === "programme_change") {
      return "Programme Change";
    } else if (
      type === "broadcast_message" ||
      message.includes("Broadcast") ||
      message.includes("broadcast")
    ) {
      return "Broadcast Message";
    } else if (type === "new_message" || message.includes("message")) {
      return "New Message";
    }

    // Extract first sentence or first 40 characters
    const firstSentence = message.split(".")[0];
    if (firstSentence.length <= 50) {
      return firstSentence;
    }
    return message.substring(0, 50) + "...";
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 },
      });

      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, lu: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleClearNew = async () => {
    const unreadNotifications = notifications.filter((n) => !n.lu);
    await Promise.all(unreadNotifications.map((n) => handleMarkAsRead(n.id)));
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchNotifications]);

  if (!currentUser) return null;

  const unreadNotifications = notifications.filter((n) => !n.lu);
  const unreadCount = unreadNotifications.length;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="activity-feed-panel open">
      <div className="activity-feed-header">
        <h3 className="activity-feed-title">Activity Feed</h3>
        {unreadCount > 0 && (
          <button
            className="activity-feed-clear"
            onClick={handleClearNew}
            type="button"
          >
            Clear New
          </button>
        )}
      </div>

      <div className="activity-feed-content">
        {loading ? (
          <div className="activity-feed-loading">
            <FaSpinner className="spin" />
            <span>Loading...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="activity-feed-empty">
            <FaEnvelope />
            <p>No activity</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`activity-item ${!notification.lu ? "unread" : ""}`}
              onClick={() => {
                if (!notification.lu) {
                  handleMarkAsRead(notification.id);
                }
              }}
            >
              <div className={getIconClass(notification.type)}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="activity-item-content">
                <div className="activity-item-header">
                  <h4 className="activity-item-title">
                    {getNotificationTitle(notification)}
                  </h4>
                  <span className="activity-item-time">
                    {formatTime(notification.date_creation)}
                  </span>
                </div>
                <p className="activity-item-text">{notification.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="activity-feed-close"
        onClick={handleClose}
        type="button"
      >
        CLOSE PANEL
      </button>
    </div>
  );
};

export default ActivityFeed;
