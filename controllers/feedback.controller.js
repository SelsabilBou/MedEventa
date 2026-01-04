const { createFeedback, getFeedbackByEvent } = require('../models/feedback.model');//notation et commantaires pour que user donner leur avis apres avoir assiste a un evenement

const submitFeedbackController = (req, res) => {//soumettre un ffedback
    const eventId = req.params.eventId;
    const userId = req.user ? req.user.id : null; // Optional if feedback can be anonymous, but usually auth required
    const { rating, comment } = req.body;

    if (!rating) {
        return res.status(400).json({ message: 'Rating is required' });//erreur
    }

    createFeedback(eventId, userId, rating, comment, (err, id) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving feedback' });//erreur
        }
        res.status(201).json({ message: 'Feedback submitted', id });//ok
    });
};

const getFeedbackController = (req, res) => {
    const eventId = req.params.eventId;
    getFeedbackByEvent(eventId, (err, feedback) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching feedback' });
        }
        res.status(200).json(feedback);
    });
};

module.exports = { submitFeedbackController, getFeedbackController };
