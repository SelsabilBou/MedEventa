const path = require('path');// gerer les chemins des fichiers
const fs = require('fs');// lire/ecrire des fichiers
const PDFDocument = require('pdfkit');//generer des fichiers pdf
const { validationResult } = require('express-validator');// verifier des validation des requetes HTTP
const db = require('../db');

const {
  createAttestation,
  upsertAttestation,
  getAttestationByUser,
  listAttestationsByEvent
} = require('../models/attestation.model');// fonction du model Attestation


const { getUserById } = require('../models/user.model');// charger les infos de user et event
const { getEventById } = require('../models/event.model');

const {// verification des termination de evenement et workshop
  isEventFinished,
  isWorkshopFinished,
  isWorkshopParticipant// si l user a participe
} = require('../utils/attestationEligibility');

const AttestationService = require("../services/attestation.service");// service centrale qui genere le pdf et cree un code unique et organiser le stockage


const ATTESTATIONS_DIR = path.join(__dirname, '..', 'uploads', 'attestations');// le chemin uploads/attestations
if (!fs.existsSync(ATTESTATIONS_DIR)) {// crier le dossiers s'il n'existe pas
  fs.mkdirSync(ATTESTATIONS_DIR, { recursive: true });
}


function generateAttestationPdf({ filename, user, event, type }, callback) {// la fonction qui genere un PDF manuellement
  const filePath = path.join(ATTESTATIONS_DIR, filename);
// creation du document PDF et ecriture sur disque
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const nomComplet = `${user.prenom || ''} ${user.nom || ''}`.trim();

  doc.fontSize(20).text('Attestation', { align: 'center' });// titre
  doc.moveDown();
  // contenu dynamique
  doc.fontSize(14).text(`Nom : ${nomComplet}`);
  doc.text(`Événement : ${event.titre || ''}`);
  doc.text(`Type : ${type}`);
  doc.text(`Institution : ${user.institution || ''}`);
  doc.text(`Pays : ${user.pays || ''}`);
  doc.moveDown();
  doc.text(
    'Cette attestation certifie la participation à l’événement scientifique.',
    { align: 'left' }
  );

  doc.end();

  stream.on('finish', () => callback(null, filePath));
  stream.on('error', (err) => callback(err));
}

// charger user + event
function getUserAndEventInfo(evenementId, utilisateurId, callback) {
  getUserById(utilisateurId, (errUser, user) => {
    if (errUser) return callback(errUser);
    if (!user) return callback(new Error('UTILISATEUR_INTRouvable'));

    getEventById(evenementId, (errEvent, event) => {
      if (errEvent) return callback(errEvent);
      if (!event) return callback(new Error('EVENEMENT_INTRouvable'));

      callback(null, { user, event });
    });
  });
}

// vérifier l’éligibilité selon type demandé
function checkEligibility(evenementId, utilisateurId, type, callback, workshopId) {
  if (type === 'participant') {
    return isParticipantInscrit(evenementId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) return callback(null, { ok: false, reason: 'NOT_REGISTERED' });
      return callback(null, { ok: true });
    });
  }

  if (type === 'communicant') {
    return hasAcceptedCommunication(evenementId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) {
        return callback(null, { ok: false, reason: 'NO_ACCEPTED_COMMUNICATION' });
      }
      return callback(null, { ok: true });
    });
  }

  if (type === 'membre_comite') {
    return isMembreComiteForEvent(evenementId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) return callback(null, { ok: false, reason: 'NOT_COMMITTEE_MEMBER' });
      return callback(null, { ok: true });
    });
  }

  if (type === 'organisateur') {
    return isOrganisateurForEvent(evenementId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) return callback(null, { ok: false, reason: 'NOT_ORGANIZER' });
      return callback(null, { ok: true });
    });
  }

  if (type === 'invite') {
    return isGuestSpeakerForEvent(evenementId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) return callback(null, { ok: false, reason: 'NOT_SPEAKER' });
      return callback(null, { ok: true });
    });
  }

  if (type === 'workshop') {
    if (!workshopId) return callback(null, { ok: false, reason: 'WORKSHOP_ID_REQUIRED' });
    return isWorkshopParticipant(workshopId, utilisateurId, (err, ok) => {
      if (err) return callback(err);
      if (!ok) return callback(null, { ok: false, reason: 'NOT_WORKSHOP_PARTICIPANT' });
      return callback(null, { ok: true });
    });
  }

  return callback(null, { ok: false, reason: 'TYPE_INVALIDE' });
}

