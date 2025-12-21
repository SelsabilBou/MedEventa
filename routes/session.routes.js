const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');  // ✅ CORRIGÉ
const { requirePermission } = require('../middleware/permissions');  // ✅ CORRIGÉ
const { createSessionValidation } = require('../validators/session.validators');
const { createSessionController } = require('../controllers/session.controller');

router.post(
  '/events/:eventId/sessions/create',
  verifyToken,
  requirePermission('manage_program'),
  createSessionValidation,
  createSessionController
);

module.exports = router;
