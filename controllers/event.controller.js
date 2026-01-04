// Gère la logique métier pour les événements (création, récupération, mise à jour).
// Inclut des fonctions comme createEvent, getEvents, getEventDetails, addComite, addInvite

const {
  createEvent,
  addComiteMember,
  clearComiteMembers,
  addInvite,
  clearInvites,
  addAnimateur,
  clearAnimateurs,
  getEvents,
  getEventDetails,
  getComiteByEvent,
  getEventById,
  createComiteByEvent,
} = require('../models/event.model');

const {
  getWorkshopsByEvent,
  updateWorkshopLeader,
} = require('../models/workshop.model');

const { getSessionsByEvent } = require('../models/session.model');
const { createNotification } = require('../models/notification.model');

// Créer un événement
const createEventController = async (req, res) => {
  const { titre, description, date_debut, date_fin, lieu, thematique, contact } = req.body;
  const id_organisateur = req.user.id; // Récupéré du token JWT via middleware

  const eventData = {
    titre,
    description,
    date_debut,
    date_fin,
    lieu,
    thematique,
    contact,
    id_organisateur,
  };

  createEvent(eventData, (err, eventId) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la création de l'événement" });
    }
    // Send notification to Organizer
    createNotification(id_organisateur, eventId, 'event_created', `Votre événement "${titre}" a été créé avec succès.`)
      .catch(nErr => console.error("Notification Event creation error:", nErr));

    res.status(201).json({
      message: 'Événement créé avec succès',
      eventId,
    });
  });
};

// Ajouter des membres au comité d'un événement
const addComiteController = (req, res) => {
  const { eventId } = req.params;
  const { membres } = req.body;
  let { comiteId } = req.body;

  if (!Array.isArray(membres)) {
    return res.status(400).json({ message: 'Liste membres requise' });
  }

  const proceedAdd = (actualComiteId) => {
    // RESTORATIVE: Clear first
    clearComiteMembers(actualComiteId, (err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la réinitialisation du comité" });
      }

      if (membres.length === 0) {
        return res.status(200).json({ message: 'Comité vidé avec succès' });
      }

      let count = 0;
      let hasError = false;

      membres.forEach((userId) => {
        addComiteMember(actualComiteId, userId, (err) => {
          if (err && !hasError) {
            hasError = true;
            return res.status(500).json({ message: "Erreur lors de l’ajout au comité" });
          }

          if (!err) {
            createNotification(userId, eventId, 'committee_invite', `Vous avez été ajouté au comité scientifique d'un événement.`)
              .catch(nErr => console.error("Notification committee error:", nErr));
          }

          count++;
          if (count === membres.length && !hasError) {
            res.status(201).json({ message: 'Comité mis à jour avec succès' });
          }
        });
      });
    });
  };

  if (!comiteId) {
    getComiteByEvent(eventId, (err, comite) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });

      if (!comite) {
        // Create one on the fly
        getEventById(eventId, (err2, event) => {
          if (err2 || !event) return res.status(404).json({ message: "Événement introuvable" });

          createComiteByEvent(eventId, event.titre, (err3, newId) => {
            if (err3) return res.status(500).json({ message: "Erreur lors de la création du comité" });
            proceedAdd(newId);
          });
        });
      } else {
        proceedAdd(comite.id);
      }
    });
  } else {
    proceedAdd(comiteId);
  }
};

// Ajouter des invités à un événement
const addInviteController = (req, res) => {
  const { eventId } = req.params;
  const { invites } = req.body;

  if (!Array.isArray(invites)) {
    return res.status(400).json({ message: 'Liste des invités requise' });
  }

  // RESTORATIVE: Clear first
  clearInvites(eventId, (err) => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la réinitialisation des invités" });
    }

    if (invites.length === 0) {
      return res.status(200).json({ message: 'Invités supprimés avec succès' });
    }

    let count = 0;
    let hasError = false;

    invites.forEach((inviteData) => {
      addInvite(eventId, inviteData, (err) => {
        if (err && !hasError) {
          hasError = true;
          return res.status(500).json({ message: "Erreur lors de l'ajout des invités" });
        }

        if (!err && inviteData.utilisateur_id) {
          createNotification(inviteData.utilisateur_id, eventId, 'event_invite', `Vous avez été invité à un événement comme conférencier.`)
            .catch(nErr => console.error("Notification invite error:", nErr));
        }

        count++;
        if (count === invites.length && !hasError) {
          res.status(201).json({ message: 'Invités mis à jour avec succès' });
        }
      });
    });
  });
};

const manageAnimateursController = (req, res) => {
  const { eventId } = req.params;
  const { animateurs, workshopAssignments } = req.body;

  // Clear and Update event-level animateurs
  clearAnimateurs(eventId, (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la réinitialisation des animateurs" });

    const proceedAddSessions = () => {
      //  Clear previous assignments if any logic exists? 
      

      if (workshopAssignments && Array.isArray(workshopAssignments)) {
        let count = 0;
        if (workshopAssignments.length === 0) return res.status(200).json({ message: 'Animateurs mis à jour' });

        workshopAssignments.forEach(asgn => {
          updateWorkshopLeader(asgn.workshopId, asgn.leaderId, (err) => {
            if (!err && asgn.leaderId) {
              // Notify the newly assigned leader
              createNotification(asgn.leaderId, eventId, 'workshop_assignment', `Vous avez été choisi comme responsable pour un workshop.`)
                .catch(nErr => console.error("Notification WS lead assign error:", nErr));
            }
            count++;
            if (count === workshopAssignments.length) {
              res.status(200).json({ message: 'Animateurs et workshops mis à jour avec succès' });
            }
          });
        });
      } else {
        res.status(200).json({ message: 'Animateurs de l’événement mis à jour' });
      }
    };

    if (!animateurs || animateurs.length === 0) {
      return proceedAddSessions();
    }

    let count = 0;
    animateurs.forEach((userId) => {
      addAnimateur(eventId, userId, () => {
        count++;
        if (count === animateurs.length) {
          proceedAddSessions();
        }
      });
    });
  });
};

// Récupérer la liste des événements
const getEventsController = (req, res) => {
  const { status } = req.query; // ?status=upcoming ou ?status=archived

  getEvents(status, (err, events) => {
    if (err) {
      console.error("GET /api/events ERROR:", err); // Added logging
      return res
        .status(500)
        .json({ message: 'Erreur lors de la récupération des événements', error: err.message }); // Return error details
    }
    res.json(events); // Return array directly
  });
};

// Récupérer les détails d’un événement
const getEventDetailsController = (req, res) => {
  const { id } = req.params; // /api/events/:id

  getEventDetails(id, (err, details) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération de l\'événement" });
    }
    if (!details) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json({
      ...details,
      inscriptionLink: `/api/inscriptions/register/${id}`, // lien futur
    });
  });
};

// Récupérer le programme d'un événement (sessions + workshops)
const getEventProgramController = (req, res) => {
  const { eventId } = req.params;

  getSessionsByEvent(eventId, (err, sessions) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la récupération des sessions" });

    getWorkshopsByEvent(eventId, (err2, workshops) => {
      if (err2) return res.status(500).json({ message: "Erreur lors de la récupération des workshops" });

      res.json({
        sessions: sessions || [],
        workshops: workshops || []
      });
    });
  });
};

module.exports = {
  createEventController,
  addComiteController,
  addInviteController,
  manageAnimateursController,
  getEventsController,
  getEventDetailsController,
  getEventProgramController,
};
