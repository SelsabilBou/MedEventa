//Gère la logique métier pour les événements (création, récupération, mise à jour). Inclut des fonctions comme createEvent, getEvents, getEventDetails, addComite, addInvite
// controllers/event.controller.js
const { createEvent } = require('../models/event.model');

const createEventController = async (req, res) => {
  const { titre, description, date_debut, date_fin, lieu, thematique, contact } = req.body;
  const id_organisateur = req.user.id; // Récupéré du token JWT via middleware

  // Données à insérer
  const eventData = {
    titre,
    description,
    date_debut,
    date_fin,
    lieu,
    thematique,
    contact,
    id_organisateur,
  };

  createEvent(eventData, (err, eventId) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
    }
    res.status(201).json({
      message: 'Événement créé avec succès',
      eventId,
    });
  });
};

module.exports = { createEventController };