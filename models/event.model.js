//Contient les requêtes SQL pour interagir avec les tables evenement, comite_scientifique, membre_comite, invite, session
// models/event.model.js
const db = require('../db');

const createEvent = (data, callback) => {
  const { titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur } = data;
  const sql = `
    INSERT INTO evenement (titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur], (err, result) => {
    if (err) {
      console.error('Erreur insertion événement:', err);
      return callback(err, null);
    }
    callback(null, result.insertId); // Retourne l'ID de l'événement créé
  });
};

module.exports = { createEvent };