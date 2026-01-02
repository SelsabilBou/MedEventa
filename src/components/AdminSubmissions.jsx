import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { FiSearch, FiFilter, FiCheck, FiX, FiRefreshCw, FiMessageCircle } from "react-icons/fi";
import "./AdminSubmissions.css";

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        // Placeholder fetching logic
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem("token");
                // Update with actual endpoint
                const response = await fetch("/api/submissions/all", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                } else {
                    // Mock data for demonstration if API fails or not yet implemented
                    setSubmissions([
                        { id: "1", title: "Neurological Advances in 2024", author: "Dr. Alice Smith", type: "Oral", status: "pending", date: "2024-03-15" },
                        { id: "2", title: "Cardiovascular Risk Factors", author: "Dr. Bob Jones", type: "Poster", status: "accepted", date: "2024-03-14" },
                        { id: "3", title: "Modern Immunotherapy", author: "Dr. Carol White", type: "Keynote", status: "revision", date: "2024-03-12" },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (submissionId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/events/submissions/${submissionId}/status`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ statut: newStatus })
            });

            if (response.ok) {
                setSubmissions(prev => prev.map(sub =>
                    sub.id === submissionId ? { ...sub, status: newStatus } : sub
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
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="revision">Revision</option>
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
                                    <td className="col-title">{sub.title}</td>
                                    <td>{sub.author}</td>
                                    <td>{sub.type}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td>{sub.date}</td>
                                    <td className="col-actions">
                                        <button className="btn-table-action accept" title="Accept" onClick={() => handleStatusChange(sub.id, "accepted")}><FiCheck /></button>
                                        <button className="btn-table-action reject" title="Reject" onClick={() => handleStatusChange(sub.id, "rejected")}><FiX /></button>
                                        <button className="btn-table-action revision" title="Request Revision" onClick={() => handleStatusChange(sub.id, "revision")}><FiRefreshCw /></button>
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
