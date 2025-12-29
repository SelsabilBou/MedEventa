// middlewares/submission.validators.js
const { body, validationResult } = require('express-validator');

const createSubmissionValidation = [
  body('titre')
    .trim()
    .notEmpty()
    .withMessage('Titre obligatoire'),

  body('resume')
    .trim()
    .notEmpty()
    .withMessage('Résumé obligatoire'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type obligatoire')
    .isIn(['orale', 'affiche', 'poster'])
    .withMessage("Type invalide (orale, affiche, poster)"),
];

// middleware: renvoie 400 si erreurs
const validateSubmission = (req, res, next) => {
  const errors = validationResult(req); // collecte les erreurs [web:56]
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) });
  }
  next();
};

module.exports = {
  createSubmissionValidation,
  validateSubmission,
};
