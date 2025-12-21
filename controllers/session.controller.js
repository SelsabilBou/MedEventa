const db = require('../db');
const { validationResult } = require('express-validator');
const { createSession } = require('../models/session.model');

// POST /events/:eventId/sessions/create
const createSessionController = (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: errors.array(),
    });
  }

  const eventId = req.params.eventId;
  const { titre, horaire, salle, president_id } = req.body;
  const userId = req.user.id;

  // Vérifier que l'utilisateur est organisateur de l'événement
  const checkOrganizerSql = `
    SELECT id_organisateur FROM evenement 
    WHERE id = ? 
  `;
  
  db.query(checkOrganizerSql, [eventId], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Erreur serveur lors de la vérification' 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'Événement non trouvé' 
      });
    }

    if (results[0].id_organisateur !== userId) {
      return res.status(403).json({ 
        message: "Vous n'êtes pas l'organisateur de cet événement" 
      });
    }

    // Créer la session
    const data = { titre, horaire, salle, president_id };
    createSession(eventId, data, (err2, sessionId) => {
      if (err2) {
        return res.status(500).json({ 
          message: 'Erreur lors de la création de la session' 
        });
      }

      res.status(201).json({
        message: 'Session créée avec succès',
        eventId: Number(eventId),
        sessionId,
      });
    });
  });
};

module.exports = {
  createSessionController,
};
