// controllers/workshopSupport.controller.js
const fs = require('fs');
const path = require('path');

const { getWorkshopById } = require('../models/workshop.model');
const {
  addSupport,
  listSupports,
  getSupportById,
  deleteSupport,
} = require('../models/workshopSupport.model');

const ALLOWED_TYPES = ['pdf', 'ppt', 'doc', 'zip', 'file', 'link', 'video'];

const canManageSupports = (reqUser, workshop) => {
  if (!reqUser) return false;
  if (reqUser.role === 'SUPER_ADMIN' || reqUser.role === 'ORGANISATEUR') return true;
  if (reqUser.role === 'RESP_WORKSHOP' && Number(reqUser.id) === Number(workshop.responsable_id)) return true;
  return false;
};

// GET /api/events/workshops/:workshopId/supports
const listSupportsController = (req, res) => {
  const workshopId = parseInt(req.params.workshopId, 10);

  listSupports(workshopId, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    return res.status(200).json(rows);
  });
};

// POST /api/events/workshops/:workshopId/supports
const addSupportController = (req, res) => {
  const workshopId = parseInt(req.params.workshopId, 10);
  const { type, url, titre } = req.body;

  if (type && !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ message: "type invalide (pdf/ppt/doc/zip/link/video/file)" });
  }

  getWorkshopById(workshopId, (err, workshop) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    if (!workshop) return res.status(404).json({ message: 'Workshop introuvable' });

    if (!canManageSupports(req.user, workshop)) {
      return res.status(403).json({ message: 'Accès refusé (pas responsable du workshop)' });
    }

    // Generic File Upload
    const isFileType = ['pdf', 'ppt', 'doc', 'zip', 'file'].includes(type);
    if (req.file) {
      const storedPath = path.join('uploads', 'workshop_supports', req.file.filename).replace(/\\/g, '/');
      const finalType = type || path.extname(req.file.filename).slice(1) || 'file';

      return addSupport(workshopId, { type: finalType, url: storedPath, titre: titre || req.file.originalname }, (err2, supportId) => {
        if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });

        // Send notifications to all workshop participants
        const { listWorkshopRegistrations } = require('../models/workshopRegistration.model');
        const { createNotification } = require('../models/notification.model');

        listWorkshopRegistrations(workshopId, (err3, participants) => {
          if (!err3 && participants && participants.length > 0) {
            const resourceTitle = titre || req.file.originalname;
            participants.forEach(p => {
              createNotification(
                p.participant_id,
                workshop.evenement_id,
                'resource_uploaded',
                `Nouveau document disponible: ${resourceTitle}`
              ).catch(nErr => console.error("Notification resource upload error:", nErr));
            });
          }
        });

        return res.status(201).json({ message: 'Fichier ajouté', supportId, url: storedPath });
      });
    }

    // Link / Video
    if (type === 'link' || type === 'video') {
      if (!url) {
        return res.status(400).json({ message: 'url requis pour link/video' });
      }
      if (!/^https?:\/\/.+/i.test(url)) {
        return res.status(400).json({ message: 'url invalide (http/https requis)' });
      }

      return addSupport(workshopId, { type, url, titre }, (err2, supportId) => {
        if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
        return res.status(201).json({ message: 'Lien ajouté', supportId });
      });
    }

    return res.status(400).json({ message: "Requête invalide: fichier ou lien manquant" });
  });
};

// DELETE /api/events/workshops/supports/:supportId
const deleteSupportController = (req, res) => {
  const supportId = parseInt(req.params.supportId, 10);

  getSupportById(supportId, (err, support) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    if (!support) return res.status(404).json({ message: 'Support introuvable' });

    getWorkshopById(support.workshop_id, (err2, workshop) => {
      if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
      if (!workshop) return res.status(404).json({ message: 'Workshop introuvable' });

      if (!canManageSupports(req.user, workshop)) {
        return res.status(403).json({ message: 'Accès refusé (pas responsable du workshop)' });
      }

      deleteSupport(supportId, (err3, affectedRows) => {
        if (err3) return res.status(500).json({ message: 'Erreur serveur', error: err3.message });
        if (!affectedRows) return res.status(400).json({ message: 'Suppression échouée' });

        // best-effort: supprimer le fichier si c'est un PDF local
        if (support.type === 'pdf' && support.url && support.url.startsWith('uploads/workshop_supports/')) {
          const abs = path.join(process.cwd(), support.url);
          fs.unlink(abs, () => { });
        }

        return res.status(200).json({ message: 'Support supprimé' });
      });
    });
  });
};

module.exports = {
  listSupportsController,
  addSupportController,
  deleteSupportController,
};
