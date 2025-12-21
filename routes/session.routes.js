const express = require('express');
const router = express.Router();
const { createSessionValidation } = require('../validators/session.validators');
const { createSessionController } = require('../controllers/session.controller');

// POST /events/:eventId/sessions/create (SANS auth pour l'instant)
router.post(
  '/events/:eventId/sessions/create',
  createSessionValidation,
  createSessionController
);

module.exports = router;
