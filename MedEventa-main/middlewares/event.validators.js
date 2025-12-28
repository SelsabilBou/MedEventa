// Pour valider les données d'entrée (ex. : titre obligatoire, dates valides) en utilisant express-validator
// middlewares/event.validators.js
const { body, validationResult } = require('express-validator');

const createEventValidation = [
  body('titre').notEmpty().withMessage('Titre obligatoire'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description trop longue (max 1000 caractères)'),
  body('date_debut').isISO8601().withMessage('Date de début invalide (format ISO requis)'),
  body('date_fin').isISO8601().withMessage('Date de fin invalide (format ISO requis)'),
  body('lieu').notEmpty().withMessage('Lieu obligatoire'),
  body('thematique').optional(),
  body('contact').optional().isEmail().withMessage('Contact doit être un email valide'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { createEventValidation, validate };