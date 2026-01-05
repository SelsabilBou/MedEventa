const db = require('../db');// gerer les sessions de programme d'un evenement scientifique
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { createSession, assignCommunication, getProgram, getDetailedProgram, updateSession, } = require('../models/session.model');
const { createNotification } = require('../models/notification.model');

const logSession = (message) => {
    const logFile = path.join(__dirname, '../debug_session.txt');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
};

const createSessionController = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Données invalides',
            errors: errors.array(),
        });
    }

    const eventId = req.params.eventId;
    const { titre, horaire, salle, president_id } = req.body;

    // vérifier req.user existe
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const checkOrganizerSql = `
    SELECT id_organisateur FROM evenement WHERE id = ?
  `;

    db.query(checkOrganizerSql, [eventId], (err, results) => {
        if (err) {
            console.error('DB Error checking organizer:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const idOrganisateur = results[0].id_organisateur;
        const isOrganizer = Number(idOrganisateur) === Number(userId);
        const isAdmin = userRole && (userRole.toUpperCase().trim() === 'SUPER_ADMIN' || userRole.toUpperCase().trim() === 'ORGANISATEUR');

        logSession(`createSessionController: eventId=${eventId}, userId=${userId}, userRole=${userRole}, id_organisateur=${idOrganisateur}, isOrganizer=${isOrganizer}, isAdmin=${isAdmin}`);

        if (!isOrganizer && !isAdmin) {
            logSession(`ACCESS DENIED for user ${userId}`);
            return res.status(403).json({ message: "Vous n'êtes pas l'organisateur" });
        }

        const data = { titre, horaire, salle, president_id };
        createSession(eventId, data, (err2, sessionId) => {
            if (err2) {
                console.error('Error creating session:', err2);
                return res.status(500).json({ message: 'Erreur création session' });
            }

            // Send notification to Organizer
            createNotification(userId, eventId, 'session_created', `Votre session "${titre}" a été créée avec succès.`)
                .catch(nErr => console.error("Notification Session creation error:", nErr));

            res.status(201).json({
                message: 'Session créée avec succès',
                eventId: Number(eventId),
                sessionId,
            });
        });
    });
};


const assignCommunicationController = (req, res) => {
    const sessionId = req.params.sessionId;
    const { communicationId } = req.body;

    if (!communicationId) {
        return res.status(400).json({
            message: 'communicationId est obligatoire',
        });
    }

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1) Vérifier que la session existe et récupérer l'événement + organisateur
    const sqlSession = `
    SELECT s.id, s.evenement_id, e.id_organisateur
    FROM session s
    JOIN evenement e ON s.evenement_id = e.id
    WHERE s.id = ?
  `;

    db.query(sqlSession, [sessionId], (err, results) => {
        if (err) {
            console.error('Erreur vérification session:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        const sessionRow = results[0];
        const isOrganizer = Number(sessionRow.id_organisateur) === Number(userId);
        const isAdmin = userRole && (userRole.toUpperCase().trim() === 'SUPER_ADMIN' || userRole.toUpperCase().trim() === 'ORGANISATEUR');

        logSession(`assignCommunicationController: sessionId=${sessionId}, userId=${userId}, userRole=${userRole}, id_organisateur=${sessionRow.id_organisateur}, isOrganizer=${isOrganizer}, isAdmin=${isAdmin}`);

        // Vérifier que l'utilisateur est organisateur de l'événement or Admin
        if (!isOrganizer && !isAdmin) {
            logSession(`ACCESS DENIED in assignCommunicationController for user ${userId}`);
            return res.status(403).json({
                message: "Vous n'êtes pas l'organisateur de cet événement",
            });
        }

        // 2) Tenter l'assignation
        assignCommunication(sessionId, communicationId, (err2, affectedRows) => {
            if (err2) {
                return res.status(500).json({
                    message: "Erreur lors de l'attribution de la communication",
                });
            }

            if (affectedRows === 0) {
                return res.status(400).json({
                    message:
                        "Impossible d'attribuer cette communication (non acceptée ou déjà affectée à une session)",
                });
            }

            return res.status(200).json({
                message: 'Communication attribuée à la session avec succès',
                sessionId: Number(sessionId),
                communicationId: Number(communicationId),
            });
        });
    });
};

// GET /events/:eventId/program
const getProgramController = (req, res) => {
    const eventId = req.params.eventId;

    getProgram(eventId, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération du programme' });
        }

        const sessionsMap = {};

        rows.forEach((row) => {
            if (!sessionsMap[row.session_id]) {
                sessionsMap[row.session_id] = {
                    id: row.session_id,
                    titre: row.session_titre,
                    horaire: row.session_horaire,
                    salle: row.session_salle,
                    president_id: row.session_president_id,
                    president_nom: row.president_nom,
                    president_prenom: row.president_prenom,
                    communications: [],
                };
            }

            if (row.comm_id) {
                sessionsMap[row.session_id].communications.push({
                    id: row.comm_id,
                    titre: row.comm_titre,
                    type: row.comm_type,
                    etat: row.comm_etat,
                });
            }
        });

        return res.status(200).json({
            eventId: Number(eventId),
            sessions: Object.values(sessionsMap),
        });
    });
};

