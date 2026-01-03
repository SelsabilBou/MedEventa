const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middlewares');
const { submitFeedbackController, getFeedbackController } = require('../controllers/feedback.controller');

// Submit feedback for an event
router.post('/events/:eventId/feedback', verifyToken, submitFeedbackController);

// Get all feedback for an event (organizer only usually, but let's keep it simple for now)
router.get('/events/:eventId/feedback', verifyToken, getFeedbackController);

module.exports = router;
