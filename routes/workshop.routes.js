// routes/workshop.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');

const workshopController = require('../controllers/workshop.controller');
const workshopRegistrationController = require('../controllers/workshopRegistration.controller');

const {
  createWorkshopValidator,
  updateWorkshopValidator,
} = require('../validators/workshop.validators');

// ===== Phase 1: CRUD workshops =====

// GET /api/events/:eventId/workshops
router.get('/:eventId/workshops', workshopController.listWorkshops);

// GET /api/events/workshops/:workshopId
router.get('/workshops/:workshopId', workshopController.getWorkshopController);

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

// ===== Phase 2: inscriptions spécifiques workshops =====

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

module.exports = router;
