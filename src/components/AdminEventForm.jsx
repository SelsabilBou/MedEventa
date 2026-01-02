import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import "./AdminEventForm.css";

const AdminEventForm = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date_debut: "",
        date_fin: "",
        lieu: "",
        thematique: "",
        contacts: [""],
        scientific_committee: [""],
        invited_speakers: [""]
    });

    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    const handleArrayChange = (field, index, value) => {
        const newArr = [...formData[field]];
        newArr[index] = value;
        setFormData({ ...formData, [field]: newArr });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const removeArrayItem = (field, index) => {
        const newArr = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArr });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            // Prepare payload matching backend expectations
            const payload = {
                titre: formData.title,
                description: formData.description,
                date_debut: formData.date_debut,
                date_fin: formData.date_fin,
                lieu: formData.lieu,
                thematique: formData.thematique,
            };

            const response = await fetch("/api/events/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const eventId = data.eventId || data.id;

                // Add committee members if any
                if (formData.scientific_committee.length > 0 && formData.scientific_committee[0] !== "") {
                    for (const member of formData.scientific_committee) {
                        if (member.trim()) {
                            await fetch(`/api/events/${eventId}/add-comite`, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ nom: member })
                            });
                        }
                    }
                }

                // Add invited speakers if any
                if (formData.invited_speakers.length > 0 && formData.invited_speakers[0] !== "") {
                    for (const speaker of formData.invited_speakers) {
                        if (speaker.trim()) {
                            await fetch(`/api/events/${eventId}/add-invite`, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ nom: speaker })
                            });
                        }
                    }
                }

                setNotification({ show: true, message: "Event created successfully!", type: "success" });
                setTimeout(() => {
                    window.location.href = "/admin/events";
                }, 1500);
            } else {
                const error = await response.json();
                setNotification({ show: true, message: error.message || "Failed to create event", type: "error" });
            }
        } catch (error) {
            console.error("Error creating event:", error);
            setNotification({ show: true, message: "Failed to create event. Please try again.", type: "error" });
        }
    };

    return (
        <AdminLayout>
            <div className="admin-form-container">
                <header className="admin-page-header">
                    <div className="header-text">
                        <h1>{formData.id ? "Edit Event" : "Create New Event"}</h1>
                        <p>Fill in the details for your medical conference.</p>
                    </div>
                </header>

                <form className="admin-event-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>General Information</h3>
                        <div className="form-group full-width">
                            <label>Event Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. International Medical Summit 2024"
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the event goals, target audience..."
                            ></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={formData.date_fin}
                                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={formData.lieu}
                                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                                    placeholder="City, Hall or Online"
                                />
                            </div>
                            <div className="form-group">
                                <label>Theme / Domain</label>
                                <input
                                    type="text"
                                    value={formData.thematique}
                                    onChange={(e) => setFormData({ ...formData, thematique: e.target.value })}
                                    placeholder="e.g. Neurology, Cardiology"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>People & Committees</h3>

                        <div className="dynamic-list-group">
                            <div className="list-header">
                                <label>Scientific Committee</label>
                                <button type="button" onClick={() => addArrayItem('scientific_committee')} className="btn-add-item"><FiPlus /> Add Member</button>
                            </div>
                            {formData.scientific_committee.map((item, index) => (
                                <div key={index} className="dynamic-input-row">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('scientific_committee', index, e.target.value)}
                                        placeholder="Name, Institution"
                                    />
                                    <button type="button" onClick={() => removeArrayItem('scientific_committee', index)} className="btn-remove-item"><FiTrash2 /></button>
                                </div>
                            ))}
                        </div>

                        <div className="dynamic-list-group">
                            <div className="list-header">
                                <label>Invited Speakers</label>
                                <button type="button" onClick={() => addArrayItem('invited_speakers')} className="btn-add-item"><FiPlus /> Add Speaker</button>
                            </div>
                            {formData.invited_speakers.map((item, index) => (
                                <div key={index} className="dynamic-input-row">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange('invited_speakers', index, e.target.value)}
                                        placeholder="Speaker Name"
                                    />
                                    <button type="button" onClick={() => removeArrayItem('invited_speakers', index)} className="btn-remove-item"><FiTrash2 /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions-bottom">
                        <button type="button" className="btn-cancel" onClick={() => window.location.href = '/admin/events'}><FiX /> Discard</button>
                        <button type="submit" className="btn-save"><FiSave /> Save Event</button>
                    </div>
                </form>

                {/* Toast Notification */}
                {notification.show && (
                    <div className={`toast-notification toast-${notification.type}`}>
                        <div className="toast-content">
                            <span className="toast-icon">
                                {notification.type === "success" ? "✓" : "✕"}
                            </span>
                            <span className="toast-message">{notification.message}</span>
                        </div>
                        <button
                            className="toast-close"
                            onClick={() => setNotification({ show: false, message: "", type: "" })}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminEventForm;
