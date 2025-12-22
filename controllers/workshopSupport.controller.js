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

const ALLOWED_TYPES = ['pdf', 'link', 'video'];

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
// - type=pdf => multipart/form-data + champ file = "pdf"
// - type=link/video => JSON { type, url, titre }
const addSupportController = (req, res) => {
  const workshopId = parseInt(req.params.workshopId, 10);
  const { type, url, titre } = req.body;

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ message: "type invalide (pdf/link/video)" });
  }

  getWorkshopById(workshopId, (err, workshop) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    if (!workshop) return res.status(404).json({ message: 'Workshop introuvable' });

    if (!canManageSupports(req.user, workshop)) {
      return res.status(403).json({ message: 'Accès refusé (pas responsable du workshop)' });
    }

    // PDF
    if (type === 'pdf') {
      if (!req.file) {
        return res.status(400).json({ message: 'PDF requis (champ: pdf)' });
      }
      const storedPath = path.join('uploads', 'workshop_supports', req.file.filename).replace(/\\/g, '/');

      return addSupport(workshopId, { type, url: storedPath, titre }, (err2, supportId) => {
        if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
        return res.status(201).json({ message: 'Support ajouté', supportId, url: storedPath });
      });
    }

    // Link / Video
    if (!url) {
      return res.status(400).json({ message: 'url requis pour link/video' });
    }
    // validation URL simple (tu peux renforcer après)
    if (!/^https?:\/\/.+/i.test(url)) {
      return res.status(400).json({ message: 'url invalide (http/https requis)' });
    }

    return addSupport(workshopId, { type, url, titre }, (err2, supportId) => {
      if (err2) return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
      return res.status(201).json({ message: 'Support ajouté', supportId });
    });
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
          fs.unlink(abs, () => {});
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
