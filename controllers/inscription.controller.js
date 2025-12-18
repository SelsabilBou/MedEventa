// controllers/inscription.controller.js
const { validationResult } = require('express-validator');
const { inscriptionValidationByProfile } = require('../validators/inscription.validators');
const {
  registerInscription,
  getPaymentStatus,
  updatePaymentStatus,
} = require('../models/inscription.model');

// Middleware qui applique la validation dynamique selon le profil
const validateInscription = (req, res, next) => {
  const profil = req.body.profil;
  const validators = inscriptionValidationByProfile(profil);

  Promise.all(validators.map((v) => v.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    })
    .catch((err) => {
      console.error('Erreur validation inscription:', err);
      res.status(500).json({ message: 'Erreur de validation' });
    });
};

// POST /api/inscriptions/register/:eventId
// Créer une inscription pour un user connecté sur un événement donné
const register = (req, res) => {
  const { eventId } = req.params;
  const { profil } = req.body;

  const userId = req.user && req.user.id;
  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  registerInscription(eventId, userId, profil, (err, inscriptionId) => {
    if (err) {
      console.error("Erreur registerInscription:", err);
      return res.status(500).json({ message: "Erreur lors de l'inscription" });
    }

    res.status(201).json({
      message: "Inscription effectuée avec succès",
      inscriptionId,
      profil,
    });
  });
};

// GET /api/inscriptions/:inscriptionId/payment-status
// Récupérer le statut de paiement d'une inscription
const getPaymentStatusController = (req, res) => {
  const { inscriptionId } = req.params;

  getPaymentStatus(inscriptionId, (err, status) => {
    if (err) {
      console.error('Erreur getPaymentStatus:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (!status) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    res.json({
      inscriptionId: Number(inscriptionId),
      statut_paiement: status,
    });
  });
};

// PUT /api/inscriptions/:inscriptionId/payment-status
// Mettre à jour le statut de paiement (orga/admin)
const updatePaymentStatusController = (req, res) => {
  const { inscriptionId } = req.params;
  const { statut_paiement } = req.body;

  const allowed = ['a_payer', 'paye_sur_place', 'paye_en_ligne'];
  if (!allowed.includes(statut_paiement)) {
    return res.status(400).json({ message: 'Statut_paiement invalide' });
  }

  updatePaymentStatus(inscriptionId, statut_paiement, (err, affected) => {
    if (err) {
      console.error('Erreur updatePaymentStatus:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (affected === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    res.json({
      message: 'Statut de paiement mis à jour',
      inscriptionId: Number(inscriptionId),
      statut_paiement,
    });
  });
};

module.exports = {
  validateInscription,
  register,
  getPaymentStatusController,
  updatePaymentStatusController,
};
