import React, { useState, useEffect } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import { FiSave, FiSettings, FiMail, FiImage, FiAlertCircle } from "react-icons/fi";
import "./SuperAdminSettings.css";

const SuperAdminSettings = () => {
    const [settings, setSettings] = useState({
        platformTitle: "MedEventa",
        contactEmail: "",
        logoUrl: "",
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SuperAdminLayout>
            <div className="superadmin-settings">
                <header className="page-header">
                    <div>
                        <h1>Platform Settings</h1>
                        <p>Configure global platform options</p>
                    </div>
                </header>

                <form onSubmit={handleSaveSettings} className="settings-form">
                    {/* General Settings */}
                    <div className="settings-section">
                        <div className="section-header">
                            <FiSettings />
                            <h2>General Settings</h2>
                        </div>

                        <div className="form-group">
                            <label>Platform Title</label>
                            <input
                                type="text"
                                value={settings.platformTitle}
                                onChange={(e) => setSettings({ ...settings, platformTitle: e.target.value })}
                                placeholder="MedEventa"
                            />
                        </div>

                        <div className="form-group">
                            <label><FiMail /> Contact Email</label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                placeholder="contact@medeventa.com"
                            />
                        </div>

                        <div className="form-group">
                            <label><FiImage /> Logo URL</label>
                            <input
                                type="url"
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                            {settings.logoUrl && (
                                <div className="logo-preview">
                                    <img src={settings.logoUrl} alt="Platform Logo" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform Options */}
                    <div className="settings-section">
                        <div className="section-header">
                            <FiAlertCircle />
                            <h2>Platform Options</h2>
                        </div>

                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h4>Maintenance Mode</h4>
                                    <p>Temporarily disable access to the platform for all users except super admins</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h4>Allow User Registration</h4>
                                    <p>Enable or disable new user registrations on the platform</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.allowRegistration}
                                        onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <h4>Require Email Verification</h4>
                                    <p>Users must verify their email address before accessing the platform</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.requireEmailVerification}
                                        onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="settings-footer">
                        <button type="submit" className="btn-save" disabled={saving}>
                            <FiSave /> {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminSettings;
