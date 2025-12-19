// controllers/submission.controller.js
const { createSubmission } = require('../models/submission.model');
const { isSubmissionOpen } = require('../models/event.model'); // ✅ NEW

const createSubmissionController = (req, res) => {
  const { eventId } = req.params;
  const { titre, resume, type } = req.body;

  // DEBUG (temporaire)
  console.log('Content-Type:', req.headers['content-type']);
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  console.log('req.files:', req.files);

  // 1) Vérifier que le PDF est bien envoyé
  if (!req.file) {
    return res
      .status(400)
      .json({ message: 'Fichier PDF requis (champ: fichier_pdf)' });
  }

  // ✅ 2) Vérifier deadline / ouverture des soumissions
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

    // 3) Construire l'objet data pour le model
    const data = {
      titre,
      resume,
      type,
      fichier_pdf: req.file.path,
      auteur_id: req.user.id,
      evenement_id: Number(eventId),
    };

    // 4) Appeler le model
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
