-- Database Export: event_management
-- Export Date: 2026-01-04T03:18:34.949Z
-- Generated for team sharing

USE event_management;

-- Data for table: animateur_evenement
INSERT INTO animateur_evenement (id, evenement_id, utilisateur_id) VALUES (2, 11, 19);
INSERT INTO animateur_evenement (id, evenement_id, utilisateur_id) VALUES (3, 15, 20);

-- Table attestation has no data

-- Data for table: choix_sondage
INSERT INTO choix_sondage (id, sondage_id, libelle) VALUES (1, 1, 'Excellent');
INSERT INTO choix_sondage (id, sondage_id, libelle) VALUES (2, 1, 'Good');
INSERT INTO choix_sondage (id, sondage_id, libelle) VALUES (3, 1, 'Average');
INSERT INTO choix_sondage (id, sondage_id, libelle) VALUES (4, 1, 'Poor');

-- Data for table: comite_scientifique
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (1, 1, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (2, 2, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (3, 3, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (4, 4, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (5, 5, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (6, 6, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (7, 7, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (8, 8, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (9, 9, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (10, 10, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (11, 11, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (12, 12, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (13, 13, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (14, 14, NULL);
INSERT INTO comite_scientifique (id, evenement_id, nom) VALUES (15, 15, NULL);

-- Data for table: communication
INSERT INTO communication (id, titre, resume, type, fichier_pdf, etat, auteur_id, evenement_id, decided_by, updated_at, session_id) VALUES (1, 'AI-Driven Diagnosis in Emergency Medicine', 'This study explores the application of artificial intelligence algorithms in emergency medical diagnosis, demonstrating a 25% improvement in diagnostic accuracy.', 'orale', NULL, 'acceptee', 9, 1, NULL, '"2025-12-30T23:23:30.000Z"', NULL);
INSERT INTO communication (id, titre, resume, type, fichier_pdf, etat, auteur_id, evenement_id, decided_by, updated_at, session_id) VALUES (2, 'Novel Approaches to Cardiac Imaging', 'Presentation of new cardiac imaging techniques using advanced MRI protocols and machine learning analysis.', 'poster', NULL, 'acceptee', 10, 1, NULL, '"2025-12-30T23:23:30.000Z"', NULL);
INSERT INTO communication (id, titre, resume, type, fichier_pdf, etat, auteur_id, evenement_id, decided_by, updated_at, session_id) VALUES (3, 'Robotic Surgery Outcomes in Minimally Invasive Procedures', 'Comparative analysis of patient outcomes in robotic-assisted vs traditional minimally invasive surgical procedures.', 'orale', NULL, 'en_attente', 13, 1, NULL, '"2025-12-30T23:23:30.000Z"', NULL);

-- Data for table: evaluation
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (1, 1, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (2, 2, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (3, 3, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (4, 1, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (5, 2, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);
INSERT INTO evaluation (id, communication_id, membre_comite_id, note, commentaire, decision, date_evaluation, pertinence, qualite_scientifique, originalite) VALUES (6, 3, 5, NULL, NULL, 'corriger', NULL, NULL, NULL, NULL);

-- Data for table: evenement
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (1, 'MEDEVENTA 2024 - International Medical Congress', 'The MEDEVENTA 2024 Congress brings together healthcare professionals, researchers, and innovators from around the world to share the latest advances in medicine. This edition focuses on the digital transformation of healthcare, artificial intelligence applied to diagnostics, and new personalized therapies.', '"2026-02-13T23:00:00.000Z"', '"2026-02-17T23:00:00.000Z"', 'Paris Convention Center, 1 Avenue de la Convention, 75015 Paris, France', 'Digital Health & Medical Innovation', 'contact@medeventa.com', 1, '"2024-03-15T22:59:59.000Z"');
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (2, 'AI in Healthcare Summit 2026', 'Description for AI in Healthcare Summit 2026', '"2026-02-19T23:00:00.000Z"', '"2026-02-21T23:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (3, 'Mental Health & Wellness Summit', 'Description for Mental Health & Wellness Summit', '"2026-03-07T23:00:00.000Z"', '"2026-03-09T23:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (4, 'Depression & Anxiety Research Forum', 'Description for Depression & Anxiety Research Forum', '"2026-03-02T23:00:00.000Z"', '"2026-03-04T23:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (5, 'Pediatric Oncology Conference', 'Description for Pediatric Oncology Conference', '"2026-04-14T22:00:00.000Z"', '"2026-04-16T22:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (6, 'Pediatric Care Innovation Forum', 'Description for Pediatric Care Innovation Forum', '"2026-04-04T22:00:00.000Z"', '"2026-04-06T22:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (7, 'Cardiovascular Medicine Summit', 'Description for Cardiovascular Medicine Summit', '"2026-05-19T22:00:00.000Z"', '"2026-05-21T22:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (8, 'Neuroscience Research Week', 'Description for Neuroscience Research Week', '"2026-06-09T22:00:00.000Z"', '"2026-06-11T22:00:00.000Z"', 'Hybrid / Multiple Locations', 'Scientific Research', 'contact@medeventa.com', 1, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (9, 'cancer latest researches', 'important ', '"2026-01-09T23:00:00.000Z"', '"2026-01-13T23:00:00.000Z"', 'constantine mariott', 'Medcine interne', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (10, 'Iot in Medcine', 'the latest Iot utiles that helps medcine', '"2026-01-10T23:00:00.000Z"', '"2026-01-12T23:00:00.000Z"', 'Constantine Zénith', 'Neurology', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (11, 'Iot in Medcine', 'the latest Iot utiles that helps medcine', '"2026-01-10T23:00:00.000Z"', '"2026-01-12T23:00:00.000Z"', 'Constantine Zénith', 'Neurology', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (12, 'Congrès International IA & Santé 2026', 'Conférence internationale sur l\'intelligence artificielle appliquée à la santé publique. Thèmes : diagnostic assisté, télémédecine, analyse prédictive des épidémies, éthique IA.', '"2026-02-20T23:00:00.000Z"', '"2026-02-23T23:00:00.000Z"', 'Constantine', 'Neurology', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (13, 'Journées Algériennes de Télémédecine et Santé Digitale 2026', 'Événement scientifique national dédié à la télémédecine, aux dossiers médicaux électroniques et aux applications mobiles en santé. Sessions plénières, communications orales, posters et ateliers pratiques.', '"2026-01-02T23:00:00.000Z"', '"2026-01-04T23:00:00.000Z"', 'TESBESSA', 'Télémédecine et Santé Digitale', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (14, 'med', 'guuhj', '"2026-01-15T23:00:00.000Z"', '"2026-01-17T23:00:00.000Z"', 'Constantine', 'sci', NULL, 17, NULL);
INSERT INTO evenement (id, titre, description, date_debut, date_fin, lieu, thematique, contact, id_organisateur, date_limite_communication) VALUES (15, 'Ai horizons', 'later', '"2026-01-09T23:00:00.000Z"', '"2026-01-11T23:00:00.000Z"', 'Zénith ', 'Neurology', NULL, 16, NULL);

-- Table feedback has no data

-- Data for table: inscription
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (4, 16, 2, 'a_payer', '1862b9c7-22af-4c25-8497-7889950ad2fd', '"2025-12-30T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (5, 16, 1, 'a_payer', '2e7b13d0-3825-4d4b-995b-b55d0847ba0e', '"2025-12-30T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (6, 16, 13, 'a_payer', 'd885f758-f3cc-4a56-a095-22652bccf189', '"2026-01-01T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (7, 24, 1, 'a_payer', '91267114-8ac8-4657-a776-edd272a097ab', '"2026-01-01T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (8, 25, 1, 'a_payer', '82ccab1e-18f1-4638-95d3-397a2d7179c3', '"2026-01-01T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (9, 16, 6, 'a_payer', '67df6059-e41b-49f4-aec9-c7ef989e579e', '"2026-01-01T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (10, 28, 15, 'a_payer', '530215a6-400e-4b3a-9f7c-44d46b777887', '"2026-01-03T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (11, 28, 13, 'a_payer', '1dc50ed5-0050-41ab-8645-4e06f677df54', '"2026-01-03T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (12, 28, 1, 'a_payer', '4ade3211-09c1-474f-8e36-66f94fb75339', '"2026-01-03T23:00:00.000Z"');
INSERT INTO inscription (id, participant_id, evenement_id, statut_paiement, badge, date_inscription) VALUES (13, 28, 5, 'a_payer', '43f6bcd1-3e3c-4cee-a291-1cf8c5662fb0', '"2026-01-03T23:00:00.000Z"');

-- Data for table: inscription_workshop
INSERT INTO inscription_workshop (id, participant_id, workshop_id, presence, confirmation_status) VALUES (1, 16, 1, 0, 'pending');
INSERT INTO inscription_workshop (id, participant_id, workshop_id, presence, confirmation_status) VALUES (2, 28, 15, 0, 'pending');
INSERT INTO inscription_workshop (id, participant_id, workshop_id, presence, confirmation_status) VALUES (3, 28, 7, 0, 'pending');
INSERT INTO inscription_workshop (id, participant_id, workshop_id, presence, confirmation_status) VALUES (4, 28, 14, 0, 'pending');
INSERT INTO inscription_workshop (id, participant_id, workshop_id, presence, confirmation_status) VALUES (5, 28, 16, 1, 'confirmed');

-- Table inscription_workshop_attente has no data

-- Table invite has no data

-- Data for table: membre_comite
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (1, 2, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (2, 3, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (3, 4, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (4, 5, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (5, 27, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (6, 27, 2);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (7, 27, 3);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (8, 27, 4);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (9, 27, 5);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (10, 27, 6);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (11, 27, 7);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (12, 27, 8);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (13, 27, 9);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (14, 27, 10);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (15, 27, 11);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (16, 27, 12);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (17, 27, 13);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (18, 27, 14);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (20, 27, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (21, 27, 2);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (22, 27, 3);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (23, 27, 4);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (24, 27, 5);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (25, 27, 6);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (26, 27, 7);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (27, 27, 8);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (28, 27, 9);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (29, 27, 10);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (30, 27, 11);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (31, 27, 12);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (32, 27, 13);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (33, 27, 14);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (35, 27, 15);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (36, 27, 15);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (37, 4, 15);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (38, 22, 15);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (39, 27, 1);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (40, 27, 2);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (41, 27, 3);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (42, 27, 4);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (43, 27, 5);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (44, 27, 6);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (45, 27, 7);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (46, 27, 8);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (47, 27, 9);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (48, 27, 10);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (49, 27, 11);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (50, 27, 12);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (51, 27, 13);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (52, 27, 14);
INSERT INTO membre_comite (id, utilisateur_id, comite_id) VALUES (53, 27, 15);

-- Data for table: message_interne
INSERT INTO message_interne (id, expediteur_id, destinataire_id, evenement_id, contenu, date_envoi, type) VALUES (1, 17, 17, 13, 'Replying to your question: "Test question for Event 13 from script"

', '"2026-01-02T23:30:25.000Z"', 'reponse');
INSERT INTO message_interne (id, expediteur_id, destinataire_id, evenement_id, contenu, date_envoi, type) VALUES (2, 17, 17, 15, 'Replying to your question: "How does the AI affect medecin"

it is helpful for it', '"2026-01-02T23:45:51.000Z"', 'reponse');
INSERT INTO message_interne (id, expediteur_id, destinataire_id, evenement_id, contenu, date_envoi, type) VALUES (3, 17, 17, 15, 'Replying to your question: "How to implement ai in mde?"

IT IS ', '"2026-01-02T23:53:12.000Z"', 'reponse');
INSERT INTO message_interne (id, expediteur_id, destinataire_id, evenement_id, contenu, date_envoi, type) VALUES (4, 17, 17, 15, 'Replying to your question: "How to implement ai in mdC?"
YES IT IS

', '"2026-01-02T23:55:25.000Z"', 'reponse');
INSERT INTO message_interne (id, expediteur_id, destinataire_id, evenement_id, contenu, date_envoi, type) VALUES (5, 20, 28, 15, 'HI', '"2026-01-04T03:02:00.000Z"', 'notif');

-- Data for table: notification
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (1, 14, NULL, 'test_type', 'Test Message', '"2026-01-01T23:16:20.000Z"', 0);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (2, 17, 15, 'new_message', 'Vous avez reçu un nouveau message', '"2026-01-02T23:53:12.000Z"', 1);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (3, 17, 15, 'new_message', 'Vous avez reçu un nouveau message', '"2026-01-02T23:55:25.000Z"', 1);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (4, 28, 1, 'registration', 'Vous êtes inscrit à l\'événement.', '"2026-01-04T02:12:28.000Z"', 1);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (5, 28, 5, 'registration', 'Vous êtes inscrit à l\'événement.', '"2026-01-04T02:15:25.000Z"', 1);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (6, 28, 15, 'workshop_registration', 'Vous êtes inscrit au workshop: LATEST AI RES', '"2026-01-04T02:29:48.000Z"', 1);
INSERT INTO notification (id, utilisateur_id, evenement_id, type, message, date_creation, lu) VALUES (7, 28, 15, 'workshop_registration', 'Vous êtes inscrit au workshop: WKSHP', '"2026-01-04T03:01:07.000Z"', 1);

-- Table password_reset_token has no data

-- Table proposition_history has no data

-- Data for table: question
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (1, 1, 14, 'Will the presentations be available online after the conference?', '"2025-12-30T23:23:30.000Z"');
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (2, 1, 15, 'Are there any networking events planned for participants?', '"2025-12-30T23:23:30.000Z"');
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (3, 1, 14, 'What are the CME credits available for this conference?', '"2025-12-30T23:23:30.000Z"');
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (4, 15, 17, 'How does the AI affect medecin', '"2026-01-02T21:24:11.000Z"');
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (5, 15, 17, 'How to implement ai in mde?', '"2026-01-02T22:15:12.000Z"');
INSERT INTO question (id, evenement_id, utilisateur_id, contenu, date_creation) VALUES (6, 13, 17, 'Test question for Event 13 from script', '"2026-01-02T22:20:56.000Z"');

-- Table rapport_evaluation has no data

-- Table reponse_sondage has no data

-- Data for table: session
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (1, 1, 'The Post-Cloud Era in Healthcare', '"2026-02-15T13:00:00.000Z"', 'Emerald Hall', 9);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (2, 1, 'Scaling Healthcare Systems to 10M Users', '"2026-02-15T13:00:00.000Z"', 'Emerald Hall', 10);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (3, 1, 'AI and Machine Learning in Diagnostics', '"2026-02-15T13:00:00.000Z"', 'Sapphire Room', 7);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (4, 1, 'Poster session: Neuroscience Advances', '"2026-02-15T13:00:00.000Z"', 'Poster Hall', NULL);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (5, 1, 'Roundtable: Ethics in Digital Health', '"2026-02-15T13:00:00.000Z"', 'Conference Room A', 2);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (6, 1, 'Clinical Trials Workshop', '"2026-02-15T13:00:00.000Z"', 'Conference Room B', 13);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (7, 2, 'Opening Plenary - AI in Healthcare Summit 2026', '"2026-02-20T08:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (8, 3, 'Opening Plenary - Mental Health & Wellness Summit', '"2026-03-08T08:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (9, 4, 'Opening Plenary - Depression & Anxiety Research Forum', '"2026-03-03T08:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (10, 5, 'Opening Plenary - Pediatric Oncology Conference', '"2026-04-15T07:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (11, 6, 'Opening Plenary - Pediatric Care Innovation Forum', '"2026-04-05T07:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (12, 7, 'Opening Plenary - Cardiovascular Medicine Summit', '"2026-05-20T07:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (13, 8, 'Opening Plenary - Neuroscience Research Week', '"2026-06-10T07:00:00.000Z"', 'Grand Ballroom', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (14, 9, 'medecine', '"2026-01-12T12:00:00.000Z"', 'hall A', 1);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (15, 10, 'IOT LATEST', '"2026-01-13T00:15:00.000Z"', 'A1', 4);
INSERT INTO session (id, evenement_id, titre, horaire, salle, president_id) VALUES (17, 15, 'AI SESSION', '"2026-01-10T19:41:00.000Z"', 'A2', 10);

-- Table session_intervenant has no data

-- Data for table: sondage
INSERT INTO sondage (id, evenement_id, titre, type, date_creation) VALUES (1, 1, 'Event Satisfaction Survey', 'satisfaction', '"2025-12-30T23:23:30.000Z"');

-- Table statistique has no data

-- Data for table: survey
INSERT INTO survey (id, event_id, title, description, created_at, updated_at) VALUES (1, 13, 'Ai Session', NULL, '"2026-01-02T21:04:52.000Z"', '"2026-01-02T21:04:52.000Z"');

-- Data for table: survey_question
INSERT INTO survey_question (id, survey_id, question_text, question_type) VALUES (1, 1, 'How was it?', 'text');

-- Table survey_response has no data

-- Data for table: utilisateur
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (1, 'Dupont', 'Marie', 'marie.dupont@medeventa.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'ORGANISATEUR', NULL, 'MEDEVENTA Organization', 'Event Management', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (2, 'Laurent', 'Marie', 'marie.laurent@hospital-paris.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'University Hospital of Paris', 'Neurology', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (3, 'Dubois', 'Jean-Marc', 'jm.dubois@research-institute.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Medical Research Institute', 'Cardiology', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (4, 'Bernard', 'Sophie', 'sophie.bernard@lyon-medical.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Lyon Medical School', 'Pediatrics', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (5, 'Moreau', 'Thomas', 'thomas.moreau@bordeaux-hospital.fr', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'MEMBRE_COMITE', NULL, 'Bordeaux University Hospital', 'Surgery', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (6, 'Johnson', 'Michael', 'michael.johnson@harvard.edu', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'Harvard Medical School', 'Personalized Medicine', NULL, 'USA', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (7, 'Rossi', 'Elena', 'elena.rossi@unimi.it', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'University of Milan', 'AI in Diagnostics', NULL, 'Italy', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (8, 'Tanaka', 'Kenji', 'kenji.tanaka@tokyo-hospital.jp', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'INVITE', NULL, 'Tokyo University Hospital', 'Robotic Surgery', NULL, 'Japan', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (9, 'Thorne', 'Aris', 'aris.thorne@quantumdynamics.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'Quantum Dynamics', 'Quantum Computing Healthcare', NULL, 'USA', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (10, 'Chen', 'Marcus', 'marcus.chen@cloudscale.sg', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'CloudScale', 'Healthcare Infrastructure', NULL, 'Singapore', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (11, 'Rodriguez', 'Elena', 'elena.rodriguez@creativestudio.es', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'RESP_WORKSHOP', NULL, 'Creative Studio', 'Medical UX Design', NULL, 'Spain', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (12, 'Johnson', 'Sarah', 'sarah.johnson@datavis.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'RESP_WORKSHOP', NULL, 'DataVis Solutions', 'Medical Data Visualization', NULL, 'USA', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (13, 'Chen', 'Robert', 'robert.chen@clinicaltrials.org', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'COMMUNICANT', NULL, 'Clinical Trials Institute', 'Clinical Research', NULL, 'USA', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (14, 'Martin', 'Alice', 'alice.martin@gmail.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'PARTICIPANT', NULL, 'General Hospital', 'General Medicine', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (15, 'Dubois', 'Pierre', 'pierre.dubois@gmail.com', '$2a$10$xQZ5j7XK8vH9pN5mK3rL3.zK9nP5oQ7wR2sT4uV6wX8yA0bC1dE2f', 'PARTICIPANT', NULL, 'City Clinic', 'Internal Medicine', NULL, 'France', NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (16, 'AYA', 'KETTAB', 'ketttesni@gmail.com', '$2a$10$Qo/AWb/cnLy/QGOX3rWh0e9diamwEdf3NZfs40pTZGlKmX8Cqdzxa', 'SUPER_ADMIN', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (17, 'bissane', 'ayoun', 'aya_tesnim.kettab@univ-constantine2.dz', '$2a$10$otSm1mgKStqhONba.JvWyuNyQxmbNrcrb5hLy9UN7uPmNrvNsbeLm', 'ORGANISATEUR', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAMb+AAIAAAARAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABR29vZ2xlIEluYy4gMjAxNgAA/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJH', 'Laboratory', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (18, 'Ikram ', 'boutout', 'ikram.boutoute@univ-constantine2.dz', '$2a$10$AAA16qKbW/ZkKXB.lGBwEuOzrFbpocy9tue3jgBweQJ8dXvDilQeW', 'MEMBRE_COMITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QB0RXhpZgAATU0AKgAAAAgABQEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAMb+AAIAAAARAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABR29vZ2xlIEluYy4gMjAxNgAA/+IB2ElDQ19QUk9GSUxFAAEBAAAByAAAAAAEMAAAbW50clJH', 'Laboratory', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (19, 'FN', 'NFNG', 'armytesnim5@gmail.com', '$2a$10$pEpn3gorr8AtqFyYnDUeie1ld5smhzUHihvJ5/3GjHjpXhr5/kJsS', 'RESP_WORKSHOP', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (20, 'KETTAB', 'KETTAB', 'horizonskillsacademy@gmail.com', '$2a$10$XpMNvDIE4xDw2ZVOlnyz9ujm5r7AXqdhQ24KxKMsT77IuZte/teum', 'RESP_WORKSHOP', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnkAAAGKCAYAAABw51eLAAAQAElEQVR4Aex9B5xkRZ1/1Qv9Ok7OmxNhQTIKShSVJAY8MefA/T29M53nGTg8053xTJyY8+kaQEFAAUFBEGVBJC4sG2d3curp3C/8v9/a7XF22Qm70z3TPVvzeTVVr3J9q+pX3/rVe68Nof80AhoBjYBGQCOgEdAIaAQWHQKa5C26LtUN0ghoBDQCc', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (21, 'KETAB', 'TESNIM', 'kettabhana@gmail.com', '$2a$10$XYA/lAve9Is86oEYmvQkHOuRyMr6T.i7CZCGGkcus6FdO/ATR8NiO', 'INVITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QDJRXhpZgAASUkqAAgAAAADAA4BAgB/AAAAMgAAABoBBQABAAAAsQAAABsBBQABAAAAuQAAAAAAAABQaG90byBvZiBsYWR5IGdlbmVyYWwgcHJhY3RpdGlvbmVyIHBvaW50IHRodW1iIGVtcHR5IHNwYWNlIHByZXNlbnQgY292aWQgcHJvdGVjdGlvbiB2YWNjaW5hdGlv', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (22, 'hana', 'kettab', 'hana.kettab@univ-constantine2.dz', '$2a$10$Z6PfujWgstXZKkcnYZ60POJgSoEY87.BHEu5JAQa5MAVzO.gkOqQ6', 'MEMBRE_COMITE', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QCGRXhpZgAASUkqAAgAAAADAA4BAgA8AAAAMgAAABoBBQABAAAAbgAAABsBBQABAAAAdgAAAAAAAABBIHlvdW5nIGZlbWFsZSBkb2N0b3Igc21pbGluZyBoYXBweSB3aGlsZSBwb2ludGluZyBhYm92ZSBoZXIsAQAAAQAAACwBAAABAAAA/+EFsWh0dHA6Ly9ucy5hZG9i', 'UNI2', 'Medcine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (23, 'Test', 'User', 'test_1767345587888@example.com', '$2a$10$yJetfXg4nlPNomGGFAs.SeqDX088laHsA8TXeHEdC.NcCqKkXfmfW', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (24, 'Test', 'User', 'test_1767345635727@example.com', '$2a$10$XkGQ4Lj18a93omG7vZqKOOFq4ORnjptfqEiJJXUSVIONa4gg78JHy', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (25, 'Test', 'User', 'test_1767345737711@example.com', '$2a$10$ybMNJlOf6di2sK/K0KPDxuB0Ts2dbjvRKlQ7wEvyqS5XqTZy7bELe', 'PARTICIPANT', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (27, 'Boutout', 'Ikram', 'ikram@example.com', 'Ikram123!', 'MEMBRE_COMITE', NULL, 'University of Algiers', 'Medicine', NULL, NULL, NULL, NULL);
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche, biographie, pays, reset_token_hash, reset_token_expires) VALUES (28, 'Kettab', 'ahmed', 'aboudkettab@gmail.com', '$2a$10$RnmAw4i1urLXaVtewsFTqOZMSp73DdtgGpskxMc7R6iR4aQgASEqi', 'PARTICIPANT', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCALgAuADASIAAhEB', 'Laboratory', 'AAA', NULL, NULL, NULL, NULL);

-- Data for table: vote
INSERT INTO vote (id, question_id, user_id, created_at) VALUES (1, 4, 17, '"2026-01-02T21:50:29.000Z"');
INSERT INTO vote (id, question_id, user_id, created_at) VALUES (2, 5, 17, '"2026-01-02T22:15:15.000Z"');

-- Table vote_question has no data

-- Data for table: workshop
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (1, 1, 'Design as a Competitive Edge in Medical Devices', NULL, 11, '"2026-02-15T09:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (2, 1, 'Hands-on Surgical Robotics', NULL, 8, '"2026-02-15T09:00:00.000Z"', NULL, 'beginner', 0, 15, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (3, 1, 'Medical Data Visualization Techniques', NULL, 12, '"2026-02-15T09:00:00.000Z"', NULL, 'beginner', 0, 25, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (4, 2, 'Hands-on Workshop - AI in Healthcare Summit 2026', NULL, 1, '"2026-02-20T13:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (5, 3, 'Hands-on Workshop - Mental Health & Wellness Summit', NULL, 1, '"2026-03-08T13:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (6, 4, 'Hands-on Workshop - Depression & Anxiety Research Forum', NULL, 1, '"2026-03-03T13:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (7, 5, 'Hands-on Workshop - Pediatric Oncology Conference', NULL, 1, '"2026-04-15T12:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (8, 6, 'Hands-on Workshop - Pediatric Care Innovation Forum', NULL, 1, '"2026-04-05T12:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (9, 7, 'Hands-on Workshop - Cardiovascular Medicine Summit', NULL, 1, '"2026-05-20T12:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (10, 8, 'Hands-on Workshop - Neuroscience Research Week', NULL, 1, '"2026-06-10T12:00:00.000Z"', NULL, 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (11, 13, 'NEED', 'SOON', 20, '"2026-01-03T04:33:00.000Z"', 'A2', 'beginner', 1500, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (12, 13, 'MedEventa', NULL, 20, '"2026-01-03T06:56:00.000Z"', 'A1', 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (13, 15, 'ai workshop', NULL, 4, '"2026-01-10T11:02:00.000Z"', 'A1', 'beginner', 0, 20, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (14, 15, 'LATEST AI RES', NULL, 13, '"2026-01-10T12:01:00.000Z"', 'A1', 'beginner', 0, 30, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (15, 15, 'TECHNIQUES OF AI', NULL, 19, '"2026-01-10T21:49:00.000Z"', 'A5', 'beginner', 0, 10, 1);
INSERT INTO workshop (id, evenement_id, titre, description, responsable_id, date, salle, level, price, nb_places, ouvert) VALUES (16, 15, 'WKSHP', 'FJELF', 20, '"2026-01-10T11:00:00.000Z"', 'A7', 'beginner', 0, 30, 1);