// GET /events/:eventId/program/detailed?date=YYYY-MM-DD
const getDetailedProgramController = (req, res) => {
    const eventId = req.params.eventId;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Paramètre date (YYYY-MM-DD) obligatoire' });
    }

    getDetailedProgram(eventId, date, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération du programme détaillé' });
        }

        const sessionsMap = {};

        rows.forEach((row) => {
            if (!sessionsMap[row.session_id]) {
                sessionsMap[row.session_id] = {
                    id: row.session_id,
                    titre: row.session_titre,
                    horaire: row.session_horaire,
                    salle: row.session_salle,
                    president_id: row.session_president_id,
                    president_nom: row.president_nom,
                    president_prenom: row.president_prenom,
                    communications: [],
                };
            }

            if (row.comm_id) {
                sessionsMap[row.session_id].communications.push({
                    id: row.comm_id,
                    titre: row.comm_titre,
                    type: row.comm_type,
                    etat: row.comm_etat,
                });
            }
        });

        return res.status(200).json({
            eventId: Number(eventId),
            date,
            sessions: Object.values(sessionsMap),
        });
    });
};

// PUT /sessions/:sessionId/update
const updateSessionController = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Données invalides',
            errors: errors.array(),
        });
    }

    const sessionId = req.params.sessionId;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;

    // Vérifier que la session existe et que l'utilisateur est organisateur de l'événement
    const sqlSession = `
    SELECT s.id, s.evenement_id, e.id_organisateur
    FROM session s
    JOIN evenement e ON s.evenement_id = e.id
    WHERE s.id = ?
  `;

    db.query(sqlSession, [sessionId], (err, results) => {
        if (err) {
            console.error('Erreur vérification session:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        const row = results[0];
        const isOrganizer = Number(row.id_organisateur) === Number(userId);
        const isAdmin = userRole && (userRole.toUpperCase().trim() === 'SUPER_ADMIN' || userRole.toUpperCase().trim() === 'ORGANISATEUR');

        logSession(`updateSessionController: sessionId=${sessionId}, userId=${userId}, userRole=${userRole}, id_organisateur=${row.id_organisateur}, isOrganizer=${isOrganizer}, isAdmin=${isAdmin}`);

        if (!isOrganizer && !isAdmin) {
            logSession(`ACCESS DENIED in updateSessionController for user ${userId}`);
            return res.status(403).json({
                message: "Vous n'êtes pas l'organisateur de cet événement",
            });
        }

        const { titre, horaire, salle, president_id } = req.body;
        const data = { titre, horaire, salle, president_id };

        updateSession(sessionId, data, (err2, affectedRows) => {
            if (err2) {
                return res
                    .status(500)
                    .json({ message: 'Erreur lors de la mise à jour de la session' });
            }

            if (affectedRows === 0) {
                return res.status(400).json({
                    message: "Aucune modification n'a été appliquée",
                });
            }

            return res.status(200).json({
                message: 'Session mise à jour avec succès',
                sessionId: Number(sessionId),
            });
        });
    });
};

// GET /api/sessions/my-interventions
const listMyInterventions = (req, res) => {
    const userId = req.user.id;
    require('../models/session.model').getInterventionsByUser(userId, (err, rows) => {
        if (err) {
            console.error('Erreur listMyInterventions:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json(rows);
    });
};

module.exports = {
    createSessionController, assignCommunicationController, getProgramController,
    getDetailedProgramController, updateSessionController, listMyInterventions,
};
