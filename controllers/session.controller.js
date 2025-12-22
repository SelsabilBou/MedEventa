const db = require('../db');
const { validationResult } = require('express-validator');
const { createSession , assignCommunication} = require('../models/session.model');

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
  
  // 🔥 PROTECTION : vérifier req.user existe
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  
  const userId = req.user.id;

  const checkOrganizerSql = `
    SELECT id_organisateur FROM evenement WHERE id = ?
  `;
  
  db.query(checkOrganizerSql, [eventId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    if (results[0].id_organisateur !== userId) {
      return res.status(403).json({ message: "Vous n'êtes pas l'organisateur" });
    }

    const data = { titre, horaire, salle, president_id };
    createSession(eventId, data, (err2, sessionId) => {
      if (err2) {
        return res.status(500).json({ message: 'Erreur création session' });
      }
      res.status(201).json({
        message: 'Session créée avec succès',
        eventId: Number(eventId),
        sessionId,
      });
    });
  });
};
// POST /sessions/:sessionId/assign-communication
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

    // Vérifier que l'utilisateur est organisateur de l'événement
    if (sessionRow.id_organisateur !== userId) {
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
module.exports = { createSessionController ,assignCommunicationController,};