// fonction decide si un utilisateur a le droit a une attestation
function generateMyAttestation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const utilisateurId = req.user.id;
  const { evenementId, type, workshopId } = req.body;

  //  vérifier si attestation existe déjà
  getAttestationByUser(evenementId, utilisateurId, type, (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }

    if (existing) {
      return res.status(200).json({
        message: 'Attestation déjà générée',
        attestation: existing
      });
    }

    // Function helper to check finished status
    const checkFinished = (cb) => {
      if (type === 'workshop') {
        if (!workshopId) return cb({ ok: false, reason: 'WORKSHOP_ID_REQUIRED' }); // Should be caught by validator?
        isWorkshopFinished(workshopId, (err, res) => cb(err ? { error: err } : res));
      } else {
        isEventFinished(evenementId, (err, res) => cb(err ? { error: err } : res));
      }
    };

    // vérifier que l'événement/workshop est terminé
    checkFinished((evResult) => {
      if (evResult.error) {
        return res.status(500).json({ message: 'Erreur vérification événement', error: evResult.error });
      }
      if (!evResult.ok) {
        if (evResult.reason === 'EVENT_NOT_FOUND' || evResult.reason === 'WORKSHOP_NOT_FOUND') {
          return res.status(404).json({ message: 'Événement/Workshop introuvable' });
        }
        return res.status(403).json({
          message: 'Attestation non disponible avant la fin',
          reason: evResult.reason
        });
      }

      //  vérifier l’éligibilité selon le type
      checkEligibility(evenementId, utilisateurId, type, (eligErr, result) => {
        if (eligErr) {
          return res.status(500).json({ message: 'Erreur serveur', error: eligErr });
        }
        if (!result.ok) {
          return res.status(403).json({
            message: 'Utilisateur non éligible pour ce type d’attestation',
            reason: result.reason
          });
        }

        // generer attestation pdf propre
        AttestationService.generateAttestationPdf({
          eventId: evenementId,
          userId: utilisateurId,
          type,
          workshopId
        })
          .then(({ pdfPath, uniqueCode }) => {
            const attData = {
              evenementId,
              utilisateurId,
              type,
              workshopId,
              fichierPdf: pdfPath,
              uniqueCode 
            };

            //creation d'attestation dans DB (insert)
            createAttestation(attData, (createErr, created) => {
              if (createErr) {
                return res.status(500).json({
                  message: 'Erreur création attestation',
                  error: createErr
                });
              }

              return res.status(201).json({
                message: 'Attestation générée',
                attestation: created
              });
            });
          })
          .catch((pdfErr) => {
            return res.status(500).json({
              message: 'Erreur génération PDF (service)',
              error: pdfErr.message || pdfErr
            });
          });
      }, workshopId);
    });
  }, workshopId);
}

