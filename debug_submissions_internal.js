require('dotenv').config();
const db = require('./db');

async function debugSubmissions() {
    console.log("Debug Submissions Script Started...");

    try {
        // 1. Get all users
        const users = await query('SELECT id, nom, prenom, email FROM utilisateur');
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`User: [${u.id}] ${u.nom} ${u.prenom} (${u.email})`));

        // 2. Get all submissions
        const submissions = await query('SELECT id, titre, type, etat, auteur_id, evenement_id FROM communication');
        console.log(`Found ${submissions.length} submissions.`);
        submissions.forEach(s => console.log(`Submission: [${s.id}] '${s.titre}' (Status: ${s.etat}) - AuthorID: ${s.auteur_id}`));

        // 3. Check for mismatches
        submissions.forEach(s => {
            const author = users.find(u => u.id === s.auteur_id);
            if (!author) {
                console.warn(`WARNING: Submission [${s.id}] has AuthorID [${s.auteur_id}] which DOES NOTEXIST in users list!`);
            } else {
                console.log(`Submission [${s.id}] matches User [${author.id}] ${author.nom}`);
            }
        });

    } catch (err) {
        console.error("Error in debug script:", err);
    } finally {
        process.exit();
    }
}

function query(sql, args) {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

debugSubmissions();
