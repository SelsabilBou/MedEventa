// routes/submission.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { uploadSubmissionPdf } = require('../middlewares/uploadPdf');
const submissionController = require('../controllers/submission.controller');

// POST /api/events/:eventId/submissions
router.post(
  '/:eventId/submissions',
  verifyToken,
  requirePermission('create_submission'),
  uploadSubmissionPdf.single('resumePdf'),
  submissionController.createSubmissionController
);

module.exports = router;
