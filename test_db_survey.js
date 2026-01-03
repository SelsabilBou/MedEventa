const db = require('./MedEventa-main/db');
const { getSurveysByEvent } = require('./MedEventa-main/models/survey.model');

// Mock eventId
const eventId = 13;

console.log('Testing getSurveysByEvent for eventId:', eventId);

try {
    getSurveysByEvent(eventId, (err, results) => {
        if (err) {
            console.error('❌ Error executing query:', err);
            process.exit(1);
        }
        console.log('✅ Query successful!');
        console.log('Results:', results);
        process.exit(0);
    });
} catch (error) {
    console.error('❌ Exception thrown:', error);
}
