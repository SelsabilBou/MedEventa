import React, { useState, useEffect } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import {
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiLock, FiUserCheck,
    FiUserX, FiX, FiSave
} from "react-icons/fi";
import "./SuperAdminUsers.css";

const SuperAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [userForm, setUserForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "participant",
        institution: "",
        pays: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            // Note: This endpoint may need to be created in the backend
            const response = await fetch("/api/auth/users", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setUsers(data);
                } else {
                    // MOCK DATA EXAMPLE
                    setUsers([
                        { id: 101, nom: "Doe", prenom: "John", email: "john@example.com", role: "participant", institution: "Health Inst", pays: "USA" },
                        { id: 102, nom: "Smith", prenom: "Alice", email: "alice@example.com", role: "organizer", institution: "Event Corp", pays: "UK" },
                        { id: 103, nom: "Brown", prenom: "Robert", email: "bob@example.com", role: "superadmin", institution: "MedEventa", pays: "France" },
                    ]);
                }
            } else {
                // Fallback to mock data (Example)
                setUsers([
                    { id: 101, nom: "Doe", prenom: "John", email: "john@example.com", role: "participant", institution: "Health Inst", pays: "USA" },
                    { id: 102, nom: "Smith", prenom: "Alice", email: "alice@example.com", role: "organizer", institution: "Event Corp", pays: "UK" },
                    { id: 103, nom: "Brown", prenom: "Robert", email: "bob@example.com", role: "superadmin", institution: "MedEventa", pays: "France" },
                ]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userForm)
            });

            if (response.ok) {
                alert("User created successfully!");
                setShowCreateModal(false);
                resetForm();
                fetchUsers();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to create user"}`);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userForm)
            });

            if (response.ok) {
                alert("User updated successfully!");
                setShowEditModal(false);
                setSelectedUser(null);
                resetForm();
                fetchUsers();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "Failed to update user"}`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/auth/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (response.ok) {
                alert("User deleted successfully!");
                fetchUsers();
            } else {
                const data = await response.json();
                alert(`Failed to delete user: ${data.message}`);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm("Are you sure you want to reset this user's password?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/users/${userId}/reset-password`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Password reset successfully! New password: ${data.newPassword || "Check email"}`);
            } else {
                alert("Failed to reset password");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Failed to reset password");
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setUserForm({
            nom: user.nom || "",
            prenom: user.prenom || "",
            email: user.email || "",
            password: "",
            role: user.role || "PARTICIPANT",
            institution: user.institution || "",
            pays: user.pays || ""
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setUserForm({
            nom: "",
            prenom: "",
            email: "",
            password: "",
            role: "PARTICIPANT",
            institution: "",
            pays: ""
        });
    };

    const getRoleBadge = (role) => {
        const badges = {
            SUPER_ADMIN: { text: "Super Admin", class: "role-superadmin" },
            ADMIN: { text: "Admin", class: "role-admin" },
            ORGANISATEUR: { text: "Organizer", class: "role-organizer" },
            COMMUNICANT: { text: "Author", class: "role-author" },
            PARTICIPANT: { text: "Participant", class: "role-participant" }
        };
        return badges[role] || badges.PARTICIPANT;
    };

    return (
        <SuperAdminLayout>
            <div className="superadmin-users">
                <header className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage all user accounts and permissions</p>
                    </div>
                    <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                        <FiPlus /> Create User
                    </button>
                </header>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="organizer">Organizer</option>
                        <option value="communicant">Author</option>
                        <option value="participant">Participant</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Institution</th>
                                <th>Country</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="user-name">
                                        <div className="user-avatar">{user.prenom?.charAt(0) || "U"}</div>
                                        {user.prenom} {user.nom}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadge(user.role).class}`}>
                                            {getRoleBadge(user.role).text}
                                        </span>
                                    </td>
                                    <td>{user.institution || "-"}</td>
                                    <td>{user.pays || "-"}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => openEditModal(user)} title="Edit">
                                            <FiEdit2 />
                                        </button>
                                        <button className="action-btn reset" onClick={() => handleResetPassword(user.id)} title="Reset Password">
                                            <FiLock />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="Delete User">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="empty-state">No users found</div>
                    )}
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Create New User</h2>
                                <button onClick={() => setShowCreateModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            value={userForm.prenom}
                                            onChange={(e) => setUserForm({ ...userForm, prenom: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            value={userForm.nom}
                                            onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        value={userForm.password}
                                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <select
                                            value={userForm.role}
                                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                        >
                                            <option value="participant">Participant</option>
                                            <option value="communicant">Author</option>
                                            <option value="organizer">Organizer</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            value={userForm.pays}
                                            onChange={(e) => setUserForm({ ...userForm, pays: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Institution</label>
                                    <input
                                        type="text"
                                        value={userForm.institution}
                                        onChange={(e) => setUserForm({ ...userForm, institution: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save">
                                        <FiSave /> Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit User</h2>
                                <button onClick={() => setShowEditModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleUpdateUser}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            value={userForm.prenom}
                                            onChange={(e) => setUserForm({ ...userForm, prenom: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            value={userForm.nom}
                                            onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <select
                                            value={userForm.role}
                                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                        >
                                            <option value="participant">Participant</option>
                                            <option value="communicant">Author</option>
                                            <option value="organizer">Organizer</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            value={userForm.pays}
                                            onChange={(e) => setUserForm({ ...userForm, pays: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Institution</label>
                                    <input
                                        type="text"
                                        value={userForm.institution}
                                        onChange={(e) => setUserForm({ ...userForm, institution: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save">
                                        <FiSave /> Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
};

export default SuperAdminUsers;