// telecharger attestation
function downloadMyAttestation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const utilisateurId = req.user.id;
  const { evenementId, type, workshopId } = req.query;

  // type validate rapide
  const allowed = ['participant', 'communicant', 'membre_comite', 'organisateur', 'invite', 'workshop'];
  if (!allowed.includes(type)) {
    return res.status(400).json({ message: 'Type invalide', reason: 'TYPE_INVALIDE' });
  }

  // 1) getting attestation depuis DB
  getAttestationByUser(evenementId, utilisateurId, type, (err, attestation) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }

    // si l attestation n'existe pas on genere
    if (!attestation) {
      
      // Function helper to check finished status
      const checkFinished = (cb) => {
        if (type === 'workshop') {
          if (!workshopId) return cb({ ok: false, reason: 'WORKSHOP_ID_REQUIRED' });
          isWorkshopFinished(workshopId, (err, res) => cb(err ? { error: err } : res));
        } else {
          isEventFinished(evenementId, (err, res) => cb(err ? { error: err } : res));
        }
      };

      checkFinished((evResult) => {
        if (evResult.error) {
          return res.status(500).json({ message: 'Erreur vérification événement', error: evResult.error });
        }
        if (!evResult.ok) {
          return res.status(403).json({
            message: 'Attestation non disponible avant la fin',
            reason: evResult.reason
          });
        }

        checkEligibility(evenementId, utilisateurId, type, (eligErr, result) => {
          if (eligErr) {
            return res.status(500).json({ message: 'Erreur serveur', error: eligErr });
          }
          if (!result.ok) {
            return res.status(403).json({
              message: 'Utilisateur non éligible pour ce type d’attestation',
              reason: result.reason
            });
          }

          AttestationService.generateAttestationPdf({
            eventId: evenementId,
            userId: utilisateurId,
            type,
            workshopId
          })
            .then(({ pdfPath, uniqueCode }) => {
              const attData = {
                evenementId,
                utilisateurId,
                type,
                workshopId,
                fichierPdf: pdfPath,
                uniqueCode
              };

              createAttestation(attData, (createErr, created) => {
                if (createErr) {
                  return res.status(500).json({
                    message: 'Erreur création attestation',
                    error: createErr
                  });
                }

                if (!fs.existsSync(pdfPath)) {
                  return res.status(404).json({ message: 'Fichier PDF introuvable sur le serveur' });
                }

                return res.download(pdfPath, `attestation_${type}.pdf`); // téléchargement 
              });
            })
            .catch((pdfErr) => {
              return res.status(500).json({
                message: 'Erreur génération PDF (service)',
                error: pdfErr.message || pdfErr
              });
            });
        }, workshopId);
      });

      return;
    }

    // attestation existe dans fichier_pdf
    const filePath = attestation.fichier_pdf;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier PDF introuvable sur le serveur' });
    }

    return res.download(filePath, `attestation_${type}.pdf`); // téléchargement 
  }, req.query.workshopId); // Pass workshopId for getAttestationByUser
}


function generateAttestationForUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { evenementId, utilisateurId, type, force } = req.body;

  getAttestationByUser(evenementId, utilisateurId, type, (err, existing) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }

    // cache
    if (existing && !force) {
      return res.status(200).json({
        message: 'Attestation déjà générée (cache)',
        attestation: existing
      });
    }

    //  vérifier fin d'événement
    isEventFinished(evenementId, (evErr, evResult) => {
      if (evErr) {
        return res.status(500).json({ message: 'Erreur vérification événement', error: evErr });
      }
      if (!evResult.ok && evResult.reason === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Événement introuvable' });
      }
      if (!evResult.ok && evResult.reason === 'EVENT_NOT_FINISHED') {
        return res.status(403).json({
          message: 'Attestation non disponible avant la fin de l’événement',
          reason: 'EVENT_NOT_FINISHED'
        });
      }

      //  vérifier l’éligibilité
      checkEligibility(evenementId, utilisateurId, type, (eligErr, result) => {
        if (eligErr) {
          return res.status(500).json({ message: 'Erreur serveur', error: eligErr });
        }
        if (!result.ok) {
          return res.status(403).json({
            message: 'Utilisateur non éligible pour ce type d’attestation',
            reason: result.reason
          });
        }

        // download certificat depuis le service
        AttestationService.generateAttestationPdf({
          eventId: evenementId,
          userId: utilisateurId,
          type
        })
          .then(({ pdfPath, uniqueCode }) => {
            const attData = {
              evenementId,
              utilisateurId,
              type,
              fichierPdf: pdfPath,
              uniqueCode
            };

            
            upsertAttestation(attData, (saveErr, savedRow) => {
              if (saveErr) {
                return res.status(500).json({
                  message: 'Erreur création/mise à jour attestation',
                  error: saveErr
                });
              }

              return res.status(existing ? 200 : 201).json({
                message: existing
                  ? 'Attestation régénérée (force=true)'
                  : 'Attestation générée (admin)',
                attestation: savedRow
              });
            });
          })
          .catch((pdfErr) => {
            return res.status(500).json({
              message: 'Erreur génération PDF (service)',
              error: pdfErr.message || pdfErr
            });
          });
      });
    });
  });
}
// GET /api/attestations/evenement/:evenementId
function listEventAttestations(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const evenementId = req.params.evenementId;

  listAttestationsByEvent(evenementId, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }
    return res.status(200).json(rows);
  });
}




