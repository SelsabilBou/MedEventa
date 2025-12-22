USE event_management;

CREATE TABLE utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM(
        'SUPER_ADMIN',
        'ORGANISATEUR',
        'COMMUNICANT',
        'PARTICIPANT',
        'MEMBRE_COMITE',
        'INVITE',
        'RESP_WORKSHOP'
    ) NOT NULL,
    photo VARCHAR(255),
    institution VARCHAR(255),
    domaine_recherche VARCHAR(255),
    biographie TEXT,
    pays VARCHAR(100),
    -- champs ajoutés
    reset_token_hash VARCHAR(255),
    reset_token_expires DATETIME
);

CREATE TABLE evenement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    lieu VARCHAR(255),
    thematique VARCHAR(255),
    contact VARCHAR(255),
    id_organisateur INT,
    -- champ ajouté
    date_limite_communication DATETIME,
    FOREIGN KEY (id_organisateur) REFERENCES utilisateur(id)
);

CREATE TABLE inscription (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    evenement_id INT NOT NULL,
    -- défaut ajouté
    statut_paiement ENUM('a_payer', 'paye_sur_place', 'paye') DEFAULT 'a_payer',
    badge VARCHAR(255),
    date_inscription DATE,
    FOREIGN KEY (participant_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id),
    -- contrainte ajoutée
    UNIQUE (participant_id, evenement_id)
);

CREATE TABLE presence (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    evenement_id INT NOT NULL,
    type VARCHAR(50),
    date_presence DATETIME,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id),
    -- contrainte ajoutée
    UNIQUE (utilisateur_id, evenement_id, date_presence)
);

CREATE TABLE comite_scientifique (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE membre_comite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    comite_id INT NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (comite_id) REFERENCES comite_scientifique(id),
    -- contrainte ajoutée
    UNIQUE (utilisateur_id, comite_id)
);

CREATE TABLE communication (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    resume TEXT,
    -- NOT NULL ajouté
    type ENUM('orale', 'affiche', 'poster') NOT NULL,
    fichier_pdf VARCHAR(255),
    -- valeurs ajoutées + défaut
    etat ENUM('en_attente', 'acceptee', 'refusee', 'en_revision', 'retire')
        NOT NULL DEFAULT 'en_attente',
    -- NOT NULL ajoutés
    auteur_id INT NOT NULL,
    evenement_id INT NOT NULL,
    -- champs ajoutés
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    decided_by INT,
    FOREIGN KEY (auteur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
    -- PAS de fk sur decided_by puisque tu as demandé de ne pas ajouter de nouvelle contrainte
);

CREATE TABLE evaluation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    communication_id INT NOT NULL,
    membre_comite_id INT NOT NULL,
    -- type ajusté
    note TINYINT,
    commentaire TEXT,
    -- NOT NULL ajouté
    decision ENUM('accepter', 'refuser', 'corriger') NOT NULL,
    date_evaluation DATE,
    -- champs ajoutés
    pertinence TINYINT,
    qualite_scientifique TINYINT,
    originalite TINYINT,
    FOREIGN KEY (communication_id) REFERENCES communication(id),
    FOREIGN KEY (membre_comite_id) REFERENCES membre_comite(id)
);

CREATE TABLE session (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    horaire DATETIME,
    salle VARCHAR(80),
    president_id INT,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id),
    FOREIGN KEY (president_id) REFERENCES utilisateur(id)
);

CREATE TABLE workshop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    responsable_id INT NOT NULL,
    date DATETIME,
    nb_places INT,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id),
    FOREIGN KEY (responsable_id) REFERENCES utilisateur(id)
);

CREATE TABLE inscription_workshop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    workshop_id INT NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES utilisateur(id),
    FOREIGN KEY (workshop_id) REFERENCES workshop(id),
    -- contrainte ajoutée
    UNIQUE (participant_id, workshop_id)
);

CREATE TABLE support_atelier (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workshop_id INT NOT NULL,
    type VARCHAR(50),
    url VARCHAR(255),
    titre VARCHAR(255),
    FOREIGN KEY (workshop_id) REFERENCES workshop(id)
);

CREATE TABLE invite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    evenement_id INT NOT NULL,
    sujet_conference VARCHAR(255),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE attestation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    evenement_id INT NOT NULL,
    type ENUM('participant', 'communicant', 'membre_comite', 'organisateur') NOT NULL,
    date_generation DATE,
    fichier_pdf VARCHAR(255),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE statistique (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    nb_soumissions INT,
    taux_acceptation FLOAT,
    repartition_par_institution TEXT,
    participation_par_pays TEXT,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE message_interne (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expediteur_id INT NOT NULL,
    destinataire_id INT NOT NULL,
    evenement_id INT,
    contenu TEXT NOT NULL,
    -- défaut ajouté
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- NOT NULL ajouté
    type ENUM('notif', 'reponse', 'modif_prog') NOT NULL,
    FOREIGN KEY (expediteur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (destinataire_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    evenement_id INT NULL,
    type VARCHAR(50),
    message TEXT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- BOOLEAN -> TINYINT(1) dans MySQL
    lu TINYINT(1) DEFAULT 0,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE sondage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id)
);

CREATE TABLE choix_sondage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sondage_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    FOREIGN KEY (sondage_id) REFERENCES sondage(id)
);

CREATE TABLE reponse_sondage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    sondage_id INT NOT NULL,
    choix_id INT NOT NULL,
    date_reponse DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    FOREIGN KEY (sondage_id) REFERENCES sondage(id),
    FOREIGN KEY (choix_id) REFERENCES choix_sondage(id),
    -- contrainte ajoutée
    UNIQUE (utilisateur_id, sondage_id)
);

CREATE TABLE question (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evenement_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    contenu TEXT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evenement_id) REFERENCES evenement(id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);

CREATE TABLE vote_question (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    valeur INT DEFAULT 1,
    date_vote DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES question(id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id),
    UNIQUE (question_id, utilisateur_id)
);

-- tables ajoutées complètement (n’existaient pas dans ta première base)

CREATE TABLE password_reset_token (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id)
);

CREATE TABLE proposition_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'STATUS_CHANGE', 'WITHDRAW') NOT NULL,
    old_value JSON,
    new_value JSON,
    changed_by INT NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES communication(id),
    FOREIGN KEY (changed_by) REFERENCES utilisateur(id)
);

CREATE TABLE rapport_evaluation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proposition_id INT NOT NULL,
    contenu_rapport JSON,
    date_generation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposition_id) REFERENCES communication(id)
);
