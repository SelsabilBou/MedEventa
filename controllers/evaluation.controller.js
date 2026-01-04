// controllers/evaluation.controller.js
const { validationResult } = require('express-validator');
const db = require('../db');
const {
  assignManual,
  getEvaluationForm,
  submitEvaluation,
  generateReport,
  hasReportForProposition,
  listEvaluationsModel,
  listReportsModel,
} = require('../models/evaluation.model');

const { setSubmissionStatus } = require('../models/submission.model');
const { createNotification } = require('../models/notification.model');

// POST /api/evaluations/event/:eventId/assign-manual
// Body: { "propositionId": 3, "evaluateurIds": [1, 2, 5] }
const assignManually = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { eventId } = req.params;
  const { propositionId, evaluateurIds } = req.body;

  // 1) Vérifier que la communication existe et appartient bien à l'événement
  const sqlComm = `
    SELECT id, evenement_id
    FROM communication
    WHERE id = ?
  `;

  db.query(sqlComm, [propositionId], (err, commRows) => {
    if (err) {
      console.error('Erreur SELECT communication:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (commRows.length === 0) {
      return res.status(404).json({ message: 'Proposition non trouvée' });
    }
    if (commRows[0].evenement_id !== Number(eventId)) {
      return res
        .status(400)
        .json({ message: "Cette proposition n'appartient pas à cet événement" });
    }

    // 2) Vérifier que chaque evaluateurId correspond bien à un membre_comite de CE même event
    const ids = evaluateurIds.map((id) => Number(id));
    const placeholders = ids.map(() => '?').join(',');

    const sqlMembres = `
      SELECT mc.id
      FROM membre_comite mc
      JOIN comite_scientifique cs ON mc.comite_id = cs.id
      WHERE cs.evenement_id = ?
        AND mc.id IN (${placeholders})
    `;

    db.query(sqlMembres, [eventId, ...ids], (err2, membreRows) => {
      if (err2) {
        console.error('Erreur SELECT membre_comite:', err2);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (membreRows.length !== ids.length) {
        return res.status(400).json({
          message:
            "Certains évaluateurs ne sont pas des membres du comité de cet événement",
        });
      }

      const membreComiteIds = membreRows.map((row) => row.id);

      // 3) Appeler le modèle pour insérer dans evaluation
      assignManual(propositionId, membreComiteIds, (err3, result) => {
        if (err3) {
          return res
            .status(500)
            .json({ message: "Erreur lors de l'affectation manuelle" });
        }

        res.status(201).json({
          message: 'Affectations créées avec succès',
          propositionId,
          eventId: Number(eventId),
          nbAffectations: result.affectedRows,
        });
      });
    });
  });
};

// GET /api/evaluations/evaluation/:evaluationId/form
// Récupérer le formulaire d'évaluation (pour l'évaluateur connecté)
const getEvaluationFormController = (req, res) => {
  const { evaluationId } = req.params;
  const userId = req.user.id; // ID de l'évaluateur connecté

  // Vérifier que l'évaluateur est bien assigné à cette évaluation
  const sqlCheck = `
    SELECT e.id, e.membre_comite_id
    FROM evaluation e
    JOIN membre_comite mc ON e.membre_comite_id = mc.id
    WHERE e.id = ? AND mc.utilisateur_id = ?
  `;

  db.query(sqlCheck, [evaluationId, userId], (err, rows) => {
    if (err) {
      console.error('Erreur vérif assignation:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (rows.length === 0) {
      return res.status(403).json({
        message: "Vous n'êtes pas assigné à cette évaluation",
      });
    }

    // Récupérer le formulaire
    getEvaluationForm(evaluationId, (err2, formData) => {
      if (err2) {
        console.error('Erreur getEvaluationForm:', err2);
        return res
          .status(500)
          .json({ message: 'Erreur serveur', error: err2.message });
      }
      if (!formData) {
        return res.status(404).json({ message: 'Évaluation non trouvée' });
      }

      res.json({
        message: "Formulaire d'évaluation",
        evaluation: formData,
      });
    });
  });
};

// POST /api/evaluations/evaluation/:evaluationId/submit
// Soumettre les scores et recommandation
const submitEvaluationController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { evaluationId } = req.params;
  const userId = req.user.id;
  const {
    pertinence,
    qualite_scientifique,
    originalite,
    commentaire,
    decision,
  } = req.body;

  // Vérifier que l'évaluateur est bien assigné
  const sqlCheck = `
    SELECT e.id, e.membre_comite_id, e.communication_id
    FROM evaluation e
    JOIN membre_comite mc ON e.membre_comite_id = mc.id
    WHERE e.id = ? AND mc.utilisateur_id = ?
  `;

  db.query(sqlCheck, [evaluationId, userId], async (err, rows) => {
    if (err) {
      console.error('Erreur vérif assignation:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (rows.length === 0) {
      return res.status(403).json({
        message: "Vous n'êtes pas assigné à cette évaluation",
      });
    }

    const communicationId = rows[0].communication_id;

    // PHASE 5: lock simple
    try {
      const locked = await hasReportForProposition(communicationId);
      if (locked) {
        return res.status(400).json({
          message:
            'Les évaluations ne peuvent plus être modifiées (rapport généré).',
        });
      }
    } catch (e) {
      console.error('Erreur check rapport:', e);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    // Soumettre l'évaluation
    const scores = {
      pertinence,
      qualite_scientifique,
      originalite,
      commentaire,
      decision,
    };

    submitEvaluation(evaluationId, scores, (err2) => {
      if (err2) {
        return res
          .status(500)
          .json({ message: 'Erreur lors de la soumission' });
      }

      // === NEW: Auto-update status and notify author ===
      let newStatus = null;
      let notifType = null;
      let notifMessage = null;

      if (decision === 'accepter') {
        newStatus = 'acceptee';
        notifType = 'submission_accepted';
        notifMessage = 'Félicitations ! Votre soumission a été acceptée par le comité scientifique.';
      } else if (decision === 'refuser') {
        newStatus = 'refusee';
        notifType = 'submission_refused';
        notifMessage = 'Votre soumission a été refusée par le comité scientifique.';
      } else if (decision === 'corriger') {
        newStatus = 'en_revision';
        notifType = 'submission_revision';
        notifMessage = 'Votre soumission nécessite des corrections. Veuillez consulter les recommandations du comité.';
      }

      if (newStatus) {
        // Fetch submission title and event name for better notification
        const sqlInfo = `
          SELECT c.titre, e.titre as evenement_nom, c.auteur_id 
          FROM communication c
          JOIN evenement e ON c.evenement_id = e.id
          WHERE c.id = ?
        `;
        db.query(sqlInfo, [communicationId], (errInfo, infoRows) => {
          if (!errInfo && infoRows.length > 0) {
            const { titre, evenement_nom, auteur_id: auteurId } = infoRows[0];
            const finalNotifMessage = `Your submission "${titre}" for "${evenement_nom}" has been ${newStatus}.`;

            // Update status
            setSubmissionStatus(communicationId, newStatus, userId, (errStatus) => {
              if (errStatus) console.error('Failed to auto-update status:', errStatus);
            });

            // Send notification
            createNotification(auteurId, null, notifType, finalNotifMessage)
              .catch(errNotif => console.error('Failed to send notification:', errNotif));
          }
        });
      }
      // ============================================

      res.status(200).json({
        message: 'Évaluation soumise avec succès',
        evaluationId,
        scores,
      });
    });
  });
};

// POST /api/evaluations/proposition/:propositionId/generate-report
// Générer le rapport final d'une proposition (après toutes les évaluations)
const generateReportController = (req, res) => {
  const { propositionId } = req.params;

  // Vérifier que la proposition existe
  const sqlComm = `
    SELECT id FROM communication WHERE id = ?
  `;

  db.query(sqlComm, [propositionId], (err, commRows) => {
    if (err) {
      console.error('Erreur vérif proposition:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (commRows.length === 0) {
      return res.status(404).json({ message: 'Proposition non trouvée' });
    }

    // Générer le rapport
    generateReport(propositionId, (err2, rapport) => {
      if (err2) {
        console.error('Erreur generateReport:', err2);
        return res.status(500).json({ message: 'Erreur génération rapport' });
      }

      if (!rapport) {
        return res.status(400).json({
          message:
            "Pas assez d'évaluations complètes pour générer le rapport",
        });
      }

      res.status(201).json({
        message: 'Rapport généré avec succès',
        propositionId,
        rapport,
      });
    });
  });
};

// PHASE 5: list evaluations with pagination
const listEvaluations = (req, res) => {
  const { page = 1, limit = 10, eventId, search } = req.query;

  listEvaluationsModel(
    {
      page: Number(page),
      limit: Number(limit),
      eventId: eventId ? Number(eventId) : null,
      search: search || null,
    },
    (err, data) => {
      if (err) {
        console.error('Erreur listEvaluations:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(data);
    }
  );
};

// PHASE 5: list reports with pagination
const listReports = (req, res) => {
  const { page = 1, limit = 10, eventId, search } = req.query;

  listReportsModel(
    {
      page: Number(page),
      limit: Number(limit),
      eventId: eventId ? Number(eventId) : null,
      search: search || null,
    },
    (err, data) => {
      if (err) {
        console.error('Erreur listReports:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json(data);
    }
  );
};



// PHASE 5: Get assignments for logged-in committee member
const getMyAssignments = (req, res) => {
  const userId = req.user.id;

  // Need to import this function at the top or use require inside (but top is better)
  // assuming I update imports in next step or use require inline if needed, but clean is better
  // Let's use the one imported at top (I need to update top imports)

  require('../models/evaluation.model').getAssignmentsByUser(userId, (err, rows) => {
    if (err) {
      console.error('Erreur getMyAssignments:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(rows);
  });
};

// NEW: Get all submissions for events where this user is a committee member
const getCommitteeSubmissions = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  console.log(`--- getCommitteeSubmissions called for user: ${userId} (${userRole}) ---`);
  console.log('--- Authorization Header:', req.headers.authorization);

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
      console.error('Error fetching committee submissions:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    console.log('--- Found submissions:', rows.length);
    const results = rows.map(r => ({
      ...r,
      auteur_principal: `${r.auteur_principal_prenom || ''} ${r.auteur_principal_nom || ''}`.trim() || 'Inconnu'
    }));
    res.json(results);
  });
};

// NEW: Start/Initialize an evaluation
const startEvaluationController = (req, res) => {
  const { communicationId } = req.body;
  const userId = req.user.id;

  if (!communicationId) return res.status(400).json({ message: "Communication ID required" });

  const sqlComm = "SELECT evenement_id FROM communication WHERE id = ?";
  db.query(sqlComm, [communicationId], (err, commRows) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (commRows.length === 0) return res.status(404).json({ message: "Communication not found" });
    const eventId = commRows[0].evenement_id;

    const sqlMembre = `
      SELECT mc.id 
      FROM membre_comite mc
      JOIN comite_scientifique cs ON mc.comite_id = cs.id
      WHERE cs.evenement_id = ? AND mc.utilisateur_id = ?
    `;
    db.query(sqlMembre, [eventId, userId], (err2, membreRows) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      if (membreRows.length === 0) return res.status(403).json({ message: "You are not a committee member for this event" });
      const membreComiteId = membreRows[0].id;

      const sqlCheck = "SELECT id FROM evaluation WHERE communication_id = ? AND membre_comite_id = ?";
      db.query(sqlCheck, [communicationId, membreComiteId], (err3, evalRows) => {
        if (err3) return res.status(500).json({ message: "Server error" });
        if (evalRows.length > 0) return res.json({ evaluationId: evalRows[0].id });

        const sqlInsert = "INSERT INTO evaluation (communication_id, membre_comite_id) VALUES (?, ?)";
        db.query(sqlInsert, [communicationId, membreComiteId], (err4, result) => {
          if (err4) return res.status(500).json({ message: "Error creating evaluation entry" });
          res.status(201).json({ evaluationId: result.insertId });
        });
      });
    });
  });
};

module.exports = {
  assignManually,
  getEvaluationFormController,
  submitEvaluationController,
  generateReportController,
  listEvaluations,
  listReports,
  getMyAssignments,
  getCommitteeSubmissions,
  startEvaluationController,
};
