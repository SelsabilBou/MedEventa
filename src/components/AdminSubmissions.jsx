import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminSubmissions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || "");
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(location.state?.search || "");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchSubmissions();
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/api/events");
            setEvents(response.data);
            if (!selectedEventId && response.data.length > 0) {
                // Pick an event with a date or the first one
                const best = response.data.find(e => e.date_debut) || response.data[0];
                setSelectedEventId(best.id);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/events/${selectedEventId}/submissions`);
            setSubmissions(response.data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
            // Fallback to empty if error
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = Array.isArray(submissions) ? submissions.filter(sub => {
        const matchesSearch = (sub.titre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.auteur_principal_nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.auteur_principal_prenom || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || sub.statut === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    const handleStatusChange = async (submissionId, newStatus) => {
        try {
            const response = await api.put(`/api/events/submissions/${submissionId}/status`, { statut: newStatus });

            if (response.status === 200) {
                setSubmissions(prev => prev.map(sub =>
                    sub.id === submissionId ? { ...sub, statut: newStatus } : sub
                ));
                alert(`Submission status updated to ${newStatus}`);
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to update status"}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update submission status");
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "acceptee": return "status-accepted";
            case "refusee": return "status-rejected";
            case "en_revision": return "status-revision";
            case "en_attente": return "status-pending";
            // Legacy
            case "accepted": return "status-accepted";
            case "rejected": return "status-rejected";
            case "revision": return "status-revision";
            default: return "status-pending";
        }
    };

    return (
        <AdminLayout>
            <div className="admin-submissions-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Submissions & Evaluation</h1>
                        <p>Review, evaluate, and manage all submitted communications.</p>
                    </div>
                </header>

                <div className="table-controls">
                    <div className="event-selector-admin">
                        <FiFilter className="filter-icon" />
                        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.titre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrapper">
                        <FiFilter className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="en_attente">Pending</option>
                            <option value="acceptee">Accepted</option>
                            <option value="refusee">Rejected</option>
                            <option value="en_revision">Revision</option>
                        </select>
                    </div>
                </div>

                <div className="submissions-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.map(sub => (
                                <tr key={sub.id}>
                                    <td className="col-title">{sub.titre}</td>
                                    <td>{sub.auteur_principal_prenom} {sub.auteur_principal_nom}</td>
                                    <td>{sub.type}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(sub.statut)}`}>
                                            {sub.statut}
                                        </span>
                                    </td>
                                    <td>{new Date(sub.updated_at).toLocaleDateString()}</td>
                                    <td className="col-actions">
                                        <button className="btn-table-action accept" title="Accept" onClick={() => handleStatusChange(sub.id, "acceptee")}><FiCheck /></button>
                                        <button className="btn-table-action reject" title="Reject" onClick={() => handleStatusChange(sub.id, "refusee")}><FiX /></button>
                                        <button className="btn-table-action revision" title="Request Revision" onClick={() => handleStatusChange(sub.id, "en_revision")}><FiRefreshCw /></button>
                                        <button className="btn-table-action comment" title="View Comments"><FiMessageCircle /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredSubmissions.length === 0 && (
                        <div className="empty-table-state">No submissions found.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSubmissions;
