// routes/survey.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middlewares');
const { requirePermission } = require('../middlewares/permissions');
const { createSurveyValidation, submitResponseValidation, } = require('../validators/survey.validators');
const { createSurveyController, submitResponseController, getSurveyResultsController, getSurveysByEventController } = require('../controllers/survey.controller');

// GET /api/events/:eventId/surveys - List all surveys for an event
router.get(
  '/events/:eventId/surveys',
  verifyToken,
  getSurveysByEventController
);

// POST /api/events/:eventId/surveys/create
router.post(
  '/events/:eventId/surveys/create',
  verifyToken,
  requirePermission('manage_event'),
  createSurveyValidation,
  createSurveyController
);

// POST /api/surveys/:surveyId/respond
router.post(
  '/surveys/:surveyId/respond',
  verifyToken,
  submitResponseValidation,
  submitResponseController
);
router.get(
  '/surveys/:surveyId/results',
  verifyToken,
  requirePermission('manage_event'),
  getSurveyResultsController
);
module.exports = router;
