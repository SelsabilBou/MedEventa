// routes/evaluation.routes.js
const express = require('express');
const router = express.Router();

console.log('--- evaluation.routes.js loaded ---');

const {
  assignManually,
  getEvaluationFormController,
  submitEvaluationController,
  generateReportController,
  getCommitteeSubmissions,
  startEvaluationController,
} = require('../controllers/evaluation.controller');

const {
  assignManualValidation,
  submitEvaluationValidation,
} = require('../validators/evaluation.validators');

const { verifyToken } = require('../middlewares/auth.middlewares');
const { requirePermission } = require('../middlewares/permissions');

// TEST PING
router.get('/ping', (req, res) => res.json({ message: 'Evaluation router is alive' }));

// POST /api/evaluations/event/:eventId/assign-manual
router.post(
  '/event/:eventId/assign-manual',
  verifyToken,
  requirePermission('manage_evaluations'),
  assignManualValidation,
  assignManually
);

// GET /api/evaluations/committee/all-submissions
router.get(
  '/committee/all-submissions',
  verifyToken,
  requirePermission('evaluate_communications'),
  getCommitteeSubmissions
);

// GET /api/evaluations/my-assignments
router.get(
  '/my-assignments',
  verifyToken,
  requirePermission('evaluate_communications'), // Committee members have this permission
  require('../controllers/evaluation.controller').getMyAssignments
);

// POST /api/evaluations/start-evaluation
router.post(
  '/start-evaluation',
  verifyToken,
  requirePermission('evaluate_communications'),
  startEvaluationController
);

// GET /api/evaluations/evaluation/:evaluationId/form (Phase 2)
router.get(
  '/evaluation/:evaluationId/form',
  verifyToken,
  requirePermission('evaluate_communications'),
  getEvaluationFormController
);

// POST /api/evaluations/evaluation/:evaluationId/submit (Phase 2)
router.post(
  '/evaluation/:evaluationId/submit',
  verifyToken,
  requirePermission('evaluate_communications'),
  submitEvaluationValidation,
  submitEvaluationController
);

// POST /api/evaluations/proposition/:propositionId/generate-report (Phase 4)
router.post(
  '/proposition/:propositionId/generate-report',
  verifyToken,
  requirePermission('manage_evaluations'),
  generateReportController
);

// PHASE 5 – simple pagination for organiser
// PHASE 5 – simple pagination for organiser
router.get(
  '/',
  verifyToken,
  requirePermission('manage_evaluations'),
  require('../controllers/evaluation.controller').listEvaluations
);

router.get(
  '/rapports',
  verifyToken,
  requirePermission('manage_evaluations'),
  require('../controllers/evaluation.controller').listReports
);

module.exports = router;
