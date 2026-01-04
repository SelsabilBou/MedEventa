const db = require('./MedEventa-main/db');
const { getQuestionsByEvent } = require('./MedEventa-main/models/question.model');

const eventId = 13; // Assuming this is the active event ID based on previous context

console.log('Testing getQuestionsByEvent for eventId:', eventId);

try {
    getQuestionsByEvent(eventId, (err, questions) => {
        if (err) {
            console.error('❌ Error executing query:', err);
            process.exit(1);
        }
        console.log(`✅ Query successful! Found ${questions.length} questions.`);
        console.log('Questions:', questions);
        process.exit(0);
    });
} catch (error) {
    console.error('❌ Exception thrown:', error);
}
