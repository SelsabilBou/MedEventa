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
    INSERT INTO workshop (evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.evenement_id,
    data.titre,
    data.description || null,
    data.responsable_id,
    data.date,
    data.salle,
    data.level || 'beginner',
    data.price || 0,
    data.nb_places,
    data.ouvert ?? true,
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


const getWorkshopsByResponsible = (responsibleId, callback) => {
  const sql = `
    SELECT w.*, e.titre AS event_titre,
           (SELECT COUNT(*) FROM inscription_workshop WHERE workshop_id = w.id) AS registered_count,
           (SELECT COUNT(*) FROM inscription_workshop_attente WHERE workshop_id = w.id) AS waitlist_count
    FROM workshop w
    JOIN evenement e ON e.id = w.evenement_id
    WHERE w.responsable_id = ?
    ORDER BY w.date ASC
  `;
  db.query(sql, [responsibleId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

const getAllWorkshopsWithStats = (callback) => {
  const sql = `
    SELECT w.*, e.titre AS event_titre,
           u.nom AS responsable_nom, u.prenom AS responsable_prenom,
           (SELECT COUNT(*) FROM inscription_workshop WHERE workshop_id = w.id) AS registered_count,
           (SELECT COUNT(*) FROM inscription_workshop_attente WHERE workshop_id = w.id) AS waitlist_count
    FROM workshop w
    JOIN evenement e ON e.id = w.evenement_id
    LEFT JOIN utilisateur u ON u.id = w.responsable_id
    ORDER BY w.date ASC
  `;
  db.query(sql, [], (err, rows) => {
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
    SET titre = ?, description = ?, responsable_id = ?, date = ?, salle = ?, level = ?, price = ?, nb_places = ?, ouvert = ?
    WHERE id = ?
  `;
  const params = [
    data.titre,
    data.description || null,
    data.responsable_id,
    data.date,
    data.salle,
    data.level || 'beginner',
    data.price || 0,
    data.nb_places,
    data.ouvert,
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

const updateWorkshopLeader = (workshopId, leaderId, callback) => {
  const sql = 'UPDATE workshop SET responsable_id = ? WHERE id = ?';
  db.query(sql, [leaderId, workshopId], (err, result) => {
    if (err) return callback(err);
    callback(null, result.affectedRows);
  });
};

module.exports = {
  eventExists,
  userExists,
  createWorkshop,
  getWorkshopsByEvent,
  getWorkshopsByResponsible,
  getAllWorkshopsWithStats, // NEW
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  updateWorkshopLeader,
};
