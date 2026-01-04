const { getSessionsByEvent } = require('./models/session.model');

const eventId = 1;
console.log(`Checking sessions for event ${eventId}...`);

getSessionsByEvent(eventId, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        const virtualSessions = rows.filter(r => r.salle === 'Virtual Room');
        console.log(`Total Sessions: ${rows.length}`);
        console.log(`Virtual Sessions Found: ${virtualSessions.length}`);
        if (virtualSessions.length > 0) {
            console.log('First Virtual Session:', JSON.stringify(virtualSessions[0], null, 2));
        }
    }
    process.exit();
});
