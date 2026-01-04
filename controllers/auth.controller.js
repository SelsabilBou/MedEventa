const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const crypto = require('crypto');          // pour les codes temporaires
const nodemailer = require('nodemailer');  // pour envoyer les emails

// Tous les rôles possibles (doivent être les mêmes que l'ENUM dans la table utilisateur)
const ALL_ROLES = [
  'SUPER_ADMIN',
  'ORGANISATEUR',
  'COMMUNICANT',
  'PARTICIPANT',
  'MEMBRE_COMITE',
  'INVITE',
  'RESP_WORKSHOP',
];

// REGISTER
const register = async (req, res) => {
  let { nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche } = req.body;

  // Vérifier que le rôle envoyé est valide
  if (!ALL_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  try {
    // Vérifier si l'email existe déjà
    db.query('SELECT * FROM utilisateur WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // insertion dans la base de donne
      const sql = `
        INSERT INTO utilisateur 
          (nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [nom, prenom, email, hashedPassword, role, photo, institution, domaine_recherche],
        (err, resultInsert) => {
          if (err) {
            console.error('Erreur insertion:', err);
            return res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
          }

          res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: resultInsert.insertId,
            role, 
          });
        }
      );
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// LOGIN
const login = (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res
      .status(400)
      .json({ message: 'Email et mot de passe requis' });
  }

  db.query('SELECT * FROM utilisateur WHERE email = ?', [email], async (err, result) => {
    if (err) {
      console.error('Erreur DB:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (result.length === 0) {
      return res
        .status(400)
        .json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // durée 1 jour
    );

    res.json({
      message: 'Authentification réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        photo: user.photo,
        institution: user.institution,
        domaine_recherche: user.domaine_recherche,
      },
    });
  });
};

// FORGOT PASSWORD
const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'email requis' });
  }

  db.query(
    'SELECT id FROM utilisateur WHERE email = ?',
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'erreur serveur' });
      }
      if (result.length === 0) {
        return res.json({
          message: 'si cet email existe,un lien a été envoyé',
        });// makanch email bsh nedirou heka pour la sécurite
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        `UPDATE utilisateur
         SET reset_token_hash = ?, reset_token_expires = ?
         WHERE email = ?`,
        [codeHash, expiresAt, email],
        async (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: 'erreur serveur' });
          }
          try {
            await sendResetEmail(email, code);
          } catch (e) {
            console.error("Erreur envoi email:", e);
            return res.status(500).json({ message: "Impossible d'envoyer l'email pour le moment" });
          }
          res.json({ message: 'si cet email existe,un code a été envoyé' });
        }
      );
    }
  );
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, code, nouveau_mot_de_passe } = req.body;
  if (!email || !code || !nouveau_mot_de_passe) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  const codeHash = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

  db.query(
    `SELECT id, reset_token_expires
     FROM utilisateur
     WHERE email = ? AND reset_token_hash = ?`,
    [email, codeHash],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'erreur serveur' });
      }
      if (result.length === 0) {
        return res.status(400).json({ message: 'code invalide' });
      }

      const user = result[0];
      if (new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({ message: 'code expiré' });
      }

      const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, 10);

      db.query(
        `UPDATE utilisateur
         SET mot_de_passe = ?,
             reset_token_hash = NULL,
             reset_token_expires = NULL
         WHERE id = ?`,
        [hashedPassword, user.id],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: 'erreur serveur' });
          }
          res.json({ message: 'mot de passe modifié avec succès' });
        }
      );
    }
  );
};

const sendResetEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Réinitialisation du mot de passe',
    html: `<p>Votre code (valide 5min) : <b>${code}</b></p>`,
  });
};
// GET ME (profil depuis DB)
const getMe = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT id, nom, prenom, email, role, photo, institution, domaine_recherche
     FROM utilisateur
     WHERE id = ?
     LIMIT 1`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Erreur DB getMe:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      return res.json({ user: rows[0] });
    }
  );
};

// UPDATE ME (partial update)
const updateMe = (req, res) => {
  const userId = req.user.id;

  const allowed = ['nom', 'prenom', 'email', 'photo', 'institution', 'domaine_recherche'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
  }

  // بناء SET ديناميكي
  const keys = Object.keys(updates);
  const setSql = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => updates[k]);

  const sql = `UPDATE utilisateur SET ${setSql} WHERE id = ?`;

  db.query(sql, [...values, userId], (err, result) => {
    if (err) {
      // إذا email unique ودار conflict يطيح هنا (ER_DUP_ENTRY)
      console.error('Erreur DB updateMe:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    return res.json({ message: 'Profil mis à jour' });
  });
};


module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,       // ✅
  updateMe,    // ✅
};

