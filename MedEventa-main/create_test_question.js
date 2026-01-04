const db = require('./db');

// Event ID 13 (Journées Algériennes...)
const eventId = 13;
// User ID 17 (bissane - organizer)
const userId = 17;
const content = "Test question for Event 13 from script";

console.log(`Creating question for eventId: ${eventId}, userId: ${userId}`);

const sql = `
INSERT INTO question (evenement_id, utilisateur_id, contenu)
VALUES (?, ?, ?)
`;

db.query(sql, [eventId, userId, content], (err, result) => {
    if (err) {
        console.error('❌ Error executing query:', err);
        process.exit(1);
    }
    console.log(`✅ Question created successfully! ID: ${result.insertId}`);
    process.exit(0);
});
