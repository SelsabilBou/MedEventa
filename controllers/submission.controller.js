// controllers/submission.controller.js
const fs = require('fs');
const path = require('path');

const {
  createSubmission,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} = require('../models/submission.model');

const { isSubmissionOpen } = require('../models/event.model');

// Petit helper: suppression best-effort
const safeUnlink = (filePath) => {
  if (!filePath) return;
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  fs.unlink(abs, () => {});
};

// CREATE
const createSubmissionController = (req, res) => {
  const { eventId } = req.params;
  const { titre, resume, type } = req.body;

  if (!titre || !resume || !type) {
    return res.status(400).json({ message: 'Champs requis: titre, resume, type' });
  }

  // En CREATE: PDF obligatoire
  if (!req.file) {
    return res.status(400).json({ message: 'Fichier PDF requis (champ: resumePdf)' });
  }

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

    const data = {
      titre,
      resume,
      type,
      fichier_pdf: req.file.path,
      evenement_id: Number(eventId),
      auteur_id: req.user.id,
    };

    createSubmission(data, (err2, submissionId) => {
      if (err2) {
        console.error('DB error createSubmission:', err2);

        // Si DB échoue, on peut supprimer le fichier uploadé (best-effort)
        safeUnlink(req.file?.path);

        return res.status(500).json({ message: 'Erreur serveur' });
      }

      return res.status(201).json({
        message: 'Soumission créée avec succès',
        submissionId,
      });
    });
  });
};

// UPDATE (PUT /submissions/:submissionId)
const updateSubmissionController = (req, res) => {
  const { submissionId } = req.params;
  const { titre, resume, type } = req.body;

  getSubmissionById(Number(submissionId), (err, submission) => {
    if (err) {
      console.error('DB error getSubmissionById:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!submission) {
      // si on a uploadé un fichier mais l'id n'existe pas -> nettoyer
      safeUnlink(req.file?.path);
      return res.status(404).json({ message: 'Soumission introuvable' });
    }

    // Autorisation
    const isOwner = submission.auteur_id === req.user.id;
    const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ORGANISATEUR';
    if (!isOwner && !isAdmin) {
      safeUnlink(req.file?.path);
      return res.status(403).json({ message: 'Accès interdit (pas propriétaire)' });
    }

    // Deadline
    isSubmissionOpen(Number(submission.evenement_id), (err2, check) => {
      if (err2) {
        console.error('DB error isSubmissionOpen:', err2);
        safeUnlink(req.file?.path);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      if (!check.ok && check.reason === 'DEADLINE_PASSED') {
        safeUnlink(req.file?.path);
        return res.status(403).json({
          message: 'Modifications interdites (date limite dépassée)',
          deadline: check.deadline,
        });
      }

      // Construire un update PARTIEL: on ne met pas null par défaut
      const newData = {};
      if (titre !== undefined) newData.titre = titre;
      if (resume !== undefined) newData.resume = resume;
      if (type !== undefined) newData.type = type;

      // PDF optionnel: on ne modifie fichier_pdf que si un fichier est envoyé
      let oldFileToDelete = null;
      if (req.file) {
        newData.fichier_pdf = req.file.path;
        oldFileToDelete = submission.fichier_pdf;
      }

      if (Object.keys(newData).length === 0) {
        return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
      }

      updateSubmission(Number(submissionId), newData, (err3, affectedRows) => {
        if (err3) {
          console.error('DB error updateSubmission:', err3);

          // si on a uploadé un nouveau fichier et update DB échoue -> nettoyer ce nouveau fichier
          safeUnlink(req.file?.path);

          return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (!affectedRows) {
          safeUnlink(req.file?.path);
          return res.status(404).json({ message: 'Soumission introuvable' });
        }

        // Supprimer l’ancien PDF uniquement si remplacement réussi
        if (oldFileToDelete) safeUnlink(oldFileToDelete);

        return res.status(200).json({ message: 'Soumission mise à jour' });
      });
    });
  });
};

// DELETE (DELETE /submissions/:submissionId)
const deleteSubmissionController = (req, res) => {
  const { submissionId } = req.params;

  getSubmissionById(Number(submissionId), (err, submission) => {
    if (err) {
      console.error('DB error getSubmissionById:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!submission) {
      return res.status(404).json({ message: 'Soumission introuvable' });
    }

    const isOwner = submission.auteur_id === req.user.id;
    const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ORGANISATEUR';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès interdit (pas propriétaire)' });
    }

    isSubmissionOpen(Number(submission.evenement_id), (err2, check) => {
      if (err2) {
        console.error('DB error isSubmissionOpen:', err2);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      if (!check.ok && check.reason === 'DEADLINE_PASSED') {
        return res.status(403).json({
          message: 'Suppression interdite (date limite dépassée)',
          deadline: check.deadline,
        });
      }

      deleteSubmission(Number(submissionId), (err3, affectedRows) => {
        if (err3) {
          console.error('DB error deleteSubmission:', err3);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (!affectedRows) {
          return res.status(404).json({ message: 'Soumission introuvable' });
        }

        // best-effort: supprimer le pdf du disque
        safeUnlink(submission.fichier_pdf);

        return res.status(200).json({ message: 'Soumission supprimée' });
      });
    });
  });
};

module.exports = {
  createSubmissionController,
  updateSubmissionController,
  deleteSubmissionController,
};
