DROP DATABASE IF EXISTS event_management;
CREATE DATABASE event_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE event_management;

-- =========================
-- UTILISATEUR
-- =========================
CREATE TABLE utilisateur (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM(
    'SUPER_ADMIN','ORGANISATEUR','COMMUNICANT',
    'PARTICIPANT','MEMBRE_COMITE','INVITE','RESP_WORKSHOP'
  ) NOT NULL,
  photo VARCHAR(255),
  institution VARCHAR(255),
  domaine_recherche VARCHAR(255),
  biographie TEXT,
  pays VARCHAR(100),
  reset_token_hash VARCHAR(255),
  reset_token_expires DATETIME
) ENGINE=InnoDB;

-- =========================
-- EVENEMENT
-- =========================
CREATE TABLE evenement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  lieu VARCHAR(255),
  thematique VARCHAR(255),
  contact VARCHAR(255),
  id_organisateur INT,
  date_limite_communication DATETIME,
  FOREIGN KEY (id_organisateur) REFERENCES utilisateur(id)
);

-- =========================
-- COMITE SCIENTIFIQUE
-- =========================
CREATE TABLE comite_scientifique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE membre_comite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  comite_id INT NOT NULL,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (comite_id) REFERENCES comite_scientifique(id)
);

-- =========================
-- COMMUNICATION
-- =========================
CREATE TABLE communication (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  resume TEXT,
  type ENUM('orale','affiche','poster'),
  fichier_pdf VARCHAR(255),
  etat ENUM('en_attente','acceptee','refusee','en_revision','retire')
       DEFAULT 'en_attente',
  auteur_id INT,
  evenement_id INT,
  decided_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (auteur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (evenement_id) REFERENCES evenement(id),
  FOREIGN KEY (decided_by) REFERENCES utilisateur(id)
);

-- =========================
-- EVALUATION + RAPPORT
-- =========================
CREATE TABLE evaluation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  communication_id INT NOT NULL,
  membre_comite_id INT NOT NULL,
  note INT,
  commentaire TEXT,
  decision ENUM('accepter','refuser','corriger'),
  date_evaluation DATE,
  pertinence INT,
  qualite_scientifique INT,
  originalite INT,
  FOREIGN KEY (communication_id) REFERENCES communication(id),
  FOREIGN KEY (membre_comite_id) REFERENCES membre_comite(id)
);

CREATE TABLE rapport_evaluation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposition_id INT NOT NULL,
  contenu_rapport JSON,
  date_generation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposition_id) REFERENCES communication(id)
);

-- =========================
-- SESSION / WORKSHOP
-- =========================
CREATE TABLE session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  horaire DATETIME,
  salle VARCHAR(80),
  president_id INT,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id),
  FOREIGN KEY (president_id) REFERENCES utilisateur(id)
);

CREATE TABLE workshop (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  responsable_id INT NOT NULL,
  date DATETIME,
  nb_places INT,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id),
  FOREIGN KEY (responsable_id) REFERENCES utilisateur(id)
);

-- =========================
-- INSCRIPTIONS
-- =========================
CREATE TABLE inscription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  evenement_id INT NOT NULL,
  statut_paiement ENUM('a_payer','paye_sur_place','paye'),
  badge VARCHAR(255),
  date_inscription DATE,
  FOREIGN KEY (participant_id) REFERENCES utilisateur(id),
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE inscription_workshop (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  workshop_id INT NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES utilisateur(id),
  FOREIGN KEY (workshop_id) REFERENCES workshop(id)
);

CREATE TABLE inscription_workshop_attente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  workshop_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (participant_id, workshop_id),
  FOREIGN KEY (participant_id) REFERENCES utilisateur(id),
  FOREIGN KEY (workshop_id) REFERENCES workshop(id)
);

-- =========================
-- SONDAGE / SURVEY
-- =========================
CREATE TABLE sondage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE choix_sondage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sondage_id INT NOT NULL,
  libelle VARCHAR(255) NOT NULL,
  FOREIGN KEY (sondage_id) REFERENCES sondage(id)
);

CREATE TABLE reponse_sondage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  sondage_id INT NOT NULL,
  choix_id INT NOT NULL,
  date_reponse DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (sondage_id) REFERENCES sondage(id),
  FOREIGN KEY (choix_id) REFERENCES choix_sondage(id)
);

CREATE TABLE survey (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  title VARCHAR(255) NOT NULL
);

CREATE TABLE survey_question (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  question_text TEXT NOT NULL
);

CREATE TABLE survey_response (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL
);

-- =========================
-- QUESTIONS / VOTES
-- =========================
CREATE TABLE question (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  utilisateur_id INT NOT NULL,
  contenu TEXT NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);

CREATE TABLE vote (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (question_id, user_id)
);

CREATE TABLE vote_question (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  utilisateur_id INT NOT NULL,
  valeur INT DEFAULT 1,
  date_vote DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (question_id, utilisateur_id),
  FOREIGN KEY (question_id) REFERENCES question(id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);

-- =========================
-- AUTRES
-- =========================
CREATE TABLE message_interne (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expediteur_id INT NOT NULL,
  destinataire_id INT NOT NULL,
  evenement_id INT,
  contenu TEXT NOT NULL,
  date_envoi DATETIME,
  type ENUM('notif','reponse','modif_prog'),
  FOREIGN KEY (expediteur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (destinataire_id) REFERENCES utilisateur(id),
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  evenement_id INT,
  type VARCHAR(50),
  message TEXT NOT NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  lu TINYINT(1) DEFAULT 0,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE password_reset_token (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE proposition_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  action ENUM('CREATE','UPDATE','STATUS_CHANGE','WITHDRAW') NOT NULL,
  old_value JSON,
  new_value JSON,
  changed_by INT NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES communication(id) ON DELETE CASCADE
);

CREATE TABLE statistique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evenement_id INT NOT NULL,
  nb_soumissions INT,
  taux_acceptation FLOAT,
  repartition_par_institution TEXT,
  participation_par_pays TEXT,
  FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);
