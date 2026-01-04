const db = require('../db');

// Créer une session pour un événement
const createSession = (eventId, data, callback) => {
  const { titre, horaire, salle, president_id } = data;

  const sql = `
    INSERT INTO session (
      evenement_id,
      titre,
      horaire,
      salle,
      president_id
    ) VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [eventId, titre, horaire, salle, president_id], (err, result) => {
    if (err) {
      console.error('Erreur createSession:', err);
      return callback(err, null);
    }
    callback(null, result.insertId);
  });
};

// Attribuer une communication à une session
const assignCommunication = (sessionId, communicationId, callback) => {
  const sql = `
    UPDATE communication
    SET session_id = ?
    WHERE id = ?
      AND etat = 'acceptee'
      AND session_id IS NULL
  `;

  db.query(sql, [sessionId, communicationId], (err, result) => {
    if (err) {
      console.error('Erreur assignCommunication:', err);
      return callback(err, null);
    }
    callback(null, result.affectedRows);
  });
};

// Obtenir les interventions d'un utilisateur
const getInterventionsByUser = (userId, callback) => {
  const sql = `
    SELECT 
      s.id as session_id, s.titre as session_titre, s.horaire as session_horaire, 
      s.salle as session_salle, s.evenement_id as evenement_id, e.titre as event_titre,
      'chair' as role, NULL as comm_id, NULL as comm_titre, NULL as comm_resume, NULL as comm_type
    FROM session s
    JOIN evenement e ON e.id = s.evenement_id
    WHERE s.president_id = ?

    UNION ALL

    SELECT 
      (c.id + 500000) as session_id,  -- Virtual ID to avoid collision
      c.titre as session_titre,       -- Use Abstract Title as Session Title
      CONCAT(DATE_FORMAT(e.date_debut, '%Y-%m-%d'), ' 09:00:00') as session_horaire, 
      'Virtual Room' as session_salle, 
      c.evenement_id as evenement_id, e.titre as event_titre,
      'speaker' as role, c.id as comm_id, c.titre as comm_titre, c.resume as comm_resume, c.type as comm_type
    FROM communication c
    JOIN evenement e ON e.id = c.evenement_id
    WHERE c.auteur_id = ? AND c.etat = 'acceptee' AND c.session_id IS NULL
    
    ORDER BY session_horaire ASC
  `;
  db.query(sql, [userId, userId], (err, rows) => {
    if (err) {
      console.error('Erreur getInterventionsByUser:', err);
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Programme global d'un événement
// Programme global d'un événement
const getProgram = (eventId, callback) => {
  const sql = `
    SELECT
      s.id               AS session_id,
      s.titre            AS session_titre,
      s.horaire          AS session_horaire,
      s.salle            AS session_salle,
      s.president_id     AS session_president_id,
      u.nom              AS president_nom,
      u.prenom           AS president_prenom,
      c.id               AS comm_id,
      c.titre            AS comm_titre,
      c.type             AS comm_type,
      c.etat             AS comm_etat
    FROM session s
    LEFT JOIN utilisateur u
      ON u.id = s.president_id
    LEFT JOIN communication c
      ON c.session_id = s.id
    WHERE s.evenement_id = ?

    UNION ALL

    SELECT
      (c.id + 500000)    AS session_id, -- Virtual ID
      c.titre            AS session_titre, -- Abstract Title as Session Title
      CONCAT(DATE_FORMAT(e.date_debut, '%Y-%m-%d'), ' 09:00:00') AS session_horaire,
      'Virtual Room'     AS session_salle,
      NULL               AS session_president_id,
      NULL               AS president_nom,
      NULL               AS president_prenom,
      c.id               AS comm_id,
      c.titre            AS comm_titre,
      c.type             AS comm_type,
      c.etat             AS comm_etat
    FROM communication c
    JOIN evenement e ON c.evenement_id = e.id
    WHERE c.evenement_id = ? 
      AND c.etat = 'acceptee' 
      AND c.session_id IS NULL

    ORDER BY session_horaire ASC, session_id ASC, comm_id ASC
  `;

  db.query(sql, [eventId, eventId], (err, rows) => {
    if (err) {
      console.error('Erreur getProgram:', err);
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Programme détaillé pour un jour précis
const getDetailedProgram = (eventId, date, callback) => {
  const sql = `
    SELECT
      s.id               AS session_id,
      s.titre            AS session_titre,
      s.horaire          AS session_horaire,
      s.salle            AS session_salle,
      s.president_id     AS session_president_id,
      u.nom              AS president_nom,
      u.prenom           AS president_prenom,
      c.id               AS comm_id,
      c.titre            AS comm_titre,
      c.type             AS comm_type,
      c.etat             AS comm_etat
    FROM session s
    LEFT JOIN utilisateur u
      ON u.id = s.president_id
    LEFT JOIN communication c
      ON c.session_id = s.id
    WHERE s.evenement_id = ?
      AND DATE(s.horaire) = ?

    UNION ALL

    SELECT
      (c.id + 500000)    AS session_id, -- Virtual ID
      c.titre            AS session_titre, -- Abstract Title
      CONCAT(DATE_FORMAT(e.date_debut, '%Y-%m-%d'), ' 09:00:00') AS session_horaire,
      'Virtual Room'     AS session_salle,
      NULL               AS session_president_id,
      NULL               AS president_nom,
      NULL               AS president_prenom,
      c.id               AS comm_id,
      c.titre            AS comm_titre,
      c.type             AS comm_type,
      c.etat             AS comm_etat
    FROM communication c
    JOIN evenement e ON c.evenement_id = e.id
    WHERE c.evenement_id = ? 
      AND c.etat = 'acceptee' 
      AND c.session_id IS NULL
      AND DATE(e.date_debut) = ?

    ORDER BY session_horaire ASC, session_id ASC, comm_id ASC
  `;

  db.query(sql, [eventId, date, eventId, date], (err, rows) => {
    if (err) {
      console.error('Erreur getDetailedProgram:', err);
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Mettre à jour une session
const updateSession = (sessionId, data, callback) => {
  const { titre, horaire, salle, president_id } = data;

  const sql = `
    UPDATE session
    SET
      titre = COALESCE(?, titre),
      horaire = COALESCE(?, horaire),
      salle = COALESCE(?, salle),
      president_id = COALESCE(?, president_id)
    WHERE id = ?
  `;

  db.query(
    sql,
    [titre || null, horaire || null, salle || null, president_id || null, sessionId],
    (err, result) => {
      if (err) {
        console.error('Erreur updateSession:', err);
        return callback(err, null);
      }
      callback(null, result.affectedRows);
    }
  );
};

const getSessionsByEvent = (eventId, callback) => {
  const sql = `
    SELECT s.id, s.titre, s.horaire, s.salle, s.evenement_id, s.president_id, u.nom AS president_nom, u.prenom AS president_prenom
    FROM session s
    LEFT JOIN utilisateur u ON u.id = s.president_id
    WHERE s.evenement_id = ?

    UNION ALL

    SELECT 
      (c.id + 500000) AS id, -- Virtual ID
      c.titre         AS titre, -- Abstract Title
      CONCAT(DATE_FORMAT(e.date_debut, '%Y-%m-%d'), ' 09:00:00') AS horaire,
      'Virtual Room'  AS salle,
      c.evenement_id  AS evenement_id,
      NULL            AS president_id,
      NULL            AS president_nom,
      NULL            AS president_prenom
    FROM communication c
    JOIN evenement e ON e.id = c.evenement_id
    WHERE c.evenement_id = ? 
      AND c.etat = 'acceptee' 
      AND c.session_id IS NULL

    ORDER BY horaire ASC
  `;
  db.query(sql, [eventId, eventId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

module.exports = {
  createSession,
  assignCommunication,
  getProgram,
  getDetailedProgram,
  updateSession,
  getInterventionsByUser,
  getSessionsByEvent
};
