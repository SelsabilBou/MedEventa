// routes/workshop.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken, requirePermission } = require('../middlewares/auth.middlewares');

const workshopController = require('../controllers/workshop.controller');
const workshopRegistrationController = require('../controllers/workshopRegistration.controller');

const {
  createWorkshopValidator,
  updateWorkshopValidator,
} = require('../validators/workshop.validators');

const multer = require('multer');
const { uploadWorkshopSupport } = require('../middlewares/uploadWorkshopSupport');
const workshopSupportController = require('../controllers/workshopSupport.controller');

// =======================
// Phase 4: CONSULTATION
// =======================

// GET /api/events/my-workshops
router.get(
  '/my-workshops',
  verifyToken,
  // requirePermission('view_workshops'), // or create specific permission or allow all valid users if role check inside controller?
  // Controller checks if user is authenticated. Let's rely on that or add basic permission if needed.
  // For 'RESP_WORKSHOP', they should have access.
  workshopController.listMyWorkshops
);

// GET /api/events/:eventId/workshops
// Public endpoint - all authenticated users can view workshops
router.get(
  '/:eventId/workshops',
  verifyToken,
  workshopController.listWorkshops
);

// GET /api/events/workshops/:workshopId
// Public endpoint - all authenticated users can view workshop details
router.get(
  '/workshops/:workshopId',
  verifyToken,
  workshopController.getWorkshopController
);

// GET /api/events/workshops/:workshopId/stats
router.get(
  '/workshops/:workshopId/stats',
  verifyToken,
  requirePermission('view_workshops'),
  workshopController.getWorkshopStats
);

// =======================
// Phase 4: CRUD WORKSHOP
// =======================

// POST /api/events/:eventId/workshops
router.post(
  '/:eventId/workshops',
  verifyToken,
  requirePermission('create_workshop'),
  createWorkshopValidator,
  workshopController.createWorkshopController
);

// PUT /api/events/workshops/:workshopId
router.put(
  '/workshops/:workshopId',
  verifyToken,
  requirePermission('edit_workshop'),
  updateWorkshopValidator,
  workshopController.updateWorkshopController
);

// DELETE /api/events/workshops/:workshopId
router.delete(
  '/workshops/:workshopId',
  verifyToken,
  requirePermission('delete_workshop'),
  workshopController.deleteWorkshopController
);

// =====================================
// Phase 2/4: INSCRIPTIONS WORKSHOPS
// =====================================

// POST /api/events/workshops/:workshopId/register
router.post(
  '/workshops/:workshopId/register',
  verifyToken,
  requirePermission('register_workshop'),
  workshopRegistrationController.registerWorkshopController
);

// DELETE /api/events/workshops/:workshopId/register
router.delete(
  '/workshops/:workshopId/register',
  verifyToken,
  requirePermission('register_workshop'),
  workshopRegistrationController.unregisterWorkshopController
);

// GET /api/events/workshops/:workshopId/registrations
router.get(
  '/workshops/:workshopId/registrations',
  verifyToken,
  requirePermission('manage_workshop_inscriptions'),
  workshopRegistrationController.listRegistrationsController
);

// DELETE /api/events/workshops/:workshopId/participants/:participantId
router.delete(
  '/workshops/:workshopId/participants/:participantId',
  verifyToken,
  requirePermission('manage_workshop_inscriptions'),
  workshopRegistrationController.removeParticipant
);

// PUT /api/events/workshops/registrations/:inscriptionId/presence
router.put(
  '/workshops/registrations/:inscriptionId/presence',
  verifyToken,
  requirePermission('manage_workshop_inscriptions'),
  workshopRegistrationController.updatePresenceController
);

// PUT /api/events/workshops/registrations/:inscriptionId/confirmation
router.put(
  '/workshops/registrations/:inscriptionId/confirmation',
  verifyToken,
  requirePermission('manage_workshop_inscriptions'),
  workshopRegistrationController.updateConfirmationController
);



// =======================
// Phase 3/4: SUPPORTS
// =======================

// GET /api/events/workshops/:workshopId/supports
// Public endpoint - all authenticated users can view workshop supports
router.get(
  '/workshops/:workshopId/supports',
  verifyToken,
  workshopSupportController.listSupportsController
);

// POST /api/events/workshops/:workshopId/supports
router.post(
  '/workshops/:workshopId/supports',
  verifyToken,
  requirePermission('manage_workshop_supports'),
  uploadWorkshopSupport.single('file'),
  workshopSupportController.addSupportController
);

// DELETE /api/events/workshops/supports/:supportId
router.delete(
  '/workshops/supports/:supportId',
  verifyToken,
  requirePermission('manage_workshop_supports'),
  workshopSupportController.deleteSupportController
);

// Handler erreurs upload (multer)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop grand (max 20MB)' });
    }
    return res.status(400).json({ message: 'Erreur upload', detail: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Erreur upload' });
  }
  next();
});

module.exports = router;
