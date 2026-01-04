// models/workshopRegistration.model.js
const db = require('../db');

const getWorkshopCapacity = (workshopId, callback) => {
  const sql = `
    SELECT id, nb_places, date,
           (date < NOW()) AS is_past
    FROM workshop
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [workshopId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows[0] || null);
  });
};

const countRegistrations = (workshopId, callback) => {
  const sql = 'SELECT COUNT(*) AS total FROM inscription_workshop WHERE workshop_id = ?';
  db.query(sql, [workshopId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows[0].total || 0);
  });
};

// ---------------------
// WAITLIST HELPERS
// ---------------------
const isUserWaitlisted = (conn, workshopId, userId, cb) => {
  const sql = `
    SELECT id
    FROM inscription_workshop_attente
    WHERE workshop_id = ? AND participant_id = ?
    LIMIT 1
  `;
  conn.query(sql, [workshopId, userId], (err, rows) => {
    if (err) return cb(err);
    return cb(null, rows[0] || null);
  });
};

const addToWaitlist = (conn, workshopId, userId, cb) => {
  const sql = `
    INSERT INTO inscription_workshop_attente (participant_id, workshop_id)
    VALUES (?, ?)
  `;
  conn.query(sql, [userId, workshopId], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return cb(null, { ok: false, reason: 'ALREADY_WAITLISTED' });
      }
      return cb(err);
    }
    return cb(null, { ok: true, waitlistId: result.insertId });
  });
};

// ---------------------
// REGISTER (with waitlist)
// ---------------------
const registerToWorkshop = (workshopId, userId, callback) => {
  db.getConnection((errConn, conn) => {
    if (errConn) return callback(errConn);
    const release = () => conn.release();

    conn.beginTransaction((errTx) => {
      if (errTx) { release(); return callback(errTx); }

      // Lock workshop row
      const sqlW = `
        SELECT id, nb_places, date, (date < NOW()) AS is_past
        FROM workshop
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
      `;
      conn.query(sqlW, [workshopId], (errW, wRows) => {
        if (errW) return conn.rollback(() => { release(); callback(errW); });

        const workshop = wRows[0];
        if (!workshop) {
          return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'WORKSHOP_NOT_FOUND' }); });
        }
        if (workshop.is_past) {
          return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'WORKSHOP_PAST' }); });
        }

        // Already registered?
        const sqlExists = `
          SELECT id
          FROM inscription_workshop
          WHERE workshop_id = ? AND participant_id = ?
          LIMIT 1
          FOR UPDATE
        `;
        conn.query(sqlExists, [workshopId, userId], (errE, eRows) => {
          if (errE) return conn.rollback(() => { release(); callback(errE); });

          if (eRows.length) {
            return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'ALREADY_REGISTERED' }); });
          }

          // Lock registrations rows for this workshop (count by length)
          const sqlLockRegs = `
            SELECT id
            FROM inscription_workshop
            WHERE workshop_id = ?
            FOR UPDATE
          `;
          conn.query(sqlLockRegs, [workshopId], (errL, regRows) => {
            if (errL) return conn.rollback(() => { release(); callback(errL); });

            const total = regRows.length;
            const nbPlaces = workshop.nb_places;

            // Full => waitlist
            if (nbPlaces !== null && total >= nbPlaces) {
              isUserWaitlisted(conn, workshopId, userId, (errWL, rowWL) => {
                if (errWL) return conn.rollback(() => { release(); callback(errWL); });

                if (rowWL) {
                  return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'ALREADY_WAITLISTED' }); });
                }

                addToWaitlist(conn, workshopId, userId, (errAdd, addRes) => {
                  if (errAdd) return conn.rollback(() => { release(); callback(errAdd); });
                  if (!addRes.ok) return conn.rollback(() => { release(); callback(null, addRes); });

                  return conn.commit((errC) => {
                    if (errC) return conn.rollback(() => { release(); callback(errC); });
                    release();
                    return callback(null, { ok: true, status: 'WAITLISTED', waitlistId: addRes.waitlistId });
                  });
                });
              });
              return;
            }

            // Place available => insert registration
            const sqlIns = `
              INSERT INTO inscription_workshop (participant_id, workshop_id)
              VALUES (?, ?)
            `;
            conn.query(sqlIns, [userId, workshopId], (errI, result) => {
              if (errI) {
                if (errI.code === 'ER_DUP_ENTRY') {
                  return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'ALREADY_REGISTERED' }); });
                }
                return conn.rollback(() => { release(); callback(errI); });
              }

              return conn.commit((errC) => {
                if (errC) return conn.rollback(() => { release(); callback(errC); });
                release();
                return callback(null, { ok: true, status: 'REGISTERED', registrationId: result.insertId });
              });
            });
          });
        });
      });
    });
  });
};

// ---------------------
// UNREGISTER (and promote waitlist)
// ---------------------
const unregisterFromWorkshop = (workshopId, userId, callback) => {
  db.getConnection((errConn, conn) => {
    if (errConn) return callback(errConn);
    const release = () => conn.release();

    conn.beginTransaction((errTx) => {
      if (errTx) { release(); return callback(errTx); }

      // 1) delete from registrations
      const sqlDel = `
        DELETE FROM inscription_workshop
        WHERE workshop_id = ? AND participant_id = ?
      `;
      conn.query(sqlDel, [workshopId, userId], (errD, resultD) => {
        if (errD) return conn.rollback(() => { release(); callback(errD); });

        if (resultD.affectedRows === 0) {
          // Not registered => try remove from waitlist
          const sqlDelW = `
            DELETE FROM inscription_workshop_attente
            WHERE workshop_id = ? AND participant_id = ?
          `;
          conn.query(sqlDelW, [workshopId, userId], (errDW, resDW) => {
            if (errDW) return conn.rollback(() => { release(); callback(errDW); });
            if (resDW.affectedRows === 0) {
              return conn.rollback(() => { release(); callback(null, { ok: false, reason: 'NOT_REGISTERED' }); });
            }

            return conn.commit((errC) => {
              if (errC) return conn.rollback(() => { release(); callback(errC); });
              release();
              return callback(null, { ok: true, status: 'UNWAITLISTED' });
            });
          });
          return;
        }

        // 2) promote oldest waitlisted if there is free space
        const sqlW = `
          SELECT id, nb_places
          FROM workshop
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `;
        conn.query(sqlW, [workshopId], (errW, wRows) => {
          if (errW) return conn.rollback(() => { release(); callback(errW); });
          const w = wRows[0];

          if (!w || w.nb_places === null) {
            return conn.commit((errC) => {
              if (errC) return conn.rollback(() => { release(); callback(errC); });
              release();
              return callback(null, { ok: true, status: 'UNREGISTERED', promoted: false });
            });
          }

          // Lock registrations, count
          const sqlLockRegs = `
            SELECT id
            FROM inscription_workshop
            WHERE workshop_id = ?
            FOR UPDATE
          `;
          conn.query(sqlLockRegs, [workshopId], (errL, regRows) => {
            if (errL) return conn.rollback(() => { release(); callback(errL); });

            const total = regRows.length;
            if (total >= w.nb_places) {
              return conn.commit((errC) => {
                if (errC) return conn.rollback(() => { release(); callback(errC); });
                release();
                return callback(null, { ok: true, status: 'UNREGISTERED', promoted: false });
              });
            }

            // Pop oldest waitlist
            const sqlPop = `
              SELECT id, participant_id
              FROM inscription_workshop_attente
              WHERE workshop_id = ?
              ORDER BY created_at ASC, id ASC
              LIMIT 1
              FOR UPDATE
            `;
            conn.query(sqlPop, [workshopId], (errP, rowsP) => {
              if (errP) return conn.rollback(() => { release(); callback(errP); });

              const waitRow = rowsP[0];
              if (!waitRow) {
                return conn.commit((errC) => {
                  if (errC) return conn.rollback(() => { release(); callback(errC); });
                  release();
                  return callback(null, { ok: true, status: 'UNREGISTERED', promoted: false });
                });
              }

              // Remove from waitlist then insert as registered
              conn.query('DELETE FROM inscription_workshop_attente WHERE id = ?', [waitRow.id], (errDel) => {
                if (errDel) return conn.rollback(() => { release(); callback(errDel); });

                const sqlIns = `
                  INSERT INTO inscription_workshop (participant_id, workshop_id)
                  VALUES (?, ?)
                `;
                conn.query(sqlIns, [waitRow.participant_id, workshopId], (errIns, resIns) => {
                  if (errIns) {
                    if (errIns.code === 'ER_DUP_ENTRY') {
                      return conn.commit((errC) => {
                        if (errC) return conn.rollback(() => { release(); callback(errC); });
                        release();
                        return callback(null, { ok: true, status: 'UNREGISTERED', promoted: false });
                      });
                    }
                    return conn.rollback(() => { release(); callback(errIns); });
                  }

                  return conn.commit((errC) => {
                    if (errC) return conn.rollback(() => { release(); callback(errC); });
                    release();
                    return callback(null, {
                      ok: true,
                      status: 'UNREGISTERED',
                      promoted: true,
                      promoted_user_id: waitRow.participant_id,
                      new_registration_id: resIns.insertId,
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

const listWorkshopRegistrations = (workshopId, callback) => {
  const sql = `
    SELECT i.*, i.id AS inscription_id, i.participant_id, u.nom, u.prenom, u.email
    FROM inscription_workshop i
    JOIN utilisateur u ON u.id = i.participant_id
    WHERE i.workshop_id = ?
    ORDER BY u.nom ASC, u.prenom ASC
  `;
  db.query(sql, [workshopId], (err, rows) => {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

const updatePresence = (inscriptionId, presence, callback) => {
  db.query(
    'UPDATE inscription_workshop SET presence = ? WHERE id = ?',
    [presence ? 1 : 0, inscriptionId],
    (err, result) => {
      if (err) return callback(err);
      return callback(null, result.affectedRows);
    }
  );
};

const updateConfirmationStatus = (inscriptionId, status, callback) => {
  db.query(
    'UPDATE inscription_workshop SET confirmation_status = ? WHERE id = ?',
    [status, inscriptionId],
    (err, result) => {
      if (err) return callback(err);
      return callback(null, result.affectedRows);
    }
  );
};

const getWaitlistCount = (workshopId, callback) => {
  db.query(
    'SELECT COUNT(*) AS total FROM inscription_workshop_attente WHERE workshop_id = ?',
    [workshopId],
    (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows[0].total || 0);
    }
  );
};

module.exports = {
  registerToWorkshop,
  unregisterFromWorkshop,
  listWorkshopRegistrations,
  getWorkshopCapacity,
  countRegistrations,
  updatePresence,
  updateConfirmationStatus,
  getWaitlistCount,
};
