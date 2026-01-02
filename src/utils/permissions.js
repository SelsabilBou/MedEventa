// src/utils/permissions.js

// This file mirrors exactly the effective backend permissions.
// Because of duplicates in the backend, some permissions are overwritten.
// This front-end utility ensures the UI fits the current backend state.

export const permissions = {
    SUPER_ADMIN: [
        'create_event', 'delete_user', 'view_all', 'manage_evaluations',
        'manage_program', 'manage_event', 'view_workshops'
    ],

    ORGANISATEUR: [
        'create_event', 'edit_event', 'manage_inscriptions', 'manage_evaluations',
        'manage_program', 'manage_event', 'view_workshops'
    ],

    COMMUNICANT: [
        'submit_communication', 'view_own_communications', 'register_event',
        'view_workshops', 'register_workshop'
    ],

    PARTICIPANT: [
        'register_event', 'view_public_info', 'view_workshops', 'register_workshop'
    ],

    MEMBRE_COMITE: [
        'evaluate_communications', 'view_comite', 'view_workshops'
    ],

    INVITE: [
        'view_event_details', 'register_event', 'view_workshops'
    ],

    RESP_WORKSHOP: [
        'manage_workshop', 'view_workshops'
    ]
};

export const hasPermission = (user, permission) => {
    if (!user || !user.role) return false;
    const roleName = user.role.toUpperCase();
    const rolePermissions = permissions[roleName];
    return rolePermissions ? rolePermissions.includes(permission) : false;
};
