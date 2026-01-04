// models/event.model.js
const db = require('../db');

const createEvent = (data, callback) => {
  const { titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur } = data;
  const sqlEvent = `
    INSERT INTO evenement (titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sqlEvent,
    [titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur],
    (err, result) => {
      if (err) return callback(err, null);
      const eventId = result.insertId;

      // Automatically create a scientific committee for this event
      const sqlComite = 'INSERT INTO comite_scientifique (evenement_id, nom) VALUES (?, ?)';
      db.query(sqlComite, [eventId, `Comité de ${titre}`], (err2) => {
        if (err2) {
          console.error('Error creating comite_scientifique:', err2);
          // We still return the eventId even if committee creation fails, 
          // but log the error.
        }
        callback(null, eventId);
      });
    }
  );
};

const addComiteMember = (comiteId, userId, callback) => {
  const sql = `
    INSERT IGNORE INTO membre_comite (utilisateur_id, comite_id)
    VALUES (?, ?)
  `;
  db.query(sql, [userId, comiteId], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

const clearComiteMembers = (comiteId, callback) => {
  const sql = 'DELETE FROM membre_comite WHERE comite_id = ?';
  db.query(sql, [comiteId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const addInvite = (eventId, inviteData, callback) => {
  const { nom, prenom, email, sujet_conference, utilisateur_id } = inviteData;
  const sql = `
    INSERT INTO invite (nom, prenom, email, evenement_id, sujet_conference, utilisateur_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [nom, prenom, email, eventId, sujet_conference, utilisateur_id || null], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

const clearInvites = (eventId, callback) => {
  const sql = 'DELETE FROM invite WHERE evenement_id = ?';
  db.query(sql, [eventId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const addAnimateur = (eventId, userId, callback) => {
  const sql = 'INSERT IGNORE INTO animateur_evenement (evenement_id, utilisateur_id) VALUES (?, ?)';
  db.query(sql, [eventId, userId], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

const clearAnimateurs = (eventId, callback) => {
  const sql = 'DELETE FROM animateur_evenement WHERE evenement_id = ?';
  db.query(sql, [eventId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const getEvents = (status, callback) => {
  let sql = 'SELECT id, titre, description, date_debut, date_fin, lieu, thematique FROM evenement';
  if (status === 'upcoming') sql += ' WHERE date_debut >= CURRENT_DATE()';
  else if (status === 'archived') sql += ' WHERE date_fin < CURRENT_DATE()';
  sql += ' ORDER BY date_debut ASC';

  db.query(sql, [], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getEventDetails = (eventId, callback) => {
  const sqlEvent = `
    SELECT id, titre, description, date_debut, date_fin, lieu, thematique, contact
    FROM evenement
    WHERE id = ?
  `;

  db.query(sqlEvent, [eventId], (err, eventResult) => {
    if (err) return callback(err);
    if (eventResult.length === 0) return callback(null, null);

    const event = eventResult[0];

    const sqlSessions = `
      SELECT id, titre, horaire, salle, president_id
      FROM session
      WHERE evenement_id = ?
    `;

    db.query(sqlSessions, [eventId], (err2, sessionsResult) => {
      if (err2) return callback(err2);

      const sqlInvites = `
        SELECT i.id, i.nom, i.prenom, i.email, i.sujet_conference, i.utilisateur_id, u.photo, u.institution
        FROM invite i
        LEFT JOIN utilisateur u ON i.utilisateur_id = u.id
        WHERE i.evenement_id = ?
      `;

      db.query(sqlInvites, [eventId], (err3, invitesResult) => {
        if (err3) {
          console.warn('Warning: Could not fetch invites.', err3.message);
          invitesResult = [];
        }

        const sqlComite = `
          SELECT DISTINCT u.id, u.nom, u.prenom, u.email, u.institution, u.domaine_recherche, u.photo
          FROM membre_comite mc
          JOIN comite_scientifique cs ON mc.comite_id = cs.id
          JOIN utilisateur u ON u.id = mc.utilisateur_id
          WHERE cs.evenement_id = ?
        `;

        db.query(sqlComite, [eventId], (err4, comiteResult) => {
          if (err4) return callback(err4);

          const sqlAnimateurs = `
            SELECT u.id, u.nom, u.prenom, u.email, u.institution, u.photo
            FROM animateur_evenement ae
            JOIN utilisateur u ON u.id = ae.utilisateur_id
            WHERE ae.evenement_id = ?
          `;

          db.query(sqlAnimateurs, [eventId], (err5, animateursResult) => {
            if (err5) {
              console.warn('Warning: Could not fetch animateurs.', err5.message);
              animateursResult = [];
            }

            callback(null, {
              event,
              sessions: sessionsResult,
              invites: invitesResult,
              comite: comiteResult,
              animateurs: animateursResult
            });
          });
        });
      });
    });
  });
};

// ✅ NEW: check deadline soumission
const isSubmissionOpen = (eventId, callback) => {
  const sql = `
    SELECT id, date_limite_communication
    FROM evenement
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [eventId], (err, rows) => {
    if (err) return callback(err);

    if (!rows || rows.length === 0) {
      return callback(null, { ok: false, reason: 'EVENT_NOT_FOUND' });
    }

    const deadline = rows[0].date_limite_communication;
    if (!deadline) return callback(null, { ok: true }); // NULL => ouvert

    const now = new Date();
    if (now > new Date(deadline)) {
      return callback(null, { ok: false, reason: 'DEADLINE_PASSED', deadline });
    }

    return callback(null, { ok: true, deadline });
  });
};

// ✅ NEW (PHASE 5): vérifier que DATE(workshop.date) est dans [date_debut, date_fin]
const checkWorkshopDateInEvent = (eventId, mysqlDateTime, callback) => {
  const sql = `
    SELECT date_debut, date_fin,
           (DATE(?) BETWEEN date_debut AND date_fin) AS ok
    FROM evenement
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [mysqlDateTime, eventId], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) return callback(null, { found: false });

    return callback(null, {
      found: true,
      ok: rows[0].ok === 1,
      date_debut: rows[0].date_debut,
      date_fin: rows[0].date_fin,
    });
  });
};
const getEventById = (eventId, callback) => {
  const sql = `
    SELECT id, titre, description, date_debut, date_fin, lieu, thematique
    FROM evenement
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [eventId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0] || null);
  });
};

const getComiteByEvent = (eventId, callback) => {
  const sql = 'SELECT id FROM comite_scientifique WHERE evenement_id = ? LIMIT 1';
  db.query(sql, [eventId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0] || null);
  });
};

const createComiteByEvent = (eventId, eventTitle, callback) => {
  const sql = 'INSERT INTO comite_scientifique (evenement_id, nom) VALUES (?, ?)';
  db.query(sql, [eventId, `Comité de ${eventTitle || 'Event'}`], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

module.exports = {
  createEvent,
  addComiteMember,
  addInvite,
  clearInvites,
  addAnimateur,
  clearAnimateurs,
  getEvents,
  getEventDetails,
  isSubmissionOpen,
  checkWorkshopDateInEvent,
  getEventById,
  getComiteByEvent,
  createComiteByEvent,
  clearComiteMembers
};
