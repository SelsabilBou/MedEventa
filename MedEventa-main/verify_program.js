const { getInterventionsByUser } = require('./models/session.model');
const db = require('./db');

const userId = 9; // The author ID found in export
console.log(`Checking interventions for user ${userId}...`);

getInterventionsByUser(userId, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Result:', JSON.stringify(rows, null, 2));
    }
    process.exit();
});
