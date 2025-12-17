// controllers/submission.controller.js
const { createSubmission } = require('../models/submission.model');

const createSubmissionController = (req, res) => {
  const { eventId } = req.params;
  const { titre, resume, type } = req.body;

  // DEBUG (temporaire) : pour comprendre pourquoi req.file est vide
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

  // 2) Construire l'objet data pour le model
  const data = {
    titre,
    resume,
    type,
    fichier_pdf: req.file.path, // chemin sauvegardé par multer
    auteur_id: req.user.id,     // vient de verifyToken
    evenement_id: Number(eventId),
  };

  // 3) Appeler le model
  createSubmission(data, (err, submissionId) => {
    if (err) {
      console.error('DB error createSubmission:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    return res.status(201).json({
      message: 'Soumission créée avec succès',
      submissionId,
    });
  });
};

module.exports = { createSubmissionController };
