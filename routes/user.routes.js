// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken, requirePermission } = require('../middlewares/auth.middlewares');
const { getAllUsers, updateUser, resetPassword, getUsersByRole } = require('../controllers/user.controller');

// GET /api/users
router.get('/', verifyToken, getAllUsers);

// PUT /api/users/:id
router.put('/:id', verifyToken, requirePermission('manage_users'), updateUser);

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', verifyToken, requirePermission('manage_users'), resetPassword);

// GET /api/users/role/:role
router.get('/role/:role', verifyToken, getUsersByRole);

module.exports = router;
