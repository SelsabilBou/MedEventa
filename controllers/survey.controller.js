// controllers/survey.controller.js
const { validationResult } = require('express-validator');
const db = require('../db');
const { createSurvey, submitResponse, getSurveyResults, getSurveysByEvent } = require('../models/survey.model');

const checkEventOrganizer = (eventId, userId, callback) => {
  const sql = `
    SELECT id
    FROM evenement
    WHERE id = ?
      AND id_organisateur = ?
  `;
  db.query(sql, [eventId, userId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, false);
    callback(null, true);
  });
};

const createSurveyController = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const eventId = parseInt(req.params.eventId, 10);
  const userId = req.user.id;

  // Accept both 'titre' (from frontend) and 'title'
  const title = req.body.titre || req.body.title;
  const description = req.body.description;

  // Convert question objects [{question: "...", type: "..."}] to simple strings
  const questions = req.body.questions.map(q => {
    // If it's already a string, use it as is
    if (typeof q === 'string') return q;
    // If it's an object, extract the question text
    return q.question || q;
  });

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'eventId invalide' });
  }

  checkEventOrganizer(eventId, userId, (checkErr, isOrganizer) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: 'Erreur serveur (vérification organisateur)' });
    }

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Vous n’êtes pas l’organisateur de cet événement' });
    }

    createSurvey(eventId, { title, description, questions }, (createErr, result) => {
      if (createErr) {
        console.error(createErr);
        return res.status(500).json({ message: 'Erreur lors de la création du sondage' });
      }

      return res.status(201).json({
        message: 'Sondage créé avec succès',
        eventId,
        surveyId: result.surveyId,
      });
    });
  });
};

const submitResponseController = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const surveyId = parseInt(req.params.surveyId, 10);
  const userId = req.user.id;
  const { responses } = req.body;

  if (isNaN(surveyId)) {
    return res.status(400).json({ message: 'surveyId invalide' });
  }

  submitResponse(surveyId, userId, responses, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de l’enregistrement des réponses' });
    }

    return res.status(201).json({
      message: 'Réponses enregistrées avec succès',
      surveyId,
    });
  });
};
const getSurveyResultsController = (req, res) => {
  const surveyId = parseInt(req.params.surveyId, 10);

  if (isNaN(surveyId)) {
    return res.status(400).json({ message: 'surveyId invalide' });
  }

  getSurveyResults(surveyId, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des résultats' });
    }

    // Regrouper par question
    const questionsMap = {};
    rows.forEach((row) => {
      if (!questionsMap[row.questionId]) {
        questionsMap[row.questionId] = {
          questionId: row.questionId,
          questionText: row.questionText,
          responses: [],
        };
      }
      if (row.answer) {
        questionsMap[row.questionId].responses.push({
          userId: row.userId,
          userName: row.userName,
          answer: row.answer,
        });
      }
    });

    const questions = Object.values(questionsMap);

    return res.status(200).json({
      surveyId,
      questions,
    });
  });
}

// GET /api/events/:eventId/surveys - List all surveys for an event
const getSurveysByEventController = (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ message: 'eventId invalide' });
  }

  getSurveysByEvent(eventId, (err, surveys) => {
    if (err) {
      console.error('Error fetching surveys:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des sondages' });
    }

    return res.status(200).json(surveys || []);
  });
};

module.exports = {
  createSurveyController,
  submitResponseController,
  getSurveyResultsController,
  getSurveysByEventController,
};
