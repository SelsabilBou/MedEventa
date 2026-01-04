const db = require('./db');

const comiteIds = [1, 2, 3, 4, 5, 6];

const sql = `
  SELECT cs.id as comite_id, cs.evenement_id, e.titre as event_titre
  FROM comite_scientifique cs
  JOIN evenement e ON cs.evenement_id = e.id
  WHERE cs.id IN (${comiteIds.join(',')})
`;

db.query(sql, (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Committees and their Events:', rows);

    const eventIds = rows.map(r => r.evenement_id);
    db.query(`SELECT evenement_id, COUNT(*) as count FROM communication WHERE evenement_id IN (${eventIds.join(',')}) GROUP BY evenement_id`, (err2, counts) => {
        if (err2) console.error(err2);
        else console.log('Submission counts for these events:', counts);
        process.exit();
    });
});
