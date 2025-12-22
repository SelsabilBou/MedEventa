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
// Attribuer une communication à une session (Phase 2)
const assignCommunication = (sessionId, communicationId, callback) => {
  const sql = `
    UPDATE communication
    SET session_id = ?
    WHERE id = ?
      AND etat = 'acceptee'
      AND session_id IS NULL
  `;

  db.query(sql, [sessionId, communicationId], (err, result) => {
    if (err) {
      console.error('Erreur assignCommunication:', err);
      return callback(err, null);
    }
    // 1 si une communication a été mise à jour, 0 sinon
    callback(null, result.affectedRows);
  });
};

module.exports = {
  createSession, assignCommunication,
};
