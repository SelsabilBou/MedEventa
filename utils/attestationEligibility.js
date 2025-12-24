// utils/attestationEligibility.js
const db = require('../db');

// Participant inscrit à l'événement ?
const isParticipantInscrit = (evenementId, userId, callback) => {
  const sql = `
    SELECT id
    FROM inscription
    WHERE evenement_id = ? AND participant_id = ?
    LIMIT 1
  `;
  db.query(sql, [evenementId, userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, !!(rows && rows.length));
  });
};

// Communicant avec au moins une communication acceptée ?
const hasAcceptedCommunication = (evenementId, userId, callback) => {
  const sql = `
    SELECT id
    FROM communication
    WHERE evenement_id = ?
      AND auteur_id = ?
      AND etat = 'acceptee'
    LIMIT 1
  `;
  db.query(sql, [evenementId, userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, !!(rows && rows.length));
  });
};

// Membre du comité pour cet événement ?
const isMembreComiteForEvent = (evenementId, userId, callback) => {
  const sql = `
    SELECT mc.id
    FROM membre_comite mc
    JOIN comite_scientifique cs ON mc.comite_id = cs.id
    WHERE cs.evenement_id = ?
      AND mc.utilisateur_id = ?
    LIMIT 1
  `;
  db.query(sql, [evenementId, userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, !!(rows && rows.length));
  });
};

// Organisateur de cet événement ?
const isOrganisateurForEvent = (evenementId, userId, callback) => {
  const sql = `
    SELECT id
    FROM evenement
    WHERE id = ?
      AND id_organisateur = ?
    LIMIT 1
  `;
  db.query(sql, [evenementId, userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, !!(rows && rows.length));
  });
};

module.exports = {
  isParticipantInscrit,
  hasAcceptedCommunication,
  isMembreComiteForEvent,
  isOrganisateurForEvent,
};
