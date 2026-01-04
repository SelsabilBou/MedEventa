const { validationResult } = require('express-validator');//recupere la fonction validationResult

const {
  getAttestationByUser,//verifier si l'attestation existe deja 
  upsertAttestation // update or insert une attestation
} = require('../models/attestation.model');

const { createNotification } = require('../models/notification.model');//pour envoyer une notification a l'utilisateur quand son certificat est pret

const {
  isEventFinished,//evenement terminer?
  isParticipantInscrit,//utilisateur inscrit?
  hasAcceptedCommunication,//communication acceptee?
  isMembreComiteForEvent,//membre de comite?
  isOrganisateurForEvent,//organisateur?
  isWorkshopParticipant,//participant a un workshop?
  isWorkshopFinished
} = require('../utils/attestationEligibility');

const AttestationService = require('../services/attestation.service');// service generer le PDF et ecrir un code unique 

//helpers => les fonction utilisent des callbacks (err, result ) 
// helpers les transformer en promises pour utiliser async/await
function promisifyEligibility(fn, eventId, userId) {// une fonction de verification qui retourne true ou false
  return new Promise((resolve, reject) => {
    fn(eventId, userId, (err, ok) => {
      if (err) return reject(err);
      resolve(!!ok);
    });
  });
}

function promisifyGetAttByUser(eventId, userId, type) {//verifier si l'attestation esxiste deja
  return new Promise((resolve, reject) => {
    getAttestationByUser(eventId, userId, type, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function promisifyUpsertAttestation(attData) {//pour inset or update l'attestation dans la base de donnees
  return new Promise((resolve, reject) => {
    upsertAttestation(attData, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

//est-ce que l'utilisateur merite ce type d'attestation
async function isEligible(eventId, userId, type, workshopId) {
  if (type === 'participant') {
    return promisifyEligibility(isParticipantInscrit, eventId, userId);
  }//partisipant doit etre inscrit
  if (type === 'communicant') {
    return promisifyEligibility(hasAcceptedCommunication, eventId, userId);
  }//communicant doit etre la communication acceptee
  if (type === 'membre_comite') {
    return promisifyEligibility(isMembreComiteForEvent, eventId, userId);
  }//verification du role
  if (type === 'organisateur') {
    return promisifyEligibility(isOrganisateurForEvent, eventId, userId);
  }//verification du role
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
}// verifier si l'utilisateur a participe au workshop

//route POST pour generer les attestations pour plusieur utilisateurs
async function generateBatchForEvent(req, res) {
  const errors = validationResult(req);// verifier les erreur du validator 
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }// si il y a un erreur donc stop

  const eventId = req.params.eventId;
  const force = !!req.query.force;//regenerer meme si deja existant

  const { userIds, types, workshopId } = req.body;// donnes envoyees dans le body
  
  if (!Array.isArray(userIds) || userIds.length === 0) {// securite : userId obligatoires
    return res.status(400).json({
      message: 'userIds needed batch',
      reason: 'USER_IDS_REQUIRED'
    });
  }

  const allowedTypes = ['participant', 'communicant', 'membre_comite', 'organisateur', 'workshop'];// type d'attestation possibles
  const targetTypes = Array.isArray(types) && types.length ? types : allowedTypes;

  const invalidType = targetTypes.find(t => !allowedTypes.includes(t));
  if (invalidType) {
    return res.status(400).json({ message: 'Type invalide', reason: 'TYPE_INVALIDE', invalidType });
  }

  // event/workshop finished?
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
    if (!wResult.ok) {   // securite : pas d'attestation avant la fin de workshop
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

  const report = {// afficher un resume final
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

  for (const userId of userIds) {// c'est la boucle principale 
    for (const type of targetTypes) {
      try {
        const existing = await promisifyGetAttByUser(eventId, userId, type); 
        

        let existingCheck = null;
        if (type === 'workshop') {// si deja generee on skip
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

        const ok = await isEligible(eventId, userId, type, workshopId);// pas eligible on skip
        if (!ok) {
          report.skippedNotEligible += 1;
          continue;
        }

        const { pdfPath, uniqueCode } = await AttestationService.generateAttestationPdf({// generer le PDF et un code unique
          eventId,
          userId,
          type,
          workshopId
        });

        await promisifyUpsertAttestation({// sauvgarder dand data base
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
      } catch (e) {// gestion des erreurs
        report.failed += 1;
        report.failures.push({
          userId,
          type,
          error: e && (e.message || e)
        });
      }
    }
  }

  return res.status(200).json({// reponse finale 
    message: 'Batch terminé',
    report
  });
}

module.exports = { generateBatchForEvent };
