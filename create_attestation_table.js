const db = require('./db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS attestation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  evenement_id INT NOT NULL,
  workshop_id INT DEFAULT NULL,
  type VARCHAR(50) NOT NULL,
  date_generation DATE DEFAULT (CURRENT_DATE),
  fichier_pdf VARCHAR(255) NOT NULL,
  unique_code VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id) ON DELETE CASCADE,
  FOREIGN KEY (workshop_id) REFERENCES workshop(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
    console.log("Table 'attestation' created successfully.");
    process.exit(0);
});
