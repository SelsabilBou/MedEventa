// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { registerValidation, validate } = require('../middlewares/validators');
const { verifyToken } = require('../middlewares/auth.middlewares'); // ✅ زيدها

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ✅ NEW: profil user connecté
router.get('/me', verifyToken, authController.getMe);
router.patch('/me', verifyToken, authController.updateMe);

module.exports = router;
