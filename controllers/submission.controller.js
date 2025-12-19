// controllers/submission.controller.js
const { createSubmission } = require('../models/submission.model');
const { isSubmissionOpen } = require('../models/event.model');

const createSubmissionController = (req, res) => {
  const { eventId } = req.params;
  const { titre, resume, type } = req.body;

  // 1) validations simples
  if (!titre || !resume || !type) {
    return res.status(400).json({ message: 'Champs requis: titre, resume, type' });
  }

  // 2) vérifier fichier (champ = resumePdf car route: upload.single('resumePdf'))
  if (!req.file) {
    return res.status(400).json({ message: 'Fichier PDF requis (champ: resumePdf)' });
  }

  // 3) vérifier deadline / ouverture des soumissions
  isSubmissionOpen(Number(eventId), (err, check) => {
    if (err) {
      console.error('DB error isSubmissionOpen:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (!check.ok) {
      if (check.reason === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Événement introuvable' });
      }
      if (check.reason === 'DEADLINE_PASSED') {
        return res.status(403).json({
          message: 'Les soumissions sont fermées (date limite dépassée)',
          deadline: check.deadline,
        });
      }
      return res.status(403).json({ message: 'Soumission non autorisée' });
    }

    // ✅ 4) lier à l’auteur principal via JWT
    const data = {
      titre,
      resume,
      type,
      fichier_pdf: req.file.path,
      evenement_id: Number(eventId),
      id_auteur_principal: req.user.id
    };

    createSubmission(data, (err2, submissionId) => {
      if (err2) {
        console.error('DB error createSubmission:', err2);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      return res.status(201).json({
        message: 'Soumission créée avec succès',
        submissionId,
      });
    });
  });
};

module.exports = { createSubmissionController };
