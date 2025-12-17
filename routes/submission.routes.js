// routes/submission.routes.js
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middleware');
const { uploadSubmissionPdf } = require('../middlewares/uploadPdf');
const { createSubmissionController } = require('../controllers/submission.controller');

// POST /api/events/:eventId/submissions
router.post(
  '/:eventId/submissions',
  verifyToken,
  uploadSubmissionPdf.single('fichier_pdf'),
  createSubmissionController
);

module.exports = router;
