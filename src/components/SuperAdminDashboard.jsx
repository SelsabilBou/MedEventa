import React, { useState, useEffect } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import { FiCalendar, FiFileText, FiUsers, FiTrendingUp, FiActivity } from "react-icons/fi";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalSubmissions: 0,
        totalParticipants: 0,
        avgAcceptanceRate: 0
    });
    const [mostActiveEvents, setMostActiveEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalStats();
        fetchMostActiveEvents();
    }, []);

    const fetchGlobalStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // Fetch all events
            const eventsRes = await fetch("/api/events");
            const events = eventsRes.ok ? await eventsRes.json() : [];

            // Calculate global stats from all events
            let totalSubmissions = 0;
            let totalParticipants = 0;
            let totalAcceptanceRates = [];

            for (const event of events) {
                try {
                    const statsRes = await fetch(`/api/events/${event.id}/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (statsRes.ok) {
                        const eventStats = await statsRes.json();
                        totalSubmissions += eventStats.submissionsCount || 0;
                        totalParticipants += eventStats.participantsByCountry?.reduce((sum, p) => sum + (p.count || 0), 0) || 0;

                        if (eventStats.acceptanceRate?.rate) {
                            totalAcceptanceRates.push(eventStats.acceptanceRate.rate);
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching stats for event ${event.id}:`, err);
                }
            }

            const avgAcceptanceRate = totalAcceptanceRates.length > 0
                ? totalAcceptanceRates.reduce((a, b) => a + b, 0) / totalAcceptanceRates.length
                : 0;

            setStats({
                totalEvents: events.length,
                totalSubmissions,
                totalParticipants,
                avgAcceptanceRate: Math.round(avgAcceptanceRate)
            });
        } catch (error) {
            console.error("Error fetching global stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMostActiveEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const eventsRes = await fetch("/api/events");

            if (eventsRes.ok) {
                const events = await eventsRes.json();

                // Fetch stats for each event and sort by activity
                const eventsWithStats = await Promise.all(
                    events.slice(0, 10).map(async (event) => {
                        try {
                            const statsRes = await fetch(`/api/events/${event.id}/stats`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (statsRes.ok) {
                                const stats = await statsRes.json();
                                return {
                                    ...event,
                                    submissionsCount: stats.submissionsCount || 0,
                                    participantsCount: stats.participantsByCountry?.reduce((sum, p) => sum + (p.count || 0), 0) || 0
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching stats for event ${event.id}:`, err);
                        }
                        return { ...event, submissionsCount: 0, participantsCount: 0 };
                    })
                );

                // Sort by total activity (submissions + participants)
                const sorted = eventsWithStats.sort((a, b) =>
                    (b.submissionsCount + b.participantsCount) - (a.submissionsCount + a.participantsCount)
                );

                setMostActiveEvents(sorted.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching most active events:", error);
        }
    };

    const statsCards = [
        {
            label: "Total Events",
            value: loading ? "..." : stats.totalEvents,
            icon: <FiCalendar />,
            color: "#3b82f6",
            bgColor: "#dbeafe"
        },
        {
            label: "Total Submissions",
            value: loading ? "..." : stats.totalSubmissions,
            icon: <FiFileText />,
            color: "#8b5cf6",
            bgColor: "#ede9fe"
        },
        {
            label: "Total Participants",
            value: loading ? "..." : stats.totalParticipants,
            icon: <FiUsers />,
            color: "#10b981",
            bgColor: "#d1fae5"
        },
        {
            label: "Avg Acceptance Rate",
            value: loading ? "..." : `${stats.avgAcceptanceRate}%`,
            icon: <FiTrendingUp />,
            color: "#f59e0b",
            bgColor: "#fef3c7"
        }
    ];

    return (
        <SuperAdminLayout>
            <div className="superadmin-dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>Platform Overview</h1>
                        <p>Global statistics and platform activity</p>
                    </div>
                </header>

                {/* Global Stats */}
                <div className="stats-grid">
                    {statsCards.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <h3>{stat.value}</h3>
                                <p>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Most Active Events */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FiActivity /> Most Active Events</h2>
                    </div>
                    <div className="events-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Location</th>
                                    <th>Dates</th>
                                    <th>Submissions</th>
                                    <th>Participants</th>
                                    <th>Activity Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mostActiveEvents.map((event) => (
                                    <tr key={event.id}>
                                        <td className="event-name">{event.titre || event.name}</td>
                                        <td>{event.lieu}</td>
                                        <td className="event-dates">
                                            {new Date(event.date_debut).toLocaleDateString()} - {new Date(event.date_fin).toLocaleDateString()}
                                        </td>
                                        <td className="stat-number">{event.submissionsCount}</td>
                                        <td className="stat-number">{event.participantsCount}</td>
                                        <td>
                                            <div className="activity-bar">
                                                <div
                                                    className="activity-fill"
                                                    style={{
                                                        width: `${Math.min(100, ((event.submissionsCount + event.participantsCount) / 10))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {mostActiveEvents.length === 0 && !loading && (
                            <div className="empty-state">No events found</div>
                        )}
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminDashboard;
