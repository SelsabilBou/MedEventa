import React, { useState, useEffect } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../api/axios";
import { FiSearch, FiToggleLeft, FiToggleRight, FiUser, FiCalendar, FiMapPin } from "react-icons/fi";
import "./SuperAdminEvents.css";

const SuperAdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, searchTerm, statusFilter]);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/api/events");
            setEvents(response.data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        if (searchTerm) {
            filtered = filtered.filter(event =>
                (event.titre || event.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(event => getEventStatus(event) === statusFilter);
        }

        setFilteredEvents(filtered);
    };

    const getEventStatus = (event) => {
        const now = new Date();
        const startDate = new Date(event.date_debut);
        const endDate = new Date(event.date_fin);

        if (event.disabled) return "disabled";
        if (now < startDate) return "upcoming";
        if (now > endDate) return "past";
        return "ongoing";
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: { text: "Upcoming", class: "status-upcoming" },
            ongoing: { text: "Ongoing", class: "status-ongoing" },
            past: { text: "Past", class: "status-past" },
            disabled: { text: "Disabled", class: "status-disabled" }
        };
        return badges[status] || badges.upcoming;
    };

    const handleToggleEvent = async (eventId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? "disable" : "enable";

        if (!confirm(`Are you sure you want to ${action} this event?`)) return;

        try {
            const response = await api.put(`/api/events/${eventId}/toggle`, { disabled: newStatus });

            if (response.status === 200) {
                alert(`Event ${action}d successfully!`);
                fetchEvents();
            } else {
                alert(`Failed to ${action} event`);
            }
        } catch (error) {
            console.error(`Error ${action}ing event:`, error);
            alert(`Failed to ${action} event: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="superadmin-events">
                <header className="page-header">
                    <div>
                        <h1>All Events</h1>
                        <p>Manage all events across the platform</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="past">Past</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                {/* Events Grid */}
                <div className="events-grid">
                    {filteredEvents.map((event) => {
                        const status = getEventStatus(event);
                        const badge = getStatusBadge(status);

                        return (
                            <div key={event.id} className="event-card">
                                <div className="event-header">
                                    <h3>{event.titre}</h3> {/* Backend returns 'titre', not 'name' */}
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.text}
                                    </span>
                                </div>

                                <div className="event-details">
                                    <div className="detail-item">
                                        <FiCalendar />
                                        <span>
                                            {/* Backend dates are ISO strings */}
                                            {new Date(event.date_debut).toLocaleDateString()} - {new Date(event.date_fin).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <FiMapPin />
                                        <span>{event.lieu}</span>
                                    </div>
                                    {/* Organizer info requires backend update (JOIN query), hiding for now to align with 'no backend changes' rule */}
                                    {/* <div className="detail-item">
                                        <FiUser />
                                        <span>Organizer: {event.organizer_name || "N/A"}</span>
                                    </div> */}
                                </div>

                                <div className="event-footer">
                                    {/* Toggle endpoint requires backend update, hiding for now */}
                                    <button
                                        className={`toggle-btn disabled`}
                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                        title="Feature requires backend update"
                                        disabled
                                    >
                                        <FiToggleRight />
                                        Admin Actions Restricted
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="empty-state">No events found</div>
                )}
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminEvents;
