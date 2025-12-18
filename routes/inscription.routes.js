// routes/inscription.routes.js
const express = require('express');
const router = express.Router();

const { register, validateInscription ,
  getPaymentStatusController,
  updatePaymentStatusController,} = require('../controllers/inscription.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permissions');

// POST /api/inscriptions/register/:eventId
router.post(
  '/register/:eventId',
  verifyToken,
  requirePermission('register_event'),
  validateInscription,
  register
);
// GET /api/inscriptions/:inscriptionId/payment-status  (user connecté)
router.get(
  '/:inscriptionId/payment-status',
  verifyToken,
  getPaymentStatusController
);

// PUT /api/inscriptions/:inscriptionId/payment-status  (admin/orga ONLY)
router.put(
  '/:inscriptionId/payment-status',
  verifyToken,
  requirePermission('manage_inscriptions'), // ou autre permission pour ORGA
  updatePaymentStatusController
);
module.exports = router;
