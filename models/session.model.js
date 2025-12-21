const db = require('../db');

// Créer une session pour un événement
const createSession = (eventId, data, callback) => {
  const { titre, horaire, salle, president_id } = data;

  const sql = `
    INSERT INTO session (
      evenement_id,
      titre,
      horaire,
      salle,
      president_id
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [eventId, titre, horaire, salle, president_id], (err, result) => {
    if (err) {
      console.error('Erreur createSession:', err);
      return callback(err, null);
    }
    callback(null, result.insertId);
  });
};

module.exports = {
  createSession,
};
