const db = require('../db');
const { validationResult } = require('express-validator');
const { createSession } = require('../models/session.model');

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

module.exports = { createSessionController };
