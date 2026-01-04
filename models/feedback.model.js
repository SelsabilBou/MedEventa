const db = require('../db');

const createFeedback = (eventId, userId, rating, comment, callback) => {
    const sql = `INSERT INTO feedback (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`;
    db.query(sql, [eventId, userId, rating, comment], (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
    });
};

const getFeedbackByEvent = (eventId, callback) => {
    const sql = `
    SELECT f.*, u.nom as user_name, u.prenom as user_firstname 
    FROM feedback f
    LEFT JOIN utilisateur u ON f.user_id = u.id
    WHERE f.event_id = ?
    ORDER BY f.created_at DESC
  `;
    db.query(sql, [eventId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

module.exports = { createFeedback, getFeedbackByEvent };
