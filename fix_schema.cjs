// fix_schema.cjs
require('dotenv').config({ path: './MedEventa-main/.env' });
const db = require('./MedEventa-main/db');

async function fixSchema() {
    console.log("Starting schema fix...");

    const queries = [
        // 1. Create or fix comite_scientifique
        "ALTER TABLE comite_scientifique ADD COLUMN IF NOT EXISTS nom VARCHAR(255);",

        // 2. Create invite table if missing
        `CREATE TABLE IF NOT EXISTS invite (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        evenement_id INT NOT NULL,
        sujet_conference VARCHAR(255),
        utilisateur_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evenement_id) REFERENCES evenement(id) ON DELETE CASCADE,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE SET NULL
    );`,

        // 3. Ensure utilisateur_id exists in invite (if table existed but column was missing)
        "ALTER TABLE invite ADD COLUMN IF NOT EXISTS utilisateur_id INT NULL;",
        "ALTER TABLE invite ADD CONSTRAINT IF NOT EXISTS fk_invite_user FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE SET NULL;",

        // 4. Create animateur_evenement table
        `CREATE TABLE IF NOT EXISTS animateur_evenement (
        id INT PRIMARY KEY AUTO_INCREMENT,
        evenement_id INT NOT NULL,
        utilisateur_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evenement_id) REFERENCES evenement(id) ON DELETE CASCADE,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
        UNIQUE (evenement_id, utilisateur_id)
    );`,

        // 5. Ensure evenement has date_limite_communication
        "ALTER TABLE evenement ADD COLUMN IF NOT EXISTS date_limite_communication DATETIME;"
    ];

    for (const sql of queries) {
        try {
            console.log(`Executing: ${sql.substring(0, 50)}...`);
            await new Promise((resolve, reject) => {
                db.query(sql, (err) => {
                    if (err) {
                        // Ignore IF NOT EXISTS or DUPLICATE errors if they happen despite our checks
                        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY' || err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_FK_DUP_NAME') {
                            console.warn(`  Warning: ${err.message}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`  Error executing query: ${sql}`);
            console.error(error);
        }
    }

    console.log("Schema fix completed.");
    process.exit();
}

fixSchema();
