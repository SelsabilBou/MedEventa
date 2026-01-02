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
// Générer un badge unique pour une inscription
const generateBadge = (inscriptionId, callback) => {
  const code = uuidv4(); // code unique [web:49][web:173]

  const sql = `
    UPDATE inscription
    SET badge = ?
    WHERE id = ?
  `;

  db.query(sql, [code, inscriptionId], (err, result) => {
    if (err) {
      console.error('Erreur generateBadge:', err);
      return callback(err, null);
    }
    if (result.affectedRows === 0) {
      return callback(null, null); // inscription non trouvée
    }
    callback(null, code);
  });
};

const getBadgeByCode = (code, callback) => {
  const sql = `
    SELECT id, participant_id, evenement_id, badge, date_inscription
    FROM inscription
    WHERE badge = ?
  `;

  db.query(sql, [code], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
};
const getParticipants = (eventId, profil, callback) => {
  // profil peut être null → pas de filtre [web:191][web:197]
  let sql = `
    SELECT 
      i.id AS inscription_id,
      u.id AS utilisateur_id,
      u.nom,
      u.prenom,
      u.email,
      u.role AS profil,
      i.statut_paiement,
      i.badge,
      i.date_inscription
    FROM inscription i
    JOIN utilisateur u ON i.participant_id = u.id
    WHERE i.evenement_id = ?
  `;
  const params = [eventId];

  if (profil) {
    sql += ' AND u.role = ?';
    params.push(profil);
  }

  sql += ' ORDER BY i.date_inscription DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur getParticipants:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

const getUserInscriptions = (userId, callback) => {
  const sql = `
    SELECT 
      i.id,
      i.evenement_id,
      e.titre AS title,
      CAST(NULL AS CHAR) AS parent,
      e.date_debut AS date,
      e.lieu AS place,
      i.statut_paiement AS status,
      i.badge,
      i.date_inscription,
      'Event' as type
    FROM inscription i
    JOIN evenement e ON i.evenement_id = e.id
    WHERE i.participant_id = ?

    UNION ALL

    SELECT 
      iw.id,
      w.evenement_id,
      w.titre AS title,
      e.titre AS parent,
      w.date AS date,
      w.salle AS place,
      'confirmed' AS status,
      CAST(NULL AS CHAR) AS badge,
      w.date AS date_inscription,
      'Workshop' as type
    FROM inscription_workshop iw
    JOIN workshop w ON iw.workshop_id = w.id
    JOIN evenement e ON w.evenement_id = e.id
    WHERE iw.participant_id = ?

    ORDER BY date DESC
  `;
  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error('Erreur getUserInscriptions:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

const getMyProgramme = (userId, callback) => {
  // 1. Get Events
  const sqlEvents = `
    SELECT
      i.evenement_id AS id,
      e.titre AS title,
      e.date_debut,
      e.date_fin,
      e.lieu AS place,
      i.statut_paiement AS status
    FROM inscription i
    JOIN evenement e ON i.evenement_id = e.id
    WHERE i.participant_id = ?
    ORDER BY e.date_debut ASC
  `;

  // 2. Get Workshops
  const sqlWorkshops = `
    SELECT
      iw.workshop_id AS id,
      w.evenement_id,
      w.titre AS title,
      w.date,
      w.responsable_id,
      u.nom AS responsable_nom,
      u.prenom AS responsable_prenom,
      w.salle AS place
    FROM inscription_workshop iw
    JOIN workshop w ON iw.workshop_id = w.id
    LEFT JOIN utilisateur u ON w.responsable_id = u.id
    WHERE iw.participant_id = ?
    ORDER BY w.date ASC
  `;

  // 3. Get Sessions (for events user is registered to)
  const sqlSessions = `
    SELECT
      s.id,
      s.evenement_id,
      s.titre AS title,
      s.horaire AS date,
      s.salle AS place
    FROM session s
    JOIN inscription i ON s.evenement_id = i.evenement_id
    WHERE i.participant_id = ?
    ORDER BY s.horaire ASC
  `;

  db.query(sqlEvents, [userId], (err, events) => {
    if (err) return callback(err);

    db.query(sqlWorkshops, [userId], (errW, workshops) => {
      if (errW) return callback(errW);

      db.query(sqlSessions, [userId], (errS, sessions) => {
        if (errS) return callback(errS);

        // Merge data
        const programme = events.map(event => {
          const eventWorkshops = workshops.filter(w => w.evenement_id === event.id).map(w => ({
            ...w,
            type: 'Workshop'
          }));
          const eventSessions = sessions.filter(s => s.evenement_id === event.id).map(s => ({
            ...s,
            type: 'Session'
          }));

          return {
            ...event,
            type: 'Event',
            items: [...eventSessions, ...eventWorkshops].sort((a, b) => new Date(a.date) - new Date(b.date))
          };
        });

        callback(null, programme);
      });
    });
  });
};

module.exports = {
  registerInscription, getPaymentStatus,
  updatePaymentStatus, generateBadge,
  getBadgeByCode, getParticipants,
  getUserInscriptions, getMyProgramme,
};
