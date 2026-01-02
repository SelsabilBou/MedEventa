const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

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

module.exports = router;
