// controllers/workshop.controller.js
const { validationResult } = require('express-validator');

const {
  createWorkshop,
  getWorkshopsByEvent,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  eventExists,
  userExists,
} = require('../models/workshop.model');

// Convertit ISO8601 -> 'YYYY-MM-DD HH:MM:SS' (MySQL DATETIME)
const isoToMySQLDateTime = (isoString) => {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

// ===== LISTE =====
const listWorkshops = (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);

  getWorkshopsByEvent(eventId, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    return res.status(200).json(rows);
  });
};

// ===== GET ONE =====
const getWorkshopController = (req, res) => {
  const workshopId = parseInt(req.params.workshopId, 10);

  getWorkshopById(workshopId, (err, workshop) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop introuvable' });
    }
    return res.status(200).json(workshop);
  });
};

// ===== CREATE =====
const createWorkshopController = (req, res) => {
  // DEBUG: voir exactement ce qui arrive
  console.log('BODY RECU workshop =', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const eventId = parseInt(req.params.eventId, 10);
  const { titre, responsable_id, date, nb_places } = req.body;

  const mysqlDate = isoToMySQLDateTime(date);
  if (!mysqlDate) {
    return res.status(400).json({ message: 'Date invalide' });
  }

  eventExists(eventId, (err, exists) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    if (!exists) {
      return res.status(404).json({ message: 'Événement introuvable' });
    }

    userExists(responsable_id, (err2, userOk) => {
      if (err2) {
        return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
      }
      if (!userOk) {
        return res.status(404).json({ message: 'Responsable introuvable' });
      }

      createWorkshop(
        {
          evenement_id: eventId,
          titre,
          responsable_id,
          date: mysqlDate,
          nb_places,
        },
        (err3, workshopId) => {
          if (err3) {
            return res.status(500).json({ message: 'Erreur serveur', error: err3.message });
          }
          return res.status(201).json({ message: 'Workshop créé', workshopId });
        }
      );
    });
  });
};

// ===== UPDATE =====
const updateWorkshopController = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const workshopId = parseInt(req.params.workshopId, 10);
  const { titre, responsable_id, date, nb_places } = req.body;

  getWorkshopById(workshopId, (err, workshop) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop introuvable' });
    }

    const merged = {
      titre: titre ?? workshop.titre,
      responsable_id: responsable_id ?? workshop.responsable_id,
      date: workshop.date,
      nb_places: nb_places ?? workshop.nb_places,
    };

    if (date !== undefined) {
      const mysqlDate = isoToMySQLDateTime(date);
      if (!mysqlDate) {
        return res.status(400).json({ message: 'Date invalide' });
      }
      merged.date = mysqlDate;
    }

    userExists(merged.responsable_id, (err2, userOk) => {
      if (err2) {
        return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
      }
      if (!userOk) {
        return res.status(404).json({ message: 'Responsable introuvable' });
      }

      updateWorkshop(workshopId, merged, (err3, affectedRows) => {
        if (err3) {
          return res.status(500).json({ message: 'Erreur serveur', error: err3.message });
        }
        if (!affectedRows) {
          return res.status(400).json({ message: 'Aucune modification' });
        }
        return res.status(200).json({ message: 'Workshop mis à jour' });
      });
    });
  });
};

// ===== DELETE =====
const deleteWorkshopController = (req, res) => {
  const workshopId = parseInt(req.params.workshopId, 10);

  getWorkshopById(workshopId, (err, workshop) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop introuvable' });
    }

    deleteWorkshop(workshopId, (err2, affectedRows) => {
      if (err2) {
        return res.status(500).json({ message: 'Erreur serveur', error: err2.message });
      }
      if (!affectedRows) {
        return res.status(400).json({ message: 'Suppression échouée' });
      }
      return res.status(200).json({ message: 'Workshop supprimé' });
    });
  });
};

module.exports = {
  listWorkshops,
  getWorkshopController,
  createWorkshopController,
  updateWorkshopController,
  deleteWorkshopController,
};
