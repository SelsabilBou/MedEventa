// validators/attestation.validators.js
const { body, query, param } = require('express-validator');

const ALLOWED_TYPES = ['participant', 'communicant', 'membre_comite', 'organisateur'];

const validateGenerateMyAttestation = [
  body('evenementId')
    .isInt({ min: 1 }).withMessage('evenementId doit être un entier positif'),
  body('type')
    .isIn(ALLOWED_TYPES).withMessage('type invalide'),
];

const validateGenerateAttestationForUser = [
  body('evenementId')
    .isInt({ min: 1 }).withMessage('evenementId doit être un entier positif'),
  body('type')
    .isIn(ALLOWED_TYPES).withMessage('type invalide'),
  body('utilisateurId')
    .optional()
    .isInt({ min: 1 }).withMessage('utilisateurId doit être un entier positif'),
];

const validateListEventAttestations = [
  param('evenementId')
    .isInt({ min: 1 }).withMessage('evenementId doit être un entier positif'),
];

const validateDownloadMyAttestation = [
  query('evenementId')
    .isInt({ min: 1 }).withMessage('evenementId doit être un entier positif'),
  query('type')
    .isIn(ALLOWED_TYPES).withMessage('type invalide'),
];

module.exports = {
  validateGenerateMyAttestation,
  validateGenerateAttestationForUser,
  validateListEventAttestations,
  validateDownloadMyAttestation,
  ALLOWED_TYPES
};
