const db = require('./db');

const tables = ['comite_scientifique', 'membre_comite'];

async function check() {
    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        try {
            const rows = await new Promise((resolve, reject) => {
                db.query(`DESCRIBE ${table}`, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            console.log(rows);
        } catch (err) {
            console.error(`Error in ${table}:`, err.message);
        }
    }

    console.log('\n--- Sample membre_comite data ---');
    db.query("SELECT * FROM membre_comite LIMIT 10", (err, rows) => {
        if (err) console.error(err);
        else console.log(rows);
        process.exit();
    });
}

check();
