const db = require('./db');

const userId = 18; // boutout Ikram (Current)

const sql = `
    SELECT 
      c.id as id,
      c.titre,
      c.resume,
      c.type,
      c.evenement_id,
      c.auteur_id,
      u.nom as auteur_principal_nom,
      u.prenom as auteur_principal_prenom,
      e.id as evaluation_id,
      CASE 
        WHEN e.date_evaluation IS NOT NULL THEN 'evaluated'
        WHEN e.id IS NOT NULL THEN 'pending'
        ELSE 'pending'
      END as status
    FROM communication c
    JOIN evenement ev ON c.evenement_id = ev.id
    JOIN comite_scientifique cs ON cs.evenement_id = ev.id
    JOIN membre_comite mc ON mc.comite_id = cs.id
    LEFT JOIN utilisateur u ON u.id = c.auteur_id
    LEFT JOIN evaluation e ON e.communication_id = c.id AND e.membre_comite_id = mc.id
    WHERE mc.utilisateur_id = ?
    ORDER BY c.id DESC
  `;

db.query(sql, [userId], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Results for user 27:', rows.length);
  console.log(rows);
  process.exit();
});
