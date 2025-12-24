const db = require('../db');

const createNotification = (utilisateur_id, evenement_id, type, message) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO notification (utilisateur_id, evenement_id, type, message, date_creation, lu)
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [utilisateur_id, evenement_id, type, message],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
};

const getNotificationsForUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * 
       FROM notification
       WHERE utilisateur_id = ?
       ORDER BY date_creation DESC`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

const markAsRead = (notificationId, userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE notification
       SET lu = 1
       WHERE id = ? AND utilisateur_id = ?`,
      [notificationId, userId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows); // 0 ou 1
      }
    );
  });
};

module.exports = { createNotification, getNotificationsForUser, markAsRead };
