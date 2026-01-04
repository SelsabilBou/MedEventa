-- ============================================
-- MedEventa COMPLETE Database Export
-- Generated: 2026-01-04T18:13:02.703Z
-- Database: event_management
-- ALL 31 TABLES INCLUDED
-- ============================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


-- ============================================
-- Table: animateur_evenement
-- ============================================

DROP TABLE IF EXISTS `animateur_evenement`;
CREATE TABLE `animateur_evenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evenement_id` (`evenement_id`,`utilisateur_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `animateur_evenement_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `animateur_evenement_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table animateur_evenement (2 rows)
INSERT INTO `animateur_evenement` (`id`, `evenement_id`, `utilisateur_id`) VALUES (2, 11, 19);
INSERT INTO `animateur_evenement` (`id`, `evenement_id`, `utilisateur_id`) VALUES (3, 15, 20);


-- ============================================
-- Table: attestation
-- ============================================

DROP TABLE IF EXISTS `attestation`;
CREATE TABLE `attestation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int(11) NOT NULL,
  `evenement_id` int(11) NOT NULL,
  `workshop_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `date_generation` date DEFAULT curdate(),
  `fichier_pdf` varchar(255) NOT NULL,
  `unique_code` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`unique_code`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `workshop_id` (`workshop_id`),
  CONSTRAINT `attestation_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attestation_ibfk_2` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attestation_ibfk_3` FOREIGN KEY (`workshop_id`) REFERENCES `workshop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in attestation


-- ============================================
-- Table: choix_sondage
-- ============================================

DROP TABLE IF EXISTS `choix_sondage`;
CREATE TABLE `choix_sondage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sondage_id` int(11) NOT NULL,
  `libelle` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sondage_id` (`sondage_id`),
  CONSTRAINT `choix_sondage_ibfk_1` FOREIGN KEY (`sondage_id`) REFERENCES `sondage` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table choix_sondage (4 rows)
INSERT INTO `choix_sondage` (`id`, `sondage_id`, `libelle`) VALUES (1, 1, 'Excellent');
INSERT INTO `choix_sondage` (`id`, `sondage_id`, `libelle`) VALUES (2, 1, 'Good');
INSERT INTO `choix_sondage` (`id`, `sondage_id`, `libelle`) VALUES (3, 1, 'Average');
INSERT INTO `choix_sondage` (`id`, `sondage_id`, `libelle`) VALUES (4, 1, 'Poor');


-- ============================================
-- Table: comite_scientifique
-- ============================================

DROP TABLE IF EXISTS `comite_scientifique`;
CREATE TABLE `comite_scientifique` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `comite_scientifique_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table comite_scientifique (15 rows)
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (1, 1, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (2, 2, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (3, 3, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (4, 4, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (5, 5, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (6, 6, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (7, 7, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (8, 8, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (9, 9, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (10, 10, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (11, 11, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (12, 12, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (13, 13, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (14, 14, NULL);
INSERT INTO `comite_scientifique` (`id`, `evenement_id`, `nom`) VALUES (15, 15, NULL);


-- ============================================
-- Table: communication
-- ============================================

DROP TABLE IF EXISTS `communication`;
CREATE TABLE `communication` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) NOT NULL,
  `resume` text DEFAULT NULL,
  `type` enum('orale','affiche','poster') DEFAULT NULL,
  `fichier_pdf` varchar(255) DEFAULT NULL,
  `etat` enum('en_attente','acceptee','refusee','en_revision','retire') DEFAULT 'en_attente',
  `auteur_id` int(11) DEFAULT NULL,
  `evenement_id` int(11) DEFAULT NULL,
  `decided_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auteur_id` (`auteur_id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `decided_by` (`decided_by`),
  KEY `fk_communication_session` (`session_id`),
  CONSTRAINT `communication_ibfk_1` FOREIGN KEY (`auteur_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `communication_ibfk_2` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`),
  CONSTRAINT `communication_ibfk_3` FOREIGN KEY (`decided_by`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `fk_communication_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table communication (8 rows)
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (1, 'AI-Driven Diagnosis in Emergency Medicine', 'This study explores the application of artificial intelligence algorithms in emergency medical diagnosis, demonstrating a 25% improvement in diagnostic accuracy.', 'orale', NULL, 'acceptee', 9, 1, NULL, '2025-12-30 23:23:30', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (2, 'Novel Approaches to Cardiac Imaging', 'Presentation of new cardiac imaging techniques using advanced MRI protocols and machine learning analysis.', 'poster', NULL, 'acceptee', 10, 1, NULL, '2025-12-30 23:23:30', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (3, 'Robotic Surgery Outcomes in Minimally Invasive Procedures', 'Comparative analysis of patient outcomes in robotic-assisted vs traditional minimally invasive surgical procedures.', 'orale', NULL, 'en_attente', 13, 1, NULL, '2025-12-30 23:23:30', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (4, 'OO', 'OO', '', 'C:\\Users\\DELL\\Desktop\\3.04\\FRONT-MEDEVENTA-main\\FRONT-MEDEVENTA-main\\MedEventa-main\\uploads\\submissions\\d68b2e6b0554e1b8eabf6986f98a54d0-1767499883632.pdf', 'en_attente', 29, 15, NULL, '2026-01-04 04:11:23', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (5, 'OO', 'II', '', 'C:\\Users\\DELL\\Desktop\\3.04\\FRONT-MEDEVENTA-main\\FRONT-MEDEVENTA-main\\MedEventa-main\\uploads\\submissions\\d8850adc2d0b849b94489ecb05363418-1767504264893.pdf', 'en_attente', 29, 5, NULL, '2026-01-04 05:24:24', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (6, 'XX', 'GG', '', 'C:\\Users\\DELL\\Desktop\\3.04\\FRONT-MEDEVENTA-main\\FRONT-MEDEVENTA-main\\MedEventa-main\\uploads\\submissions\\3f282054b8fac166920e003e2b9d33cf-1767505471746.pdf', 'en_attente', 29, 15, NULL, '2026-01-04 05:44:31', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (7, 'jlkfjkl', 'oo', '', 'C:\\Users\\DELL\\Desktop\\3.04\\FRONT-MEDEVENTA-main\\FRONT-MEDEVENTA-main\\MedEventa-main\\uploads\\submissions\\be9b14416ccb63ac08fa8fa5b3604a8e-1767523695058.pdf', 'en_attente', 29, 6, NULL, '2026-01-04 10:48:15', NULL);
INSERT INTO `communication` (`id`, `titre`, `resume`, `type`, `fichier_pdf`, `etat`, `auteur_id`, `evenement_id`, `decided_by`, `updated_at`, `session_id`) VALUES (8, 'yoyo', 'yoyoy', '', 'C:\\Users\\DELL\\Desktop\\3.04\\FRONT-MEDEVENTA-main\\FRONT-MEDEVENTA-main\\MedEventa-main\\uploads\\submissions\\c07020a00328368e06d1cd38e65a61a9-1767524031534.pdf', 'acceptee', 29, 15, 18, '2026-01-04 12:07:18', NULL);


-- ============================================
-- Table: evaluation
-- ============================================

DROP TABLE IF EXISTS `evaluation`;
CREATE TABLE `evaluation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `communication_id` int(11) NOT NULL,
  `membre_comite_id` int(11) NOT NULL,
  `note` int(11) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `decision` enum('accepter','refuser','corriger') DEFAULT NULL,
  `date_evaluation` date DEFAULT NULL,
  `pertinence` int(11) DEFAULT NULL,
  `qualite_scientifique` int(11) DEFAULT NULL,
  `originalite` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `communication_id` (`communication_id`),
  KEY `membre_comite_id` (`membre_comite_id`),
  CONSTRAINT `evaluation_ibfk_1` FOREIGN KEY (`communication_id`) REFERENCES `communication` (`id`),
  CONSTRAINT `evaluation_ibfk_2` FOREIGN KEY (`membre_comite_id`) REFERENCES `membre_comite` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table evaluation (27 rows)
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (1, 1, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (2, 2, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (3, 3, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (4, 1, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (5, 2, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (6, 3, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (7, 4, 35, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (8, 4, 36, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (9, 4, 37, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (10, 4, 38, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (11, 4, 53, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (12, 5, 9, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (13, 5, 24, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (14, 5, 43, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (15, 6, 35, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (16, 6, 36, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (17, 6, 37, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (18, 6, 38, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (19, 6, 53, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (20, 7, 10, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (21, 7, 25, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (22, 7, 44, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (23, 8, 35, NULL, 'CHECK THE MISSING DETAILS', 'accepter', '2026-01-03 23:00:00', 5, 3, 1);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (24, 8, 36, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (25, 8, 37, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (26, 8, 38, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO `evaluation` (`id`, `communication_id`, `membre_comite_id`, `note`, `commentaire`, `decision`, `date_evaluation`, `pertinence`, `qualite_scientifique`, `originalite`) VALUES (27, 8, 53, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);


-- ============================================
-- Table: evenement
-- ============================================

DROP TABLE IF EXISTS `evenement`;
CREATE TABLE `evenement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `lieu` varchar(255) DEFAULT NULL,
  `thematique` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `id_organisateur` int(11) DEFAULT NULL,
  `date_limite_communication` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_organisateur` (`id_organisateur`),
  CONSTRAINT `evenement_ibfk_1` FOREIGN KEY (`id_organisateur`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table evenement (15 rows)
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (1, 'MEDEVENTA 2024 - International Medical Congress', 'The MEDEVENTA 2024 Congress brings together healthcare professionals, researchers, and innovators from around the world to share the latest advances in medicine. This edition focuses on the digital transformation of healthcare, artificial intelligence applied to diagnostics, and new personalized therapies.', '2026-02-13 23:00:00', '2026-02-17 23:00:00', 'Paris Convention Center, 1 Avenue de la Convention, 75015 Paris, France', 'Digital Health & Medical Innovation', 'contact@medeventa.com', 1, '2024-03-15 22:59:59');
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (2, 'AI in Healthcare Summit 2026', 'Description for AI in Healthcare Summit 2026', '2026-02-19 23:00:00', '2026-02-21 23:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (3, 'Mental Health & Wellness Summit', 'Description for Mental Health & Wellness Summit', '2026-03-07 23:00:00', '2026-03-09 23:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (4, 'Depression & Anxiety Research Forum', 'Description for Depression & Anxiety Research Forum', '2026-03-02 23:00:00', '2026-03-04 23:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (5, 'Pediatric Oncology Conference', 'Description for Pediatric Oncology Conference', '2026-04-14 22:00:00', '2026-04-16 22:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (6, 'Pediatric Care Innovation Forum', 'Description for Pediatric Care Innovation Forum', '2026-04-04 22:00:00', '2026-04-06 22:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (7, 'Cardiovascular Medicine Summit', 'Description for Cardiovascular Medicine Summit', '2026-05-19 22:00:00', '2026-05-21 22:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (8, 'Neuroscience Research Week', 'Description for Neuroscience Research Week', '2026-06-09 22:00:00', '2026-06-11 22:00:00', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (9, 'cancer latest researches', 'important ', '2026-01-09 23:00:00', '2026-01-13 23:00:00', 'constantine mariott', 'Medcine interne', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (10, 'Iot in Medcine', 'the latest Iot utiles that helps medcine', '2026-01-10 23:00:00', '2026-01-12 23:00:00', 'Constantine Zénith', 'Neurology', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (11, 'Iot in Medcine', 'the latest Iot utiles that helps medcine', '2026-01-10 23:00:00', '2026-01-12 23:00:00', 'Constantine Zénith', 'Neurology', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (12, 'Congrès International IA & Santé 2026', 'Conférence internationale sur l''intelligence artificielle appliquée à la santé publique. Thèmes : diagnostic assisté, télémédecine, analyse prédictive des épidémies, éthique IA.', '2026-02-20 23:00:00', '2026-02-23 23:00:00', 'Constantine', 'Neurology', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (13, 'Journées Algériennes de Télémédecine et Santé Digitale 2026', 'Événement scientifique national dédié à la télémédecine, aux dossiers médicaux électroniques et aux applications mobiles en santé. Sessions plénières, communications orales, posters et ateliers pratiques.', '2026-01-02 23:00:00', '2026-01-04 23:00:00', 'TESBESSA', 'Télémédecine et Santé Digitale', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (14, 'med', 'guuhj', '2026-01-15 23:00:00', '2026-01-17 23:00:00', 'Constantine', 'sci', NULL, 17, NULL);
INSERT INTO `evenement` (`id`, `titre`, `description`, `date_debut`, `date_fin`, `lieu`, `thematique`, `contact`, `id_organisateur`, `date_limite_communication`) VALUES (15, 'Ai horizons', 'later', '2026-01-09 23:00:00', '2026-01-11 23:00:00', 'Zénith ', 'Neurology', NULL, 16, NULL);


-- ============================================
-- Table: feedback
-- ============================================

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `evenement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in feedback


-- ============================================
-- Table: inscription
-- ============================================

DROP TABLE IF EXISTS `inscription`;
CREATE TABLE `inscription` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) NOT NULL,
  `evenement_id` int(11) NOT NULL,
  `statut_paiement` enum('a_payer','paye_sur_place','paye') DEFAULT NULL,
  `badge` varchar(255) DEFAULT NULL,
  `date_inscription` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `participant_id` (`participant_id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `inscription_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `inscription_ibfk_2` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table inscription (10 rows)
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (4, 16, 2, 'a_payer', '1862b9c7-22af-4c25-8497-7889950ad2fd', '2025-12-30 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (5, 16, 1, 'a_payer', '2e7b13d0-3825-4d4b-995b-b55d0847ba0e', '2025-12-30 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (6, 16, 13, 'a_payer', 'd885f758-f3cc-4a56-a095-22652bccf189', '2026-01-01 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (7, 24, 1, 'a_payer', '91267114-8ac8-4657-a776-edd272a097ab', '2026-01-01 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (8, 25, 1, 'a_payer', '82ccab1e-18f1-4638-95d3-397a2d7179c3', '2026-01-01 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (9, 16, 6, 'a_payer', '67df6059-e41b-49f4-aec9-c7ef989e579e', '2026-01-01 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (10, 28, 15, 'a_payer', '530215a6-400e-4b3a-9f7c-44d46b777887', '2026-01-03 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (11, 28, 13, 'a_payer', '1dc50ed5-0050-41ab-8645-4e06f677df54', '2026-01-03 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (12, 28, 1, 'a_payer', '4ade3211-09c1-474f-8e36-66f94fb75339', '2026-01-03 23:00:00');
INSERT INTO `inscription` (`id`, `participant_id`, `evenement_id`, `statut_paiement`, `badge`, `date_inscription`) VALUES (13, 28, 5, 'a_payer', '43f6bcd1-3e3c-4cee-a291-1cf8c5662fb0', '2026-01-03 23:00:00');


-- ============================================
-- Table: inscription_workshop
-- ============================================

DROP TABLE IF EXISTS `inscription_workshop`;
CREATE TABLE `inscription_workshop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `presence` tinyint(1) DEFAULT 0,
  `confirmation_status` enum('pending','confirmed') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `participant_id` (`participant_id`),
  KEY `workshop_id` (`workshop_id`),
  CONSTRAINT `inscription_workshop_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `inscription_workshop_ibfk_2` FOREIGN KEY (`workshop_id`) REFERENCES `workshop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table inscription_workshop (5 rows)
INSERT INTO `inscription_workshop` (`id`, `participant_id`, `workshop_id`, `presence`, `confirmation_status`) VALUES (1, 16, 1, 0, 'pending');
INSERT INTO `inscription_workshop` (`id`, `participant_id`, `workshop_id`, `presence`, `confirmation_status`) VALUES (2, 28, 15, 0, 'pending');
INSERT INTO `inscription_workshop` (`id`, `participant_id`, `workshop_id`, `presence`, `confirmation_status`) VALUES (3, 28, 7, 0, 'pending');
INSERT INTO `inscription_workshop` (`id`, `participant_id`, `workshop_id`, `presence`, `confirmation_status`) VALUES (4, 28, 14, 0, 'pending');
INSERT INTO `inscription_workshop` (`id`, `participant_id`, `workshop_id`, `presence`, `confirmation_status`) VALUES (5, 28, 16, 1, 'confirmed');


-- ============================================
-- Table: inscription_workshop_attente
-- ============================================

DROP TABLE IF EXISTS `inscription_workshop_attente`;
CREATE TABLE `inscription_workshop_attente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `participant_id` (`participant_id`,`workshop_id`),
  KEY `workshop_id` (`workshop_id`),
  CONSTRAINT `inscription_workshop_attente_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `inscription_workshop_attente_ibfk_2` FOREIGN KEY (`workshop_id`) REFERENCES `workshop` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in inscription_workshop_attente


-- ============================================
-- Table: invite
-- ============================================

DROP TABLE IF EXISTS `invite`;
CREATE TABLE `invite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `evenement_id` int(11) NOT NULL,
  `sujet_conference` varchar(255) DEFAULT NULL,
  `utilisateur_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `invite_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invite_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in invite


-- ============================================
-- Table: membre_comite
-- ============================================

DROP TABLE IF EXISTS `membre_comite`;
CREATE TABLE `membre_comite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int(11) NOT NULL,
  `comite_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `comite_id` (`comite_id`),
  CONSTRAINT `membre_comite_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `membre_comite_ibfk_2` FOREIGN KEY (`comite_id`) REFERENCES `comite_scientifique` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table membre_comite (50 rows)
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (1, 2, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (2, 3, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (3, 4, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (4, 5, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (5, 18, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (6, 18, 2);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (7, 18, 3);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (8, 18, 4);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (9, 18, 5);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (10, 18, 6);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (11, 18, 7);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (12, 18, 8);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (13, 18, 9);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (14, 18, 10);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (15, 18, 11);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (16, 18, 12);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (17, 18, 13);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (20, 18, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (21, 18, 2);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (22, 18, 3);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (23, 18, 4);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (24, 18, 5);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (25, 18, 6);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (26, 18, 7);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (27, 18, 8);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (28, 18, 9);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (29, 18, 10);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (30, 18, 11);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (31, 18, 12);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (32, 18, 13);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (35, 18, 15);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (36, 18, 15);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (37, 4, 15);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (38, 22, 15);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (39, 18, 1);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (40, 18, 2);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (41, 18, 3);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (42, 18, 4);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (43, 18, 5);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (44, 18, 6);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (45, 18, 7);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (46, 18, 8);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (47, 18, 9);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (48, 18, 10);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (49, 18, 11);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (50, 18, 12);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (51, 18, 13);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (53, 18, 15);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (54, 18, 14);
INSERT INTO `membre_comite` (`id`, `utilisateur_id`, `comite_id`) VALUES (55, 22, 14);


-- ============================================
-- Table: message_interne
-- ============================================

DROP TABLE IF EXISTS `message_interne`;
CREATE TABLE `message_interne` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expediteur_id` int(11) NOT NULL,
  `destinataire_id` int(11) NOT NULL,
  `evenement_id` int(11) DEFAULT NULL,
  `contenu` text NOT NULL,
  `date_envoi` datetime DEFAULT NULL,
  `type` enum('notif','reponse','modif_prog') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinataire_id` (`destinataire_id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `message_interne_ibfk_1` FOREIGN KEY (`expediteur_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `message_interne_ibfk_2` FOREIGN KEY (`destinataire_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `message_interne_ibfk_3` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table message_interne (5 rows)
INSERT INTO `message_interne` (`id`, `expediteur_id`, `destinataire_id`, `evenement_id`, `contenu`, `date_envoi`, `type`) VALUES (1, 17, 17, 13, 'Replying to your question: "Test question for Event 13 from script"

', '2026-01-02 23:30:25', 'reponse');
INSERT INTO `message_interne` (`id`, `expediteur_id`, `destinataire_id`, `evenement_id`, `contenu`, `date_envoi`, `type`) VALUES (2, 17, 17, 15, 'Replying to your question: "How does the AI affect medecin"

it is helpful for it', '2026-01-02 23:45:51', 'reponse');
INSERT INTO `message_interne` (`id`, `expediteur_id`, `destinataire_id`, `evenement_id`, `contenu`, `date_envoi`, `type`) VALUES (3, 17, 17, 15, 'Replying to your question: "How to implement ai in mde?"

IT IS ', '2026-01-02 23:53:12', 'reponse');
INSERT INTO `message_interne` (`id`, `expediteur_id`, `destinataire_id`, `evenement_id`, `contenu`, `date_envoi`, `type`) VALUES (4, 17, 17, 15, 'Replying to your question: "How to implement ai in mdC?"
YES IT IS

', '2026-01-02 23:55:25', 'reponse');
INSERT INTO `message_interne` (`id`, `expediteur_id`, `destinataire_id`, `evenement_id`, `contenu`, `date_envoi`, `type`) VALUES (5, 20, 28, 15, 'HI', '2026-01-04 03:02:00', 'notif');


-- ============================================
-- Table: notification
-- ============================================

DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int(11) NOT NULL,
  `evenement_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  `lu` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table notification (29 rows)
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (1, 14, NULL, 'test_type', 'Test Message', '2026-01-01 23:16:20', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (2, 17, 15, 'new_message', 'Vous avez reçu un nouveau message', '2026-01-02 23:53:12', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (3, 17, 15, 'new_message', 'Vous avez reçu un nouveau message', '2026-01-02 23:55:25', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (4, 28, 1, 'registration', 'Vous êtes inscrit à l''événement.', '2026-01-04 02:12:28', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (5, 28, 5, 'registration', 'Vous êtes inscrit à l''événement.', '2026-01-04 02:15:25', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (6, 28, 15, 'workshop_registration', 'Vous êtes inscrit au workshop: LATEST AI RES', '2026-01-04 02:29:48', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (7, 28, 15, 'workshop_registration', 'Vous êtes inscrit au workshop: WKSHP', '2026-01-04 03:01:07', 1);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (8, 29, NULL, 'submission_accepted', 'Your submission "yoyo" for "Ai horizons" has been acceptee.', '2026-01-04 12:07:18', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (9, 8, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (10, 20, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (11, 4, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (12, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (13, 8, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (14, 20, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (15, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (16, 20, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (17, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (18, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (19, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (20, 13, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (21, 4, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (22, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (23, 11, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (24, 1, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (25, 19, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (26, 19, 13, 'workshop_assignment', 'Vous avez été choisi comme responsable pour un workshop.', '2026-01-04 15:48:21', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (27, 18, 14, 'committee_invite', 'Vous avez été ajouté au comité scientifique d''un événement.', '2026-01-04 15:50:28', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (28, 22, 14, 'committee_invite', 'Vous avez été ajouté au comité scientifique d''un événement.', '2026-01-04 15:50:28', 0);
INSERT INTO `notification` (`id`, `utilisateur_id`, `evenement_id`, `type`, `message`, `date_creation`, `lu`) VALUES (29, 16, 14, 'session_created', 'Votre session "med " a été créée avec succès.', '2026-01-04 15:55:28', 0);


-- ============================================
-- Table: password_reset_token
-- ============================================

DROP TABLE IF EXISTS `password_reset_token`;
CREATE TABLE `password_reset_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_reset_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in password_reset_token


-- ============================================
-- Table: proposition_history
-- ============================================

DROP TABLE IF EXISTS `proposition_history`;
CREATE TABLE `proposition_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `action` enum('CREATE','UPDATE','STATUS_CHANGE','WITHDRAW') NOT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `changed_by` int(11) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `proposition_history_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `communication` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table proposition_history (5 rows)
INSERT INTO `proposition_history` (`id`, `submission_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES (1, 4, 'CREATE', NULL, '{"titre":"OO","resume":"OO","type":"oral","fichier_pdf":"C:\\\\Users\\\\DELL\\\\Desktop\\\\3.04\\\\FRONT-MEDEVENTA-main\\\\FRONT-MEDEVENTA-main\\\\MedEventa-main\\\\uploads\\\\submissions\\\\d68b2e6b0554e1b8eabf6986f98a54d0-1767499883632.pdf","etat":"en_attente","auteur_id":29,"evenement_id":15}', 29, '2026-01-04 04:11:23');
INSERT INTO `proposition_history` (`id`, `submission_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES (2, 5, 'CREATE', NULL, '{"titre":"OO","resume":"II","type":"oral","fichier_pdf":"C:\\\\Users\\\\DELL\\\\Desktop\\\\3.04\\\\FRONT-MEDEVENTA-main\\\\FRONT-MEDEVENTA-main\\\\MedEventa-main\\\\uploads\\\\submissions\\\\d8850adc2d0b849b94489ecb05363418-1767504264893.pdf","etat":"en_attente","auteur_id":29,"evenement_id":5}', 29, '2026-01-04 05:24:24');
INSERT INTO `proposition_history` (`id`, `submission_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES (3, 6, 'CREATE', NULL, '{"titre":"XX","resume":"GG","type":"oral","fichier_pdf":"C:\\\\Users\\\\DELL\\\\Desktop\\\\3.04\\\\FRONT-MEDEVENTA-main\\\\FRONT-MEDEVENTA-main\\\\MedEventa-main\\\\uploads\\\\submissions\\\\3f282054b8fac166920e003e2b9d33cf-1767505471746.pdf","etat":"en_attente","auteur_id":29,"evenement_id":15}', 29, '2026-01-04 05:44:31');
INSERT INTO `proposition_history` (`id`, `submission_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES (4, 7, 'CREATE', NULL, '{"titre":"jlkfjkl","resume":"oo","type":"oral","fichier_pdf":"C:\\\\Users\\\\DELL\\\\Desktop\\\\3.04\\\\FRONT-MEDEVENTA-main\\\\FRONT-MEDEVENTA-main\\\\MedEventa-main\\\\uploads\\\\submissions\\\\be9b14416ccb63ac08fa8fa5b3604a8e-1767523695058.pdf","etat":"en_attente","auteur_id":29,"evenement_id":6}', 29, '2026-01-04 10:48:15');
INSERT INTO `proposition_history` (`id`, `submission_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES (5, 8, 'CREATE', NULL, '{"titre":"yoyo","resume":"yoyoy","type":"oral","fichier_pdf":"C:\\\\Users\\\\DELL\\\\Desktop\\\\3.04\\\\FRONT-MEDEVENTA-main\\\\FRONT-MEDEVENTA-main\\\\MedEventa-main\\\\uploads\\\\submissions\\\\c07020a00328368e06d1cd38e65a61a9-1767524031534.pdf","etat":"en_attente","auteur_id":29,"evenement_id":15}', 29, '2026-01-04 10:53:51');


-- ============================================
-- Table: question
-- ============================================

DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `question_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`),
  CONSTRAINT `question_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table question (6 rows)
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (1, 1, 14, 'Will the presentations be available online after the conference?', '2025-12-30 23:23:30');
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (2, 1, 15, 'Are there any networking events planned for participants?', '2025-12-30 23:23:30');
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (3, 1, 14, 'What are the CME credits available for this conference?', '2025-12-30 23:23:30');
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (4, 15, 17, 'How does the AI affect medecin', '2026-01-02 21:24:11');
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (5, 15, 17, 'How to implement ai in mde?', '2026-01-02 22:15:12');
INSERT INTO `question` (`id`, `evenement_id`, `utilisateur_id`, `contenu`, `date_creation`) VALUES (6, 13, 17, 'Test question for Event 13 from script', '2026-01-02 22:20:56');


-- ============================================
-- Table: rapport_evaluation
-- ============================================

DROP TABLE IF EXISTS `rapport_evaluation`;
CREATE TABLE `rapport_evaluation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proposition_id` int(11) NOT NULL,
  `contenu_rapport` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contenu_rapport`)),
  `date_generation` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `proposition_id` (`proposition_id`),
  CONSTRAINT `rapport_evaluation_ibfk_1` FOREIGN KEY (`proposition_id`) REFERENCES `communication` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in rapport_evaluation


-- ============================================
-- Table: reponse_sondage
-- ============================================

DROP TABLE IF EXISTS `reponse_sondage`;
CREATE TABLE `reponse_sondage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int(11) NOT NULL,
  `sondage_id` int(11) NOT NULL,
  `choix_id` int(11) NOT NULL,
  `date_reponse` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  KEY `sondage_id` (`sondage_id`),
  KEY `choix_id` (`choix_id`),
  CONSTRAINT `reponse_sondage_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`),
  CONSTRAINT `reponse_sondage_ibfk_2` FOREIGN KEY (`sondage_id`) REFERENCES `sondage` (`id`),
  CONSTRAINT `reponse_sondage_ibfk_3` FOREIGN KEY (`choix_id`) REFERENCES `choix_sondage` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in reponse_sondage


-- ============================================
-- Table: session
-- ============================================

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `horaire` datetime DEFAULT NULL,
  `salle` varchar(80) DEFAULT NULL,
  `president_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `president_id` (`president_id`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`),
  CONSTRAINT `session_ibfk_2` FOREIGN KEY (`president_id`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table session (20 rows)
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (1, 1, 'The Post-Cloud Era in Healthcare', '2026-02-15 13:00:00', 'Emerald Hall', 9);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (2, 1, 'Scaling Healthcare Systems to 10M Users', '2026-02-15 13:00:00', 'Emerald Hall', 10);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (3, 1, 'AI and Machine Learning in Diagnostics', '2026-02-15 13:00:00', 'Sapphire Room', 7);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (4, 1, 'Poster session: Neuroscience Advances', '2026-02-15 13:00:00', 'Poster Hall', NULL);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (5, 1, 'Roundtable: Ethics in Digital Health', '2026-02-15 13:00:00', 'Conference Room A', 2);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (6, 1, 'Clinical Trials Workshop', '2026-02-15 13:00:00', 'Conference Room B', 13);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (7, 2, 'Opening Plenary - AI in Healthcare Summit 2026', '2026-02-20 08:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (8, 3, 'Opening Plenary - Mental Health & Wellness Summit', '2026-03-08 08:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (9, 4, 'Opening Plenary - Depression & Anxiety Research Forum', '2026-03-03 08:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (10, 5, 'Opening Plenary - Pediatric Oncology Conference', '2026-04-15 07:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (11, 6, 'Opening Plenary - Pediatric Care Innovation Forum', '2026-04-05 07:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (12, 7, 'Opening Plenary - Cardiovascular Medicine Summit', '2026-05-20 07:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (13, 8, 'Opening Plenary - Neuroscience Research Week', '2026-06-10 07:00:00', 'Grand Ballroom', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (14, 9, 'medecine', '2026-01-12 12:00:00', 'hall A', 1);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (15, 10, 'IOT LATEST', '2026-01-13 00:15:00', 'A1', 4);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (17, 15, 'AI SESSION', '2026-01-10 19:41:00', 'A2', 10);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (18, 13, 'Digital Health Architectures', '2026-01-02 08:00:00', 'Hall d''Honneur', 7);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (19, 13, 'Tele-radiology Standards', '2026-01-02 10:00:00', 'Salle 102', 9);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (20, 13, 'Mobile Health for Chronic Care', '2026-01-03 13:00:00', 'Hall Central', 10);
INSERT INTO `session` (`id`, `evenement_id`, `titre`, `horaire`, `salle`, `president_id`) VALUES (30, 14, 'med ', '2026-01-15 15:55:00', 'S1', 29);


-- ============================================
-- Table: session_intervenant
-- ============================================

DROP TABLE IF EXISTS `session_intervenant`;
CREATE TABLE `session_intervenant` (
  `session_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  PRIMARY KEY (`session_id`,`utilisateur_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `session_intervenant_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_intervenant_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in session_intervenant


-- ============================================
-- Table: sondage
-- ============================================

DROP TABLE IF EXISTS `sondage`;
CREATE TABLE `sondage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `date_creation` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `sondage_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table sondage (1 rows)
INSERT INTO `sondage` (`id`, `evenement_id`, `titre`, `type`, `date_creation`) VALUES (1, 1, 'Event Satisfaction Survey', 'satisfaction', '2025-12-30 23:23:30');


-- ============================================
-- Table: statistique
-- ============================================

DROP TABLE IF EXISTS `statistique`;
CREATE TABLE `statistique` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `nb_soumissions` int(11) DEFAULT NULL,
  `taux_acceptation` float DEFAULT NULL,
  `repartition_par_institution` text DEFAULT NULL,
  `participation_par_pays` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  CONSTRAINT `statistique_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in statistique


-- ============================================
-- Table: survey
-- ============================================

DROP TABLE IF EXISTS `survey`;
CREATE TABLE `survey` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_survey_event` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table survey (1 rows)
INSERT INTO `survey` (`id`, `event_id`, `title`, `description`, `created_at`, `updated_at`) VALUES (1, 13, 'Ai Session', NULL, '2026-01-02 21:04:52', '2026-01-02 21:04:52');


-- ============================================
-- Table: survey_question
-- ============================================

DROP TABLE IF EXISTS `survey_question`;
CREATE TABLE `survey_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('text','rating','yesno','multiple') DEFAULT 'text',
  PRIMARY KEY (`id`),
  KEY `idx_survey_question_survey` (`survey_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table survey_question (1 rows)
INSERT INTO `survey_question` (`id`, `survey_id`, `question_text`, `question_type`) VALUES (1, 1, 'How was it?', 'text');


-- ============================================
-- Table: survey_response
-- ============================================

DROP TABLE IF EXISTS `survey_response`;
CREATE TABLE `survey_response` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_survey_response_survey` (`survey_id`),
  KEY `idx_survey_response_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in survey_response


-- ============================================
-- Table: utilisateur
-- ============================================

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','ORGANISATEUR','COMMUNICANT','PARTICIPANT','MEMBRE_COMITE','INVITE','RESP_WORKSHOP') NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `domaine_recherche` varchar(255) DEFAULT NULL,
  `biographie` text DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table utilisateur (29 rows)
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (1, 'Dupont', 'Marie', 'marie.dupont@medeventa.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'ORGANISATEUR', NULL, 'MEDEVENTA Organization', 'Event Management', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (2, 'Laurent', 'Marie', 'marie.laurent@hospital-paris.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'University Hospital of Paris', 'Neurology', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (3, 'Dubois', 'Jean-Marc', 'jm.dubois@research-institute.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Medical Research Institute', 'Cardiology', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (4, 'Bernard', 'Sophie', 'sophie.bernard@lyon-medical.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Lyon Medical School', 'Pediatrics', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (5, 'Moreau', 'Thomas', 'thomas.moreau@bordeaux-hospital.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Bordeaux University Hospital', 'Surgery', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (6, 'Johnson', 'Michael', 'michael.johnson@harvard.edu', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'Harvard Medical School', 'Personalized Medicine', NULL, 'USA', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (7, 'Rossi', 'Elena', 'elena.rossi@unimi.it', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'University of Milan', 'AI in Diagnostics', NULL, 'Italy', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (8, 'Tanaka', 'Kenji', 'kenji.tanaka@tokyo-hospital.jp', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'Tokyo University Hospital', 'Robotic Surgery', NULL, 'Japan', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (9, 'Thorne', 'Aris', 'aris.thorne@quantumdynamics.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'Quantum Dynamics', 'Quantum Computing Healthcare', NULL, 'USA', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (10, 'Chen', 'Marcus', 'marcus.chen@cloudscale.sg', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'CloudScale', 'Healthcare Infrastructure', NULL, 'Singapore', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (11, 'Rodriguez', 'Elena', 'elena.rodriguez@creativestudio.es', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'RESP_WORKSHOP', NULL, 'Creative Studio', 'Medical UX Design', NULL, 'Spain', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (12, 'Johnson', 'Sarah', 'sarah.johnson@datavis.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'RESP_WORKSHOP', NULL, 'DataVis Solutions', 'Medical Data Visualization', NULL, 'USA', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (13, 'Chen', 'Robert', 'robert.chen@clinicaltrials.org', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'Clinical Trials Institute', 'Clinical Research', NULL, 'USA', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (14, 'Martin', 'Alice', 'alice.martin@gmail.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'PARTICIPANT', NULL, 'General Hospital', 'General Medicine', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (15, 'Dubois', 'Pierre', 'pierre.dubois@gmail.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'PARTICIPANT', NULL, 'City Clinic', 'Internal Medicine', NULL, 'France', NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (16, 'AYA', 'KETTAB', 'ketttesni@gmail.com', '$2a$10$Qo/AWb/cnLy/QGOX3rWh0e9diamwEdf3NZfs40pTZGlKmX8Cqdzxa', 'SUPER_ADMIN', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (17, 'bissane', 'ayoun', 'aya_tesnim.kettab@univ-constantine2.dz', '$2a$10$otSm1mgKStqhONba.JvWyuNyQxmbNrcrb5hLy9UN7uPmNrvNsbeLm', 'ORGANISATEUR', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAMb+AAIAAAARAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABR29vZ2xlIEluYy4gMjAxNgAA/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJH', 'Laboratory', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (18, 'Ikram ', 'boutout', 'ikram.boutoute@univ-constantine2.dz', '$2a$10$AAA16qKbW/ZkKXB.lGBwEuOzrFbpocy9tue3jgBweQJ8dXvDilQeW', 'MEMBRE_COMITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAMb+AAIAAAARAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABR29vZ2xlIEluYy4gMjAxNgAA/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJH', 'Laboratory', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (19, 'FN', 'NFNG', 'armytesnim5@gmail.com', '$2a$10$pEpn3gorr8AtqFyYnDUeie1ld5smhzUHihvJ5/3GjHjpXhr5/kJsS', 'RESP_WORKSHOP', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (20, 'KETTAB', 'KETTAB', 'horizonskillsacademy@gmail.com', '$2a$10$XpMNvDIE4xDw2ZVOlnyz9ujm5r7AXqdhQ24KxKMsT77IuZte/teum', 'RESP_WORKSHOP', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (21, 'KETAB', 'TESNIM', 'kettabhana@gmail.com', '$2a$10$XYA/lAve9Is86oEYmvQkHOuRyMr6T.i7CZCGGkcus6FdO/ATR8NiO', 'INVITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QDJRXhpZgAASUkqAAgAAAADAA4BAgB/AAAAMgAAABoBBQABAAAAsQAAABsBBQABAAAAuQAAAAAAAABQaG90byBvZiBsYWR5IGdlbmVyYWwgcHJhY3RpdGlvbmVyIHBvaW50IHRodW1iIGVtcHR5IHNwYWNlIHByZXNlbnQgY292aWQgcHJvdGVjdGlvbiB2YWNjaW5hdGlv', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (22, 'hana', 'kettab', 'hana.kettab@univ-constantine2.dz', '$2a$10$Z6PfujWgstXZKkcnYZ60POJgSoEY87.BHEu5JAQa5MAVzO.gkOqQ6', 'MEMBRE_COMITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QCGRXhpZgAASUkqAAgAAAADAA4BAgA8AAAAMgAAABoBBQABAAAAbgAAABsBBQABAAAAdgAAAAAAAABBIHlvdW5nIGZlbWFsZSBkb2N0b3Igc21pbGluZyBoYXBweSB3aGlsZSBwb2ludGluZyBhYm92ZSBoZXIsAQAAAQAAACwBAAABAAAA/+EFsWh0dHA6Ly9ucy5hZG9i', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (23, 'Test', 'User', 'test_1767345587888@example.com', '$2a$10$yJetfXg4nlPNomGGFAs.SeqDX088laHsA8TXeHEdC.NcCqKkXfmfW', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (24, 'Test', 'User', 'test_1767345635727@example.com', '$2a$10$XkGQ4Lj18a93omG7vZqKOOFq4ORnjptfqEiJJXUSVIONa4gg78JHy', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (25, 'Test', 'User', 'test_1767345737711@example.com', '$2a$10$ybMNJlOf6di2sK/K0KPDxuB0Ts2dbjvRKlQ7wEvyqS5XqTZy7bELe', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (27, 'Boutout', 'Ikram', 'ikram@example.com', 'Ikram123!', 'MEMBRE_COMITE', NULL, 'University of Algiers', 'Medicine', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (28, 'Kettab', 'ahmed', 'aboudkettab@gmail.com', '$2a$10$RnmAw4i1urLXaVtewsFTqOZMSp73DdtgGpskxMc7R6iR4aQgASEqi', 'PARTICIPANT', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCALgAuADASIAAhEB', 'Laboratory', 'AAA', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (29, 'aya', 'author', 'testket34@gmail.com', '$2a$10$prfFSN/pCnvblF8aObgGUufA6SV2wGSt9kdn5DIWoPnkHrgr8OXci', 'COMMUNICANT', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', 'Laboratory', 'AAA', NULL, NULL, NULL, NULL);
INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `photo`, `institution`, `domaine_recherche`, `biographie`, `pays`, `reset_token_hash`, `reset_token_expires`) VALUES (30, 'Test', 'Admin', 'testadmin@medeventa.com', '$2a$10$X4pYjdu6hSgcS5iBNt.NPexCXUXQLduAVIey4ja3BUaGgNLXAqqWq', 'SUPER_ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL);


-- ============================================
-- Table: vote
-- ============================================

DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table vote (2 rows)
INSERT INTO `vote` (`id`, `question_id`, `user_id`, `created_at`) VALUES (1, 4, 17, '2026-01-02 21:50:29');
INSERT INTO `vote` (`id`, `question_id`, `user_id`, `created_at`) VALUES (2, 5, 17, '2026-01-02 22:15:15');


-- ============================================
-- Table: vote_question
-- ============================================

DROP TABLE IF EXISTS `vote_question`;
CREATE TABLE `vote_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `valeur` int(11) DEFAULT 1,
  `date_vote` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`,`utilisateur_id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `vote_question_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  CONSTRAINT `vote_question_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No data in vote_question


-- ============================================
-- Table: workshop
-- ============================================

DROP TABLE IF EXISTS `workshop`;
CREATE TABLE `workshop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evenement_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `responsable_id` int(11) NOT NULL,
  `date` datetime DEFAULT NULL,
  `salle` varchar(255) DEFAULT NULL,
  `level` enum('beginner','advanced') DEFAULT 'beginner',
  `price` decimal(10,2) DEFAULT 0.00,
  `nb_places` int(11) DEFAULT NULL,
  `ouvert` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `evenement_id` (`evenement_id`),
  KEY `responsable_id` (`responsable_id`),
  CONSTRAINT `workshop_ibfk_1` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`),
  CONSTRAINT `workshop_ibfk_2` FOREIGN KEY (`responsable_id`) REFERENCES `utilisateur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table workshop (18 rows)
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (1, 1, 'Design as a Competitive Edge in Medical Devices', NULL, 11, '2026-02-15 09:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (2, 1, 'Hands-on Surgical Robotics', NULL, 8, '2026-02-15 09:00:00', NULL, 'beginner', 0, 15, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (3, 1, 'Medical Data Visualization Techniques', NULL, 19, '2026-02-15 09:00:00', NULL, 'beginner', 0, 25, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (4, 2, 'Hands-on Workshop - AI in Healthcare Summit 2026', NULL, 1, '2026-02-20 13:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (5, 3, 'Hands-on Workshop - Mental Health & Wellness Summit', NULL, 1, '2026-03-08 13:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (6, 4, 'Hands-on Workshop - Depression & Anxiety Research Forum', NULL, 1, '2026-03-03 13:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (7, 5, 'Hands-on Workshop - Pediatric Oncology Conference', NULL, 1, '2026-04-15 12:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (8, 6, 'Hands-on Workshop - Pediatric Care Innovation Forum', NULL, 1, '2026-04-05 12:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (9, 7, 'Hands-on Workshop - Cardiovascular Medicine Summit', NULL, 1, '2026-05-20 12:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (10, 8, 'Hands-on Workshop - Neuroscience Research Week', NULL, 1, '2026-06-10 12:00:00', NULL, 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (11, 13, 'NEED', 'SOON', 20, '2026-01-03 04:33:00', 'A2', 'beginner', 1500, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (12, 13, 'MedEventa', NULL, 20, '2026-01-03 06:56:00', 'A1', 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (13, 15, 'ai workshop', NULL, 4, '2026-01-10 11:02:00', 'A1', 'beginner', 0, 20, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (14, 15, 'LATEST AI RES', NULL, 13, '2026-01-10 12:01:00', 'A1', 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (15, 15, 'TECHNIQUES OF AI', NULL, 19, '2026-01-10 21:49:00', 'A5', 'beginner', 0, 10, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (16, 15, 'WKSHP', 'FJELF', 20, '2026-01-10 11:00:00', 'A7', 'beginner', 0, 30, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (17, 13, 'Security in Digital Health', 'Deep dive into HIPAA and GDPR for health apps', 8, '2026-01-03 08:00:00', 'Laboratoire 2', 'beginner', 50, 15, 1);
INSERT INTO `workshop` (`id`, `evenement_id`, `titre`, `description`, `responsable_id`, `date`, `salle`, `level`, `price`, `nb_places`, `ouvert`) VALUES (18, 13, 'Practical Tele-Dermatology', 'Hands-on session using remote imaging tools', 4, '2026-01-02 13:00:00', 'Salle de Travaux Pratiques', 'beginner', 0, 25, 1);


SET FOREIGN_KEY_CHECKS=1;

-- ============================================
-- Export completed: 2026-01-04T18:13:02.761Z
-- Total tables: 31
-- ============================================
