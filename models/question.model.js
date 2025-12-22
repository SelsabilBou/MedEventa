// models/question.model.js
const db = require('../db');

// Créer une question pour un événement
const createQuestion = (eventId, userId, data, callback) => {
  const { contenu } = data;

  const sql = `
    INSERT INTO question (
      evenement_id,
      utilisateur_id,
      contenu
    ) VALUES (?, ?, ?)
  `;

  db.query(sql, [eventId, userId, contenu], (err, result) => {
    if (err) {
      console.error('Erreur createQuestion:', err);
      return callback(err, null);
    }
    callback(null, result.insertId); // ID de la question créée
  });
};

module.exports = {
  createQuestion,
};
