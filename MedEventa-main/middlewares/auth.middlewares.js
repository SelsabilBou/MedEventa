const jwt = require('jsonwebtoken');
const { hasPermission } = require('./permissions');

const verifyToken = (req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../debug_auth.txt');

    const log = (msg) => {
        try {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
        } catch (e) {
            console.error('Logging failed:', e.message);
        }
    };

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    log(`[${req.method} ${req.originalUrl}] Header: ${authHeader}`);
    log(`[${req.method} ${req.originalUrl}] Token: ${token}`);

    if (!token) {
        log('Error: Token missing');
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        log(`Success: User ${decoded.id} Role: ${decoded.role}`);
        next();
    } catch (err) {
        log(`Error: Verify failed: ${err.message}`);
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

// middleware réutilisable pour vérifier une permission
const requirePermission = (permission) => (req, res, next) => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
        return res.status(403).json({ message: 'Permission refusée' });
    }
    next();
};

module.exports = { verifyToken, requireRole, requirePermission };
