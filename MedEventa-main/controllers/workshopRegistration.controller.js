// controllers/workshopRegistration.controller.js
const {
    registerToWorkshop,
    unregisterFromWorkshop,
    listWorkshopRegistrations,
    getWorkshopCapacity,
    updatePresence,
    updateConfirmationStatus,
} = require('../models/workshopRegistration.model');
const { createNotification } = require('../models/notification.model');
const db = require('../db'); // For fetching event_id or workshop title


const registerWorkshopController = (req, res) => {
    const workshopId = parseInt(req.params.workshopId, 10);
    const userId = req.user.id;


    registerToWorkshop(workshopId, userId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });


        if (!result.ok) {
            if (result.reason === 'WORKSHOP_NOT_FOUND') return res.status(404).json({ message: 'Workshop introuvable' });
            if (result.reason === 'WORKSHOP_PAST') return res.status(400).json({ message: 'Inscription refusée: workshop déjà passé' });
            if (result.reason === 'WORKSHOP_FULL') return res.status(400).json({ message: 'Workshop complet', capacity: result.capacity });
            if (result.reason === 'ALREADY_REGISTERED') return res.status(409).json({ message: 'Déjà inscrit à ce workshop' });
            if (result.reason === 'ALREADY_WAITLISTED') return res.status(409).json({ message: "Déjà en liste d'attente pour ce workshop" });
            return res.status(400).json({ message: 'Inscription refusée' });
        }


        // ✅ ajout waitlist
        if (result.status === 'WAITLISTED') {
            return res.status(201).json({
                message: "Workshop complet: ajouté en liste d'attente",
                waitlistId: result.waitlistId,
            });
        }


        // ✅ inscription normale
        // Fetch event_id for the workshop to link notification
        db.query('SELECT evenement_id, titre FROM workshop WHERE id = ?', [workshopId], (wErr, wRows) => {
            const evId = wRows?.[0]?.evenement_id || null;
            const wsTitre = wRows?.[0]?.titre || "Workshop";
            createNotification(userId, evId, 'workshop_registration', `Vous êtes inscrit au workshop: ${wsTitre}`)
                .catch(nErr => console.error("Notification WS registration error:", nErr));
        });

        return res.status(201).json({
            message: 'Inscription workshop réussie',
            registrationId: result.registrationId,
        });
    });
};


const unregisterWorkshopController = (req, res) => {
    const workshopId = parseInt(req.params.workshopId, 10);
    const userId = req.user.id;


    getWorkshopCapacity(workshopId, (err, workshop) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
        if (!workshop) return res.status(404).json({ message: 'Workshop introuvable' });


        // ✅ maintenant le model renvoie un objet result (pas affectedRows)
        unregisterFromWorkshop(workshopId, userId, (err2, result) => {
            if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });


            if (!result.ok && result.reason === 'NOT_REGISTERED') {
                return res.status(404).json({ message: "Vous n'êtes ni inscrit ni en liste d'attente pour ce workshop" });
            }


            if (result.status === 'UNWAITLISTED') {
                return res.status(200).json({ message: "Retiré de la liste d'attente" });
            }


            // status === 'UNREGISTERED'
            if (result.promoted && result.promoted_user_id) {
                db.query('SELECT evenement_id, titre FROM workshop WHERE id = ?', [workshopId], (wErr, wRows) => {
                    const evId = wRows?.[0]?.evenement_id || null;
                    const wsTitre = wRows?.[0]?.titre || "Workshop";
                    createNotification(result.promoted_user_id, evId, 'workshop_promotion', `Bonne nouvelle! Vous avez été promu de la liste d'attente pour le workshop: ${wsTitre}`)
                        .catch(nErr => console.error("Notification WS promotion error:", nErr));
                });
            }

            return res.status(200).json({
                message: 'Désinscription workshop réussie',
                promoted: result.promoted || false,
                promoted_user_id: result.promoted_user_id || null,
                new_registration_id: result.new_registration_id || null,
            });
        });
    });
};


const listRegistrationsController = (req, res) => {
    const workshopId = parseInt(req.params.workshopId, 10);

    listWorkshopRegistrations(workshopId, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
        return res.status(200).json(rows);
    });
};

const removeParticipant = (req, res) => {
    const workshopId = parseInt(req.params.workshopId, 10);
    const participantId = parseInt(req.params.participantId, 10);

    unregisterFromWorkshop(workshopId, participantId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });

        if (!result.ok && result.reason === 'NOT_REGISTERED') {
            return res.status(404).json({ message: "Ce participant n'est pas inscrit à ce workshop" });
        }

        if (result.status === 'UNWAITLISTED') {
            return res.status(200).json({ message: "Participant retiré de la liste d'attente" });
        }

        // status === 'UNREGISTERED'
        return res.status(200).json({
            message: 'Participant retiré avec succès',
            promoted: result.promoted || false,
            promoted_user_id: result.promoted_user_id || null,
        });
    });
};

const updatePresenceController = (req, res) => {
    const { inscriptionId } = req.params;
    const { presence } = req.body;

    updatePresence(inscriptionId, presence, (err, affected) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
        if (affected === 0) return res.status(404).json({ message: 'Inscription introuvable' });
        return res.status(200).json({ message: 'Présence mise à jour' });
    });
};

const updateConfirmationController = (req, res) => {
    const { inscriptionId } = req.params;
    const { status } = req.body;

    updateConfirmationStatus(inscriptionId, status, (err, affected) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
        if (affected === 0) return res.status(404).json({ message: 'Inscription introuvable' });
        return res.status(200).json({ message: 'Statut de confirmation mis à jour' });
    });
};

module.exports = {
    registerWorkshopController,
    unregisterWorkshopController,
    listRegistrationsController,
    removeParticipant,
    updatePresenceController,
    updateConfirmationController,
};
