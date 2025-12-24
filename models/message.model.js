const db = require('../config/database');

const createMessage = (expediteur_id, destinataire_id, evenement_id, contenu, type = 'notif') => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO message_interne (expediteur_id, destinataire_id, evenement_id, contenu, type, date_envoi) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [expediteur_id, destinataire_id, evenement_id, contenu, type],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      }
    );
  });
};

const getMessagesForUser = (userId, limit = 20) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT m.*, u.nom, u.prenom 
       FROM message_interne m 
       JOIN utilisateur u ON m.expediteur_id = u.id
       WHERE m.destinataire_id = ? 
       ORDER BY m.date_envoi DESC 
       LIMIT ?`,
      [userId, limit],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

module.exports = { createMessage, getMessagesForUser };
