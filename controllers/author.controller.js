const db = require("../db");

const getAuthorStats = (req, res) => {// fonction qui retourne les statistiques globales d'un auteur
  try {
    if (!req.user || !req.user.id) {
      return res.status(500).json({ message: "User context missing" });
    }
    const authorId = req.user.id;
    const sql = `
      SELECT 
        SUM(CASE WHEN etat = 'acceptee' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN etat = 'en_attente' OR etat = 'en_revision' THEN 1 ELSE 0 END) as pending
      FROM communication
      WHERE auteur_id = ?
    `;

    db.query(sql, [authorId], (err, results) => {// execution de la requete 
      if (err) {// gestion des erreurs
        require('fs').appendFileSync('backend_error.log', `[${new Date().toISOString()}] Error fetching author stats for user ${authorId}: ${err.message}\n`);
        console.error("Error fetching author stats:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      const stats = (results && results[0]) || { accepted: 0, pending: 0 };// valeur par defaut a 0
      res.json({// resultas envoyee au frontend
        accepted: stats.accepted || 0,
        pending: stats.pending || 0,
        views: 0,
      });
    });
  } catch (error) {
    console.error("Unhandled error in getAuthorStats:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAuthorSubmissions = (req, res) => {// retourne la liste des communications soumises par l'auteur
  try {
    if (!req.user || !req.user.id) {// verification utilisateur
      return res.status(500).json({ message: "User context missing" });
    }
    const authorId = req.user.id;// ID de l'auteur
    const sql = `
    SELECT id, titre as title, resume as abstract, type, etat as status, evenement_id, updated_at as date
    FROM communication
    WHERE auteur_id = ?
    ORDER BY id DESC
  `;

    db.query(sql, [authorId], (err, results) => {
      if (err) {
        require('fs').appendFileSync('backend_error.log', `[${new Date().toISOString()}] Error fetching submissions for user ${authorId}: ${err.message}\n`);
        console.error("Error fetching author submissions:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.json(results || []);
    });
  } catch (error) {//gestion des erreurs
    console.error("Unhandled error in getAuthorSubmissions:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAuthorStats,
  getAuthorSubmissions,
};
