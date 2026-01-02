import React from "react";
import AdminLayout from "./AdminLayout";
import { FiAward, FiDownload, FiSettings, FiCheckCircle } from "react-icons/fi";
import "./AdminCertificates.css";

const AdminCertificates = () => {
    const templates = [
        { id: 1, name: "Attendance Certificate", icon: <FiAward />, recipients: "All Participants" },
        { id: 2, name: "Speaker Appreciation", icon: <FiCheckCircle />, recipients: "Invited Speakers" },
        { id: 3, name: "Committee Gratitude", icon: <FiAward />, recipients: "Scientific Committee" },
    ];

    return (
        <AdminLayout>
            <div className="admin-certificates-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>Certificates & Attestations</h1>
                        <p>Configure templates and trigger bulk generation of certificates.</p>
                    </div>
                </header>

                <div className="templates-grid">
                    {templates.map(tpl => (
                        <div key={tpl.id} className="template-card">
                            <div className="tpl-icon">{tpl.icon}</div>
                            <h3>{tpl.name}</h3>
                            <p>For: {tpl.recipients}</p>

                            <div className="tpl-actions">
                                <button className="btn-tpl-edit"><FiSettings /> Configure</button>
                                <button className="btn-tpl-gen"><FiDownload /> Generate All</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="batch-jobs">
                    <h3>Recent Generation Jobs</h3>
                    <div className="job-row">
                        <div className="job-info">
                            <span className="job-name">Attendance Certs - Day 1</span>
                            <span className="job-status success">Completed</span>
                        </div>
                        <span className="job-stats">245 PDFs generated</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCertificates;
