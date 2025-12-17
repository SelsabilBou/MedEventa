// routes/event.routes.js
const express = require('express');
const router = express.Router();
const { createEventController } = require('../controllers/event.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { hasPermission } = require('../middlewares/permissions');
const { createEventValidation, validate } = require('../middlewares/event.validators');

// Middleware pour vérifier une permission
const requirePermission = (permission) => (req, res, next) => {
  console.log('User in requirePermission:', req.user);
  console.log('Role:', req.user && req.user.role);
  console.log('Permission needed:', permission);

  if (!req.user || !hasPermission(req.user.role, permission)) {
    return res.status(403).json({ message: 'Permission refusée' });
  }
  next();
};

// Route pour créer un événement
router.post(
  '/create',
  verifyToken,
  requirePermission('create_event'),
  createEventValidation,
  validate,
  createEventController
);

module.exports = router;
