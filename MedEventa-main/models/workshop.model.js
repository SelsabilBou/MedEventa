// models/workshop.model.js
const db = require('../db');

// ===== Helpers =====
const eventExists = (eventId, callback) => {
  db.query(
    'SELECT id FROM evenement WHERE id = ? LIMIT 1',
    [eventId],
    (err, rows) => {
      if (err) return callback(err);
      return callback(null, !!rows[0]);
    }
  );
};

const userExists = (userId, callback) => {
  db.query(
    'SELECT id FROM utilisateur WHERE id = ? LIMIT 1',
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      return callback(null, !!rows[0]);
    }
  );
};

// ===== CRUD =====
const createWorkshop = (data, callback) => {
  const sql = `
    INSERT INTO workshop (evenement_id, titre, responsable_id, date, nb_places)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    data.evenement_id,
    data.titre,
    data.responsable_id,
    data.date,
    data.nb_places,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    return callback(null, result.insertId);
  });
};

const getWorkshopsByEvent = (eventId, callback) => {
  const sql = `
    SELECT w.*, u.nom AS responsable_nom, u.prenom AS responsable_prenom
    FROM workshop w
    JOIN utilisateur u ON u.id = w.responsable_id
    WHERE w.evenement_id = ?
    ORDER BY w.date ASC
  `;
  db.query(sql, [eventId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

const getWorkshopById = (workshopId, callback) => {
  const sql = `
    SELECT w.*, u.nom AS responsable_nom, u.prenom AS responsable_prenom
    FROM workshop w
    JOIN utilisateur u ON u.id = w.responsable_id
    WHERE w.id = ?
    LIMIT 1
  `;
  db.query(sql, [workshopId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows[0] || null);
  });
};

const updateWorkshop = (workshopId, data, callback) => {
  const sql = `
    UPDATE workshop
    SET titre = ?, responsable_id = ?, date = ?, nb_places = ?
    WHERE id = ?
  `;
  const params = [
    data.titre,
    data.responsable_id,
    data.date,
    data.nb_places,
    workshopId,
  ];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    return callback(null, result.affectedRows);
  });
};

const deleteWorkshop = (workshopId, callback) => {
  db.query('DELETE FROM workshop WHERE id = ?', [workshopId], (err, result) => {
    if (err) return callback(err);
    return callback(null, result.affectedRows);
  });
};

module.exports = {
  eventExists,
  userExists,
  createWorkshop,
  getWorkshopsByEvent,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
};
