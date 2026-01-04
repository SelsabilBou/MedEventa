const db = require('./db');

db.query("SELECT id, nom, prenom, role FROM utilisateur WHERE nom LIKE '%Ikram%' OR prenom LIKE '%Ikram%'", (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Found users:', rows);

    if (rows.length > 0) {
        const userId = rows[0].id;
        const sql = `
      SELECT mc.id as mc_id, mc.utilisateur_id, cs.evenement_id, e.titre as evenement_titre
      FROM membre_comite mc
      JOIN comite_scientifique cs ON mc.comite_id = cs.id
      JOIN evenement e ON cs.evenement_id = e.id
      WHERE mc.utilisateur_id = ?
    `;
        db.query(sql, [userId], (err2, memberRows) => {
            if (err2) console.error(err2);
            else console.log('Committee memberships:', memberRows);

            if (memberRows.length > 0) {
                const eventId = memberRows[0].evenement_id;
                db.query("SELECT id, titre, evenement_id FROM communication WHERE evenement_id = ?", [eventId], (err3, commRows) => {
                    if (err3) console.error(err3);
                    else console.log(`Submissions for event ${eventId}:`, commRows);
                    process.exit();
                });
            } else {
                process.exit();
            }
        });
    } else {
        process.exit();
    }
});
