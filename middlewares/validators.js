// middlewares/validators.js
const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('nom').notEmpty().withMessage('Nom obligatoire'),
  body('prenom').notEmpty().withMessage('Prénom obligatoire'),
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('mot_de_passe')
    .isLength({ min: 8 }).withMessage('Mot de passe min 8 caractères')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/[a-z]/).withMessage('Au moins une minuscule')
    .matches(/[0-9]/).withMessage('Au moins un chiffre'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { registerValidation, validate };
