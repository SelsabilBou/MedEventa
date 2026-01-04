// controllers/user.controller.js
const { getUsersByRole, getAllUsers } = require('../models/user.model');

const getUsersByRoleController = (req, res) => {
    const { role } = req.params;

    // Safety check for role
    const allowedRoles = [
        'SUPER_ADMIN',
        'ORGANISATEUR',
        'COMMUNICANT',
        'PARTICIPANT',
        'MEMBRE_COMITE',
        'INVITE',
        'RESP_WORKSHOP'
    ];

    if (!allowedRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    getUsersByRole(role.toUpperCase(), (err, users) => {
        if (err) {
            console.error('Error fetching users by role:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json(users);
    });
};

const getAllUsersController = (req, res) => {
    getAllUsers((err, users) => {
        if (err) {
            console.error('Error fetching all users:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json(users);
    });
};

const updateUserController = (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = require('../db');

    const allowed = ["nom", "prenom", "email", "role", "institution", "pays"];
    const filteredUpdates = {};
    for (const k of allowed) {
        if (updates[k] !== undefined) filteredUpdates[k] = updates[k];
    }

    if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ message: "Aucun champ à mettre à jour" });
    }

    const keys = Object.keys(filteredUpdates);
    const sql = `UPDATE utilisateur SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
    const values = [...Object.values(filteredUpdates), id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json({ message: 'Utilisateur mis à jour avec succès' });
    });
};

const resetPasswordController = async (req, res) => {
    const { id } = req.params;
    const bcrypt = require('bcryptjs');
    const db = require('../db');
    const crypto = require('crypto');

    try {
        const newPassword = crypto.randomBytes(4).toString('hex'); // 8 characters
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query("UPDATE utilisateur SET mot_de_passe = ? WHERE id = ?", [hashedPassword, id], (err, result) => {
            if (err) {
                console.error('Error resetting password:', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            res.json({ message: 'Mot de passe réinitialisé', newPassword });
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du hashage' });
    }
};

module.exports = {
    getUsersByRole: getUsersByRoleController,
    getAllUsers: getAllUsersController,
    updateUser: updateUserController,
    resetPassword: resetPasswordController
};
