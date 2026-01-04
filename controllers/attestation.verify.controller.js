const { validationResult } = require('express-validator');// recupere les 
const { getAttestationByUniqueCode } = require('../models/attestation.model');

function verifyAttestation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { uniqueCode } = req.params;

  getAttestationByUniqueCode(uniqueCode, (err, att) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }

    //if it does not exist so invalid
    if (!att) {
      return res.status(200).json({ valid: false });
    } 
    //valid = infos
    return res.status(200).json({
      valid: true,
      attestation: {
        id: att.id,
        type: att.type,
        date_generation: att.date_generation,
        unique_code: att.unique_code,
        user: { id: att.utilisateur_id, nom: att.nom, prenom: att.prenom },
        event: { id: att.evenement_id, titre: att.event_titre }
      }
    });
  });
}

module.exports = { verifyAttestation };
