// routes/stats.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middlewares');
const { requirePermission } = require('../middlewares/permissions');

const { validateEventIdParam } = require('../validators/stats.validators');
const { getEventStats, getGlobalStats } = require('../controllers/stats.controller');

// GET /api/events/:eventId/stats
router.get(
  '/:eventId/stats',
  verifyToken,
  requirePermission('view_stats'),
  validateEventIdParam,
  getEventStats
);

// GET /api/events/global/overview
router.get(
  '/global/overview',
  verifyToken,
  requirePermission('view_stats'),
  getGlobalStats
);

module.exports = router;
