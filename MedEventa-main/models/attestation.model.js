// models/attestation.model.js
const db = require('../db'); // ✅ هذا الصحيح في مشروعك

// data = { evenementId, utilisateurId, type, fichierPdf, uniqueCode }
function createAttestation(data, callback) {
  // ✅ نخلي MySQL يحط التاريخ (DATE) مباشرة
  const sql = `
    INSERT INTO attestation (utilisateur_id, evenement_id, workshop_id, type, date_generation, fichier_pdf, unique_code)
    VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)
  `;

  const params = [
    data.utilisateurId,
    data.evenementId,
    data.workshopId || null, // ✅ Workshop ID (optional)
    data.type,
    data.fichierPdf,
    data.uniqueCode || null // ✅ يسمح NULL و UNIQUE ما يمنعش NULLs [web:196]
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);

    const created = {
      id: result.insertId,
      utilisateur_id: data.utilisateurId,
      evenement_id: data.evenementId,
      workshop_id: data.workshopId || null,
      type: data.type,
      date_generation: new Date(), // display فقط (DB راهي CURRENT_DATE)
      fichier_pdf: data.fichierPdf,
      unique_code: data.uniqueCode || null
    };

    callback(null, created);
  });
}

function getAttestationById(id, callback) {
  const sql = `SELECT * FROM attestation WHERE id = ?`;
  db.query(sql, [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0] || null);
  });
}

function getAttestationByUser(evenementId, utilisateurId, type, callback, workshopId) {
  // Handle optional workshopId (if callback is passed as 4th arg)
  if (typeof callback !== 'function' && typeof workshopId === 'function') {
    const temp = callback;
    callback = workshopId;
    workshopId = temp;
  }

  let sql = `SELECT * FROM attestation WHERE evenement_id = ? AND utilisateur_id = ? AND type = ?`;
  const params = [evenementId, utilisateurId, type];

  if (workshopId) {
    sql += ` AND workshop_id = ?`;
    params.push(workshopId);
  }

  sql += ` ORDER BY id DESC LIMIT 1`;

  db.query(sql, params, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0] || null);
  });
}

function listAttestationsByEvent(evenementId, callback) {
  const sql = `
    SELECT * FROM attestation
    WHERE evenement_id = ?
    ORDER BY date_generation DESC
  `;
  db.query(sql, [evenementId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function listAttestationsByUser(utilisateurId, evenementId, callback) {
  // Join with evenement and workshop to get titles
  const params = [utilisateurId];
  let sql = `
    SELECT 
      a.*, 
      e.titre AS event_titre, 
      w.titre AS workshop_titre
    FROM attestation a
    LEFT JOIN evenement e ON a.evenement_id = e.id
    LEFT JOIN workshop w ON a.workshop_id = w.id
    WHERE a.utilisateur_id = ?
  `;

  if (evenementId) {
    sql += ` AND a.evenement_id = ?`;
    params.push(evenementId);
  }

  sql += ` ORDER BY a.date_generation DESC`;

  db.query(sql, params, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function deleteAttestation(id, callback) {
  const sql = `DELETE FROM attestation WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
}
function upsertAttestation(data, callback) {
  const sql = `
    INSERT INTO attestation (utilisateur_id, evenement_id, workshop_id, type, date_generation, fichier_pdf, unique_code)
    VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)
    ON DUPLICATE KEY UPDATE
      date_generation = CURRENT_DATE,
      fichier_pdf = VALUES(fichier_pdf),
      unique_code = VALUES(unique_code)
  `;

  const params = [
    data.utilisateurId,
    data.evenementId,
    data.workshopId || null,
    data.type,
    data.fichierPdf,
    data.uniqueCode || null
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);

    // Pass workshopId to getAttestationByUser
    getAttestationByUser(data.evenementId, data.utilisateurId, data.type, callback, data.workshopId || null);
  });
}
function getAttestationByUniqueCode(uniqueCode, callback) {
  const sql = `
    SELECT a.*, u.nom, u.prenom, e.titre AS event_titre
    FROM attestation a
    JOIN utilisateur u ON u.id = a.utilisateur_id
    JOIN evenement e ON e.id = a.evenement_id
    WHERE a.unique_code = ?
    LIMIT 1
  `;
  db.query(sql, [uniqueCode], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0] || null);
  });
}



module.exports = {
  createAttestation,
  upsertAttestation,            // ✅ Phase 5
  getAttestationByUniqueCode,   // ✅ Phase 5

  getAttestationById,
  getAttestationByUser,
  listAttestationsByEvent,
  listAttestationsByUser,
  deleteAttestation
};
