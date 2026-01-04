const db = require('./db');

const userId = 29; // Ikram Boutout based on logs

console.log('Checking database for user ID:', userId);

const queries = {
    user: "SELECT id, nom, prenom, role FROM utilisateur WHERE id = ?",
    isMember: "SELECT mc.*, cs.evenement_id FROM membre_comite mc JOIN comite_scientifique cs ON mc.comite_id = cs.id WHERE mc.utilisateur_id = ?",
    eventComms: "SELECT evenement_id, COUNT(*) as count FROM communication GROUP BY evenement_id",
    allComms: "SELECT * FROM communication LIMIT 5",
    schemaComm: "DESCRIBE communication",
};

async function check() {
    for (const [name, sql] of Object.entries(queries)) {
        console.log(`\n--- ${name} ---`);
        try {
            const rows = await new Promise((resolve, reject) => {
                db.query(sql, name === 'user' || name === 'isMember' ? [userId] : [], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            console.log(rows);
        } catch (err) {
            console.error(`Error in ${name}:`, err.message);
        }
    }
    process.exit();
}

check();
