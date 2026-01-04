<<<<<<< HEAD:routes/auth.routes.js
// auth.routes.js
const express = require('express');
=======
const express = require("express");
>>>>>>> 20af0652a2889cf611cf90939f7100f670ebea10:MedEventa-main/routes/auth.routes.js
const router = express.Router();
const authController = require("../controllers/auth.controller");

<<<<<<< HEAD:routes/auth.routes.js
const { registerValidation, validate } = require('../middlewares/validators');
const { verifyToken } = require('../middlewares/auth.middlewares'); // ✅ زيدها

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
=======
const { registerValidation, validate } = require("../middlewares/validators");
const {
  verifyToken,
  requirePermission,
} = require("../middlewares/auth.middlewares");

// POST register (with validation)
router.post("/register", registerValidation, validate, authController.register);

// POST login
router.post("/login", authController.login);

// POST social login
router.post("/social-login", authController.socialLogin);

// forgot password
router.post("/forgot-password", authController.forgotPassword);

// reset password
router.post("/reset-password", authController.resetPassword);

// verify email (signup steps)
router.post("/send-code", authController.sendVerificationCode);
router.post("/verify-code", authController.verifyVerificationCode);
// ✅ NEW: profil user connecté
router.get("/me", verifyToken, authController.getMe);
router.patch("/me", verifyToken, authController.updateMe);

// DELETE user (Super Admin only)
router.delete(
  "/users/:userId",
  verifyToken,
  requirePermission("delete_user"),
  authController.deleteUser
);

// ✅ NEW: Get users by roles (for dropdowns)
router.get("/users", verifyToken, authController.getUsersByRole);
>>>>>>> 20af0652a2889cf611cf90939f7100f670ebea10:MedEventa-main/routes/auth.routes.js

// ✅ NEW: profil user connecté
router.get('/me', verifyToken, authController.getMe);
router.patch('/me', verifyToken, authController.updateMe);

module.exports = router;
