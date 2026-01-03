// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middlewares');
const { getUsersByRole, getAllUsers } = require('../controllers/user.controller');

// GET /api/users
router.get('/', verifyToken, getAllUsers);

// GET /api/users/role/:role
router.get('/role/:role', verifyToken, getUsersByRole);

module.exports = router;
