// routes/question.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middlewares');
const { submitQuestionValidation } = require('../validators/question.validators');
const { submitQuestionController } = require('../controllers/question.controller');

// Phase 1 : soumission de question par un participant
// POST /events/:eventId/questions/submit
router.post(
  '/events/:eventId/questions/submit',
  verifyToken,
  submitQuestionValidation,
  submitQuestionController
);

module.exports = router;
