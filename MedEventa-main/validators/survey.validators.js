// validators/survey.validators.js
const { body } = require('express-validator');

const createSurveyValidation = [
  // Accept both 'title' and 'titre' (frontend uses 'titre')
  body('title')
    .optional()
    .isLength({ max: 255 }).withMessage('Titre trop long'),
  body('titre')
    .optional()
    .isLength({ max: 255 }).withMessage('Titre trop long'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description trop longue'),
  body('questions')
    .isArray({ min: 1 }).withMessage('Questions doit être un tableau non vide'),
  body('questions.*.question')
    .notEmpty().withMessage('Le texte de la question est obligatoire')
    .isString().withMessage('Le texte de la question doit être une chaîne'),
  body('questions.*.type')
    .optional()
    .isIn(['text', 'rating', 'yesno', 'multiple']).withMessage('Type de question invalide'),
  // Custom validation to ensure at least one title field is provided
  body().custom((value, { req }) => {
    if (!req.body.title && !req.body.titre) {
      throw new Error('Titre obligatoire (title ou titre)');
    }
    return true;
  }),
];

const submitResponseValidation = [
  body('responses')
    .isArray({ min: 1 }).withMessage('Responses doit être un tableau non vide'),
  body('responses.*.questionId')
    .isInt().withMessage('questionId doit être un entier'),
  body('responses.*.answer')
    .notEmpty().withMessage('Réponse obligatoire'),
];

module.exports = {
  createSurveyValidation,
  submitResponseValidation,
};
