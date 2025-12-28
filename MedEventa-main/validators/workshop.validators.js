// validators/workshop.validators.js
const { body, param } = require('express-validator');

const createWorkshopValidator = [
  param('eventId').isInt({ min: 1 }).withMessage('eventId invalide'),

  body('titre')
    .notEmpty()
    .withMessage('Le titre est obligatoire'),

  body('responsable_id')
    .isInt({ min: 1 })
    .withMessage('responsable_id invalide'),

  body('date')
    .isISO8601()
    .withMessage('La date doit être au format ISO8601'),

  body('nb_places')
    .isInt({ min: 1 })
    .withMessage('nb_places doit être un entier >= 1'),
];

const updateWorkshopValidator = [
  param('workshopId').isInt({ min: 1 }).withMessage('workshopId invalide'),

  body('titre').optional().notEmpty().withMessage('Le titre ne peut pas être vide'),

  body('responsable_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('responsable_id invalide'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('La date doit être au format ISO8601'),

  body('nb_places')
    .optional()
    .isInt({ min: 1 })
    .withMessage('nb_places doit être un entier >= 1'),
];

module.exports = {
  createWorkshopValidator,
  updateWorkshopValidator,
};
