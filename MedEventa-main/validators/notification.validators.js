const { body } = require('express-validator');

const testNotificationValidation = [
  body('utilisateur_id').isInt().withMessage('utilisateur_id requis'),
  body('evenement_id').optional().isInt(),
  body('type').notEmpty().withMessage('type requis'),
  body('message').notEmpty().withMessage('message requis'),
];

module.exports = { testNotificationValidation };
