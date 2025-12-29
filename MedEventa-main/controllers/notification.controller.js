const { validationResult } = require('express-validator');
const { 
  createNotification, 
  getNotificationsForUser, 
  markAsRead 
} = require('../models/notification.model');

// Route de TEST pour créer une notif
const createTestNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { utilisateur_id, evenement_id, type, message } = req.body;

    const id = await createNotification(
      utilisateur_id,
      evenement_id || null,
      type,
      message
    );

    return res.status(201).json({
      message: 'Notification créée avec succès',
      id,
    });
  } catch (error) {
    console.error('Erreur createTestNotification:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création de la notification' });
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await getNotificationsForUser(userId);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications' });
  }
};

// PUT /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const affected = await markAsRead(notificationId, userId);

    if (affected === 0) {
      return res.status(404).json({ message: 'Notification introuvable ou pas à vous' });
    }

    return res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur markNotificationRead:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la notification' });
  }
};

module.exports = { createTestNotification, getNotifications, markNotificationRead };
