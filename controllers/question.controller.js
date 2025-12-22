// controllers/question.controller.js
const { validationResult } = require('express-validator');
const db = require('../db');
const { createQuestion } = require('../models/question.model');

// POST /events/:eventId/questions/submit
const submitQuestionController = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: errors.array(),
    });
  }

  const eventId = req.params.eventId;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  const userId = req.user.id;

  // Vérifier que l'événement existe
  const sqlEvent = `
    SELECT id FROM evenement
    WHERE id = ?
  `;

  db.query(sqlEvent, [eventId], (err, results) => {
    if (err) {
      console.error('Erreur vérification événement (question):', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const data = { contenu: req.body.contenu };

    createQuestion(eventId, userId, data, (err2, questionId) => {
      if (err2) {
        return res.status(500).json({
          message: 'Erreur lors de la création de la question',
        });
      }

      // Ici plus tard : Socket.io pour notifier en temps réel

      return res.status(201).json({
        message: 'Question soumise avec succès',
        eventId: Number(eventId),
        questionId,
      });
    });
  });
};

module.exports = {
  submitQuestionController,
};
