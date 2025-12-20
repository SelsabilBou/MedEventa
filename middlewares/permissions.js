// middlewares/permissions.js
const permissions = {
  SUPER_ADMIN: [
    'create_event', 'delete_user', 'view_all', 'manage_evaluations',
    'decide_submission',
    'view_submissions' // optionnel
  ],
  ORGANISATEUR: [
    'create_event', 'edit_event', 'manage_inscriptions', 'manage_evaluations',
    'decide_submission',
    'view_submissions' // optionnel
  ],
  COMMUNICANT: [
    'submit_communication',
    'create_submission',
    'update_submission',
    'delete_submission',
    'withdraw_submission', // ✅ ajouté
    'view_own_communications',
    'register_event'
  ],
  PARTICIPANT: ['register_event', 'view_public_info'],
  MEMBRE_COMITE: [
    'evaluate_communications', 'view_comite',
    'decide_submission',
    'view_submissions' // optionnel
  ],
  INVITE: ['view_event_details', 'register_event'],
  RESP_WORKSHOP: ['manage_workshop'],
};

const hasPermission = (role, permission) => {
  return permissions[role] && permissions[role].includes(permission);
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user || !hasPermission(req.user.role, permission)) {
    return res.status(403).json({ message: 'Permission refusée' });
  }
  next();
};

module.exports = { permissions, hasPermission, requirePermission };
