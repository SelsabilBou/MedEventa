// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { hasPermission } = require('./permissions'); // tu l'as déjà

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // "Bearer xxxxx"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

// middleware pour vérifier un rôle
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};

// ✅ middleware réutilisable pour vérifier une permission
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user || !hasPermission(req.user.role, permission)) {
    return res.status(403).json({ message: 'Permission refusée' });
  }
  next();
};

module.exports = { verifyToken, requireRole, requirePermission };
