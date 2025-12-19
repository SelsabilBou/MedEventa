// models/submission.model.js
const db = require('../db');

const createSubmission = (data, callback) => {
  const sql = `
    INSERT INTO communication
      (titre, resume, type, fichier_pdf, etat, id_auteur_principal, evenement_id)
    VALUES (?, ?, ?, ?, 'en_attente', ?, ?)
  `;

  const params = [
    data.titre,
    data.resume,
    data.type,
    data.fichier_pdf,
    data.id_auteur_principal,
    data.evenement_id
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    return callback(null, result.insertId);
  });
};

module.exports = { createSubmission };
