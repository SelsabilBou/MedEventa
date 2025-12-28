const { body } = require('express-validator');

const sendMessageValidation = [
  body('contenu').notEmpty().withMessage('Le message ne peut pas être vide'),
  body('destinataire_id').isInt().withMessage('ID destinataire requis'),
  body('evenement_id').optional().isInt(),
  body('type').optional().isIn(['notif','reponse','modif_prog'])
];

module.exports = { sendMessageValidation };
