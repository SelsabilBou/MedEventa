// models/submission.model.js
const db = require('../db');

/**
 * createSubmission(data, callback)
 * data = {
 *   titre: string,
 *   resume: string,
 *   type: 'orale' | 'affiche' | 'poster',
 *   fichier_pdf: string,     // chemin du fichier PDF (ex: "uploads/communications/xxx.pdf")
 *   auteur_id: number,       // req.user.id
 *   evenement_id: number     // req.params.eventId
 * }
 *
 * callback(err, submissionId)
 */
const createSubmission = (data, callback) => {
  const sql = `
    INSERT INTO communication
      (titre, resume, type, fichier_pdf, etat, auteur_id, evenement_id)
    VALUES (?, ?, ?, ?, 'en_attente', ?, ?)
  `;

  const params = [
    data.titre,
    data.resume,
    data.type,
    data.fichier_pdf,
    data.auteur_id,
    data.evenement_id
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);

    // result.insertId = l'ID AUTO_INCREMENT créé par l'INSERT
    return callback(null, result.insertId);
  });
};

module.exports = {
  createSubmission
};