function listMyAttestations(req, res) {
  const utilisateurId = req.user.id;

  // Custom query to join with event title
  const sql = `
    SELECT a.*, e.titre as event_title
    FROM attestation a
    JOIN evenement e ON a.evenement_id = e.id
    WHERE a.utilisateur_id = ?
    ORDER BY a.date_generation DESC
  `;

  db.query(sql, [utilisateurId], (err, rows) => {
    if (err) {
      console.error('Error listing user attestations:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }
    return res.status(200).json(rows);
  });
}


function listMyEligibility(req, res) {
  const utilisateurId = req.user.id;


  const sql = `
    SELECT evenement_id, event_title, type FROM (
      -- 1. Participants
      SELECT 
        e.id as evenement_id, e.titre as event_title, 'participant' as type
      FROM evenement e
      JOIN inscription i ON i.evenement_id = e.id
      WHERE i.participant_id = ? AND (e.date_fin IS NOT NULL AND e.date_fin <= NOW())
      AND NOT EXISTS (SELECT 1 FROM attestation a WHERE a.evenement_id = e.id AND a.utilisateur_id = ? AND a.type = 'participant')

      UNION ALL

      -- 2. Communicants (Authors)
      SELECT 
        e.id as evenement_id, e.titre as event_title, 'communicant' as type
      FROM evenement e
      JOIN communication c ON c.evenement_id = e.id
      WHERE (c.auteur_id = ?) AND c.etat = 'acceptee' AND (e.date_fin IS NOT NULL AND e.date_fin <= NOW())
      AND NOT EXISTS (SELECT 1 FROM attestation a WHERE a.evenement_id = e.id AND a.utilisateur_id = ? AND a.type = 'communicant')

      UNION ALL

      -- 3. Invited Speakers (Chairs/Authors in sessions)
      SELECT 
        e.id as evenement_id, e.titre as event_title, 'invite' as type
      FROM evenement e
      JOIN session s ON s.evenement_id = e.id
      LEFT JOIN communication c ON c.session_id = s.id
      WHERE (s.president_id = ? OR c.auteur_id = ?) AND (e.date_fin IS NOT NULL AND e.date_fin <= NOW())
      AND NOT EXISTS (SELECT 1 FROM attestation a WHERE a.evenement_id = e.id AND a.utilisateur_id = ? AND a.type = 'invite')

      UNION ALL

      -- 4. Committee Members
      SELECT 
        e.id as evenement_id, e.titre as event_title, 'membre_comite' as type
      FROM evenement e
      JOIN comite_scientifique cs ON cs.evenement_id = e.id
      JOIN membre_comite mc ON mc.comite_id = cs.id
      WHERE mc.utilisateur_id = ? AND (e.date_fin IS NOT NULL AND e.date_fin <= NOW())
      AND NOT EXISTS (SELECT 1 FROM attestation a WHERE a.evenement_id = e.id AND a.utilisateur_id = ? AND a.type = 'membre_comite')

      UNION ALL

      -- 5. Organizers
      SELECT 
        e.id as evenement_id, e.titre as event_title, 'organisateur' as type
      FROM evenement e
      WHERE e.id_organisateur = ? AND (e.date_fin IS NOT NULL AND e.date_fin <= NOW())
      AND NOT EXISTS (SELECT 1 FROM attestation a WHERE a.evenement_id = e.id AND a.utilisateur_id = ? AND a.type = 'organisateur')
    ) as eligibility
    ORDER BY evenement_id DESC
  `;

  // Note: For now, I'm excluding presentateur_id check in SQL to avoid potential column errors 
  // if not yet migrated, sticking to auteur_id which is guaranteed.
  const params = [
    utilisateurId, utilisateurId, // participant
    utilisateurId, utilisateurId, // communicant
    utilisateurId, utilisateurId, utilisateurId, // invite
    utilisateurId, utilisateurId, // membre_comite
    utilisateurId, utilisateurId  // organisateur
  ];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error listing user eligibility:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }
    return res.status(200).json(rows);
  });
}

module.exports = {
  generateMyAttestation,
  downloadMyAttestation,
  generateAttestationForUser,
  listEventAttestations,
  listMyAttestations,
  listMyEligibility
};
