const db = require('./db');

const sql = `
  SELECT i.id, i.participant_id, i.evenement_id, i.date_inscription, u.email
  FROM inscription i
  JOIN utilisateur u ON i.participant_id = u.id
  ORDER BY i.date_inscription DESC
  LIMIT 10
`;

db.query(sql, (err, results) => {
    if (err) {
        console.error('Error fetching inscriptions:', err);
        process.exit(1);
    }
    console.log('Recent Inscriptions:', results);
    process.exit(0);
});
