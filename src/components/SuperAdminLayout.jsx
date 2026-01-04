import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiShield,
    FiFileText
} from "react-icons/fi";
import "./SuperAdminLayout.css";

const SuperAdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const navItems = [
        { path: "/superadmin/dashboard", label: "Dashboard", icon: <FiHome /> },
        { path: "/superadmin/users", label: "User Management", icon: <FiUsers /> },
        { path: "/superadmin/events", label: "All Events", icon: <FiCalendar /> },
        { path: "/superadmin/settings", label: "Platform Settings", icon: <FiSettings /> },
    ];

    const isActive = (path) => location.pathname === path;

    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="superadmin-layout">
            {/* Sidebar */}
            <aside className={`superadmin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <FiShield className="logo-icon" />
                        <span className="logo-text">Super Admin</span>
                    </div>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {(user?.photo || user?.photoUrl) ? (
                                <img src={user.photo || user.photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                user?.prenom?.charAt(0) || user?.nom?.charAt(0) || "S"
                            )}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.prenom} {user?.nom}</div>
                            <div className="user-role">Super Administrator</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="superadmin-main">
                {/* Top Navigation Bar */}
                <header className="superadmin-topbar">
                    <div className="topbar-left">
                        {/* Mobile menu toggle could go here if needed, or breadcrumbs */}
                        <h2 className="topbar-title">Overview</h2>
                    </div>

                    <div className="topbar-right">
                        <div className="workspace-switcher">
                            <button
                                className="switcher-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span className="current-workspace">Switch Workspace</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`chevron ${dropdownOpen ? 'open' : ''}`}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="switcher-dropdown">
                                    <div className="dropdown-header">Navigate to...</div>
                                    <button onClick={() => navigate("/admin/dashboard")} className="dropdown-item">
                                        <FiShield className="item-icon" />
                                        <span>Espace Organisateur</span>
                                    </button>
                                    <button onClick={() => navigate("/participant/dashboard")} className="dropdown-item">
                                        <FiUsers className="item-icon" />
                                        <span>Espace Participant</span>
                                    </button>
                                    <button onClick={() => navigate("/author/dashboard")} className="dropdown-item">
                                        <FiUsers className="item-icon" />
                                        <span>Espace Auteur</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="superadmin-content">
                    {children}
                </div>
            </main>
        </div >
    );
};

export default SuperAdminLayout;
