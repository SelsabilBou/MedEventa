// controllers/attestation.batch.controller.js
const { validationResult } = require('express-validator');

const {
  getAttestationByUser,
  upsertAttestation
} = require('../models/attestation.model');

const {
  isEventFinished,
  isParticipantInscrit,
  hasAcceptedCommunication,
  isMembreComiteForEvent,
  isOrganisateurForEvent
} = require('../utils/attestationEligibility');

const AttestationService = require('../services/attestation.service');

/**
 * Helpers: wrap callback-style eligibility fns into Promise
 */
function promisifyEligibility(fn, eventId, userId) {
  return new Promise((resolve, reject) => {
    fn(eventId, userId, (err, ok) => {
      if (err) return reject(err);
      resolve(!!ok);
    });
  });
}

function promisifyGetAttByUser(eventId, userId, type) {
  return new Promise((resolve, reject) => {
    getAttestationByUser(eventId, userId, type, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function promisifyUpsertAttestation(attData) {
  return new Promise((resolve, reject) => {
    upsertAttestation(attData, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * GET ELIGIBILITY per type
 */
async function isEligible(eventId, userId, type) {
  if (type === 'participant') {
    return promisifyEligibility(isParticipantInscrit, eventId, userId);
  }
  if (type === 'communicant') {
    return promisifyEligibility(hasAcceptedCommunication, eventId, userId);
  }
  if (type === 'membre_comite') {
    return promisifyEligibility(isMembreComiteForEvent, eventId, userId);
  }
  if (type === 'organisateur') {
    return promisifyEligibility(isOrganisateurForEvent, eventId, userId);
  }
  return false;
}

/**
 * POST /api/attestations/admin/batch/:eventId?force=true
 * Body:
 *  {
 *    "userIds": [1,2,3],          // required في هاد النسخة
 *    "types": ["participant"]     // optional (default: all types)
 *  }
 */
async function generateBatchForEvent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const eventId = req.params.eventId;

  // ✅ FIX: validator راه يدير toBoolean() => نخدمو مباشرة boolean
  const force = !!req.query.force;

  const { userIds, types } = req.body;

  // نخليه (حتى لو validators راهم يتحققو) باش تكون safety زيادة
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      message: 'userIds مطلوبين للـ batch',
      reason: 'USER_IDS_REQUIRED'
    });
  }

  const allowedTypes = ['participant', 'communicant', 'membre_comite', 'organisateur'];
  const targetTypes = Array.isArray(types) && types.length ? types : allowedTypes;

  const invalidType = targetTypes.find(t => !allowedTypes.includes(t));
  if (invalidType) {
    return res.status(400).json({ message: 'Type invalide', reason: 'TYPE_INVALIDE', invalidType });
  }

  // 1) event finished?
  const evResult = await new Promise((resolve, reject) => {
    isEventFinished(eventId, (err, r) => {
      if (err) return reject(err);
      resolve(r);
    });
  }).catch((err) => {
    return res.status(500).json({ message: 'Erreur vérification événement', error: err });
  });

  if (!evResult) return;

  if (!evResult.ok && evResult.reason === 'EVENT_NOT_FOUND') {
    return res.status(404).json({ message: 'Événement introuvable' });
  }
  if (!evResult.ok && evResult.reason === 'EVENT_NOT_FINISHED') {
    return res.status(403).json({
      message: 'Attestations non disponibles avant la fin de l’événement',
      reason: 'EVENT_NOT_FINISHED'
    });
  }

  const report = {
    eventId,
    force,
    totalUsers: userIds.length,
    types: targetTypes,
    createdOrUpdated: 0,
    skippedCached: 0,
    skippedNotEligible: 0,
    failed: 0,
    failures: []
  };

  for (const userId of userIds) {
    for (const type of targetTypes) {
      try {
        const existing = await promisifyGetAttByUser(eventId, userId, type);
        if (existing && !force) {
          report.skippedCached += 1;
          continue;
        }

        const ok = await isEligible(eventId, userId, type);
        if (!ok) {
          report.skippedNotEligible += 1;
          continue;
        }

        const { pdfPath, uniqueCode } = await AttestationService.generateAttestationPdf({
          eventId,
          userId,
          type
        });

        await promisifyUpsertAttestation({
          evenementId: eventId,
          utilisateurId: userId,
          type,
          fichierPdf: pdfPath,
          uniqueCode
        });

        report.createdOrUpdated += 1;
      } catch (e) {
        report.failed += 1;
        report.failures.push({
          userId,
          type,
          error: e && (e.message || e)
        });
      }
    }
  }

  return res.status(200).json({
    message: 'Batch terminé',
    report
  });
}

module.exports = { generateBatchForEvent };
