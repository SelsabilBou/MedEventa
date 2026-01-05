const { validationResult } = require('express-validator');
const { createMessage, getMessagesForUser } = require('../models/message.model');
const { getNotificationsForUser, getUnreadCountForUser, createNotification } = require('../models/notification.model');

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

    // Créer une notification pour le destinataire
    await createNotification(
      destinataire_id,
      evenement_id || null,
      'new_message',
      'Vous avez reçu un nouveau message'
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

const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // On limite par ex. à 10 messages récents
    const [messages, notifications, unreadCount] = await Promise.all([
      getMessagesForUser(userId, 10),
      getNotificationsForUser(userId),
      getUnreadCountForUser(userId),
    ]);

    return res.status(200).json({
      messages,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Erreur getDashboardActivity:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du chargement du tableau de bord' });
  }
};

const sendWorkshopBroadcast = async (req, res) => {
  try {
    const expediteur_id = req.user.id;
    const { workshopId } = req.params;
    const { contenu, evenement_id } = req.body;

    if (!contenu) return res.status(400).json({ message: 'Contenu requis' });

    // Récupérer les participants du workshop
    const { listWorkshopRegistrations } = require('../models/workshopRegistration.model');

    listWorkshopRegistrations(workshopId, async (err, participants) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des participants' });

      if (!participants || participants.length === 0) {
        return res.status(400).json({ message: 'Aucun participant inscrit à ce workshop' });
      }

      // Envoyer un message à chaque participant
      const promises = participants.map(p => createMessage(
        expediteur_id,
        p.participant_id,
        evenement_id || null,
        contenu,
        'notif'
      ));

      await Promise.all(promises);

      return res.status(200).json({
        message: `Message envoyé à ${participants.length} participants`,
      });
    });
  } catch (error) {
    console.error('Erreur sendWorkshopBroadcast:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la diffusion du message' });
  }
};


const markAsReadController = (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  const { markMessageAsRead } = require('../models/message.model');

  markMessageAsRead(messageId, userId, (err, success) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!success) {
      return res.status(404).json({ message: 'Message non trouvé ou non autorisé' });
    }
    return res.status(200).json({ message: 'Message marqué comme lu' });
  });
};

module.exports = { sendMessage, getMessages, getDashboardActivity, sendWorkshopBroadcast, markAsReadController };
