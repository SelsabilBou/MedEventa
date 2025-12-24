const { validationResult } = require('express-validator');
const { createMessage, getMessagesForUser } = require('../models/message.model');

// POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expediteur_id = req.user.id; // vient de verifyToken
    const { destinataire_id, evenement_id, contenu, type } = req.body;

    const messageId = await createMessage(
      expediteur_id,
      destinataire_id,
      evenement_id || null,
      contenu,
      type || 'notif'
    );

    return res.status(201).json({
      message: 'Message envoyé avec succès',
      id: messageId,
    });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l’envoi du message' });
  }
};

// GET /api/messages
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id; // destinataire connecté
    const limit = parseInt(req.query.limit, 10) || 20;

    const messages = await getMessagesForUser(userId, limit);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
  }
};

module.exports = { sendMessage, getMessages };
