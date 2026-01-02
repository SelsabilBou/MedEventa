// validators/inscription.validators.js
const { body } = require('express-validator');

const baseInscriptionValidation = [
  body('profil')
    .notEmpty().withMessage('Le profil est requis')
    .isIn(['PARTICIPANT', 'COMMUNICANT', 'INVITE'])
    .withMessage('Profil invalide'),
];

const participantValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
];

const communicantValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('titre_communication')
    .notEmpty()
    .withMessage('Le titre de la communication est requis'),
];

const inviteValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('prenom').notEmpty().withMessage('Le prénom est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('statut')
    .notEmpty().withMessage('Le statut est requis')
    .isIn(['vip', 'media'])
    .withMessage('Statut invalide'),
];

const inscriptionValidationByProfile = (profil) => {
  const p = profil ? profil.toUpperCase() : '';
  switch (p) {
    case 'PARTICIPANT':
      return [...baseInscriptionValidation, ...participantValidation];
    case 'COMMUNICANT':
      return [...baseInscriptionValidation, ...communicantValidation];
    case 'INVITE':
      return [...baseInscriptionValidation, ...inviteValidation];
    default:
      return baseInscriptionValidation;
  }
};

module.exports = {
  inscriptionValidationByProfile,
};
