// models/inscription.model.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const registerInscription = (eventId, userId, profil, callback) => {
  const badge = uuidv4();
  const sql = `
    INSERT INTO inscription (
      participant_id,
      evenement_id,
      statut_paiement,
      badge,
      date_inscription
    )
    VALUES (?, ?, 'a_payer', ?, CURRENT_DATE())
  `;
  db.query(sql, [userId, eventId, badge], (err, result) => {
    if (err) {
      console.error('Erreur insertion inscription:', err);
      return callback(err, null);
    }
    callback(null, result.insertId);
  });
};
const getPaymentStatus = (inscriptionId, callback) => {
  const sql = `
    SELECT statut_paiement
    FROM inscription
    WHERE id = ?
  `;
  db.query(sql, [inscriptionId], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0].statut_paiement);
  });
};

const updatePaymentStatus = (inscriptionId, status, callback) => {
  const sql = `
    UPDATE inscription
    SET statut_paiement = ?
    WHERE id = ?
  `;
  db.query(sql, [status, inscriptionId], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows);
  });
};

module.exports = { registerInscription , getPaymentStatus,
  updatePaymentStatus,};
