import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiSearch, FiBarChart2 } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import "./AdminEvaluations.css";

const AdminEvaluations = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [evaluations, setEvaluations] = useState([]);
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState("evaluations"); // 'evaluations' or 'reports'
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            if (activeTab === "evaluations") {
                fetchEvaluations();
            } else {
                fetchReports();
            }
        } else {
            setEvaluations([]);
            setReports([]);
        }
    }, [selectedEventId, activeTab]);

    const location = useLocation();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/events", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data);

                if (location.state?.eventId) {
                    const exists = data.find(e => e.id == location.state.eventId || e._id == location.state.eventId);
                    if (exists) {
                        setSelectedEventId(exists.id || exists._id);
                        return;
                    }
                }

                if (data.length > 0 && !selectedEventId) {
                    setSelectedEventId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/evaluations?eventId=${selectedEventId}&search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Check if backend returns { data: [...], pagination: ... } or just array
                setEvaluations(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching evaluations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/evaluations/rapports?eventId=${selectedEventId}&search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (propositionId) => {
        if (!confirm("Generate final report for this submission? This will lock current evaluations.")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/evaluations/proposition/${propositionId}/generate-report`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Report generated successfully!");
                fetchReports(); // Refresh list
            } else {
                const err = await response.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error("Error generating report:", error);
        }
    };

    const StatusBadge = ({ status, decision }) => {
        let label = status || "Pending";
        let color = "#718096";

        if (status === "termine") {
            color = "#38a169";
            if (decision === "accepter") {
                label = "Accepted";
            } else if (decision === "refuser") {
                label = "Refused";
                color = "#e53e3e";
            } else if (decision === "corriger") {
                label = "Revision";
                color = "#dd6b20";
            } else {
                label = "Finished";
            }
        } else if (status === "en_cours") {
            label = "In Progress";
            color = "#3182ce";
        }

        return (
            <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "99px",
                fontSize: "0.85rem",
                backgroundColor: `${color}20`,
                color: color,
                fontWeight: 500,
                textTransform: 'capitalize'
            }}>
                {label}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="admin-evaluations-container">
                <header className="admin-header">
                    <div>
                        <h1>Manage Evaluations</h1>
                        <p>Track reviewer progress and generate final reports.</p>
                    </div>
                </header>

                <div className="controls-bar">
                    <div className="event-selector">
                        <label>Select Event:</label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                        >
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.titre || event.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (activeTab === "evaluations" ? fetchEvaluations() : fetchReports())}
                        />
                    </div>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "evaluations" ? "active" : ""}`}
                        onClick={() => setActiveTab("evaluations")}
                    >
                        <FiFileText /> Individual Evaluations
                    </button>
                    <button
                        className={`tab ${activeTab === "reports" ? "active" : ""}`}
                        onClick={() => setActiveTab("reports")}
                    >
                        <FiBarChart2 /> Final Reports
                    </button>
                </div>

                <div className="content-area">
                    {loading ? (
                        <p className="loading-text">Loading data...</p>
                    ) : (
                        <>
                            {activeTab === "evaluations" && (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Ref</th>
                                                <th>Submission</th>
                                                <th>Reviewer</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evaluations.length > 0 ? evaluations.map((ev, i) => (
                                                <tr key={i}>
                                                    <td>#{ev.id}</td>
                                                    <td>{ev.titre_comm || ev.communication_titre}</td>
                                                    <td>
                                                        <div className="user-cell">
                                                            <FiUser /> {ev.nom_evaluateur} {ev.prenom_evaluateur}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {ev.note_globale ? (
                                                            <strong>{ev.note_globale}/20</strong>
                                                        ) : "-"}
                                                    </td>
                                                    <td><StatusBadge status={ev.statut} decision={ev.decision} /></td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="empty-cell">No evaluations found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === "reports" && (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Submission</th>
                                                <th>Average Score</th>
                                                <th>Verdict</th>
                                                <th>Generated At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.length > 0 ? reports.map((rep, i) => (
                                                <tr key={i}>
                                                    <td>{rep.titre_comm}</td>
                                                    <td><strong>{Number(rep.moyenne_globale).toFixed(2)} / 20</strong></td>
                                                    <td>
                                                        <span className={`verdict ${rep.decision_finale}`}>
                                                            {rep.decision_finale}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(rep.date_creation).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="icon-btn" title="View Details">
                                                            <FiFileText />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="empty-cell">No reports generated yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEvaluations;
