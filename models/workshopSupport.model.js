// models/workshopSupport.model.js
const db = require('../db');

const addSupport = (workshopId, data, callback) => {
  const sql = `
    INSERT INTO support_atelier (workshop_id, type, url, titre)
    VALUES (?, ?, ?, ?)
  `;
  const params = [workshopId, data.type, data.url, data.titre || null];

  db.query(sql, params, (err, result) => {
    if (err) return callback(err);
    return callback(null, result.insertId);
  });
};

const listSupports = (workshopId, callback) => {
  db.query(
    'SELECT * FROM support_atelier WHERE workshop_id = ? ORDER BY id DESC',
    [workshopId],
    (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

// utile pour supprimer aussi le fichier du disque
const getSupportById = (supportId, callback) => {
  db.query(
    'SELECT * FROM support_atelier WHERE id = ? LIMIT 1',
    [supportId],
    (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows[0] || null);
    }
  );
};

const deleteSupport = (supportId, callback) => {
  db.query(
    'DELETE FROM support_atelier WHERE id = ?',
    [supportId],
    (err, result) => {
      if (err) return callback(err);
      return callback(null, result.affectedRows);
    }
  );
};

module.exports = {
  addSupport,
  listSupports,
  getSupportById,
  deleteSupport,
};
