const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { registerValidation, validate } = require('../middlewares/validators');

router.post('/register', registerValidation, validate, authController.register);


// POST login
router.post('/login', authController.login);
//forget passwd
router.post('/forgot-password',authController.forgotPassword);
//reset passwd
router.post('/reset-password',authController.resetPassword);

module.exports = router;
