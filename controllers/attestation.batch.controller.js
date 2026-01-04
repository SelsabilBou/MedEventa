// controllers/attestation.batch.controller.js
const { validationResult } = require('express-validator');

const {
  getAttestationByUser,
  upsertAttestation
} = require('../models/attestation.model');

const { createNotification } = require('../models/notification.model');

const {
  isEventFinished,
  isParticipantInscrit,
  hasAcceptedCommunication,
  isMembreComiteForEvent,
  isOrganisateurForEvent,
  isWorkshopParticipant,
  isWorkshopFinished
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
async function isEligible(eventId, userId, type, workshopId) {
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
  if (type === 'workshop') {
    // promisifyEligibility expects (eventId, userId, cb), but isWorkshopParticipant needs (workshopId, userId, cb)
    // wrapper:
    return new Promise((resolve, reject) => {
      isWorkshopParticipant(workshopId, userId, (err, ok) => {
        if (err) return reject(err);
        resolve(!!ok);
      });
    });
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

  const { userIds, types, workshopId } = req.body;

  // نخليه (حتى لو validators راهم يتحققو) باش تكون safety زيادة
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      message: 'userIds مطلوبين للـ batch',
      reason: 'USER_IDS_REQUIRED'
    });
  }

  const allowedTypes = ['participant', 'communicant', 'membre_comite', 'organisateur', 'workshop'];
  const targetTypes = Array.isArray(types) && types.length ? types : allowedTypes;

  const invalidType = targetTypes.find(t => !allowedTypes.includes(t));
  if (invalidType) {
    return res.status(400).json({ message: 'Type invalide', reason: 'TYPE_INVALIDE', invalidType });
  }

  // 1) event/workshop finished?
  if (targetTypes.includes('workshop')) {
    if (!workshopId) {
      return res.status(400).json({ message: 'Workshop ID required for workshop batch' });
    }
    // Check workshop finished
    const wResult = await new Promise((resolve, reject) => {
      isWorkshopFinished(workshopId, (err, r) => {
        if (err) return reject(err);
        resolve(r);
      });
    }).catch((err) => {
      return { error: err };
    });

    if (wResult.error) return res.status(500).json({ message: 'Error checking workshop', error: wResult.error });
    if (!wResult.ok) {
      return res.status(403).json({
        message: 'Attestations non disponibles avant la fin du workshop',
        reason: wResult.reason
      });
    }
  } else {
    // Check event finished
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
        const existing = await promisifyGetAttByUser(eventId, userId, type); // TODO: Update promisifyGetAttByUser to support workshopId if needed? 
        // Logic: if existing, skip.
        // We need to confirm if getAttestationByUser handles workshop_id. Yes, updated in model.
        // But helper promisifyGetAttByUser(eventId, userId, type) calls getAttestationByUser(e, u, t, cb).
        // It does NOT pass workshopId.
        // I need to update promisifyGetAttByUser? 
        // Yes, or simply call getAttestationByUser directly here inside wrapper if type is workshop?
        // Let's rely on standard logic: if workshopId passed, use it.
        // But `promisifyGetAttByUser` is defined above. I need to update it too. 
        // I'll update calls here first.

        let existingCheck = null;
        if (type === 'workshop') {
          existingCheck = await new Promise((resolve, reject) => {
            getAttestationByUser(eventId, userId, type, (err, row) => resolve(row), workshopId);
          });
        } else {
          existingCheck = await promisifyGetAttByUser(eventId, userId, type);
        }

        if (existingCheck && !force) {
          report.skippedCached += 1;
          continue;
        }

        const ok = await isEligible(eventId, userId, type, workshopId);
        if (!ok) {
          report.skippedNotEligible += 1;
          continue;
        }

        const { pdfPath, uniqueCode } = await AttestationService.generateAttestationPdf({
          eventId,
          userId,
          type,
          workshopId
        });

        await promisifyUpsertAttestation({
          evenementId: eventId,
          utilisateurId: userId,
          type,
          workshopId,
          fichierPdf: pdfPath,
          uniqueCode
        });

        // Send notification to participant
        const notifMessage = type === 'workshop'
          ? `Votre certificat de participation au workshop est prêt!`
          : `Votre certificat de ${type} est prêt!`;

        createNotification(userId, eventId, 'certificate_generated', notifMessage)
          .catch(nErr => console.error("Notification certificate error:", nErr));

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
