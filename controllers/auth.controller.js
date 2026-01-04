const bcrypt = require("bcryptjs"); // pour hacher le mot de passe
const jwt = require("jsonwebtoken"); // pour créer token JWT apres login
const db = require("../db"); // connexion mysql
const crypto = require("crypto"); // pour hacher les codes temporaires (reset password)
const nodemailer = require("nodemailer"); // pour envoyer les emails
const fs = require("fs");
const path = require("path");

// Tous les rôles possibles (doivent être les mêmes que l'ENUM dans la table utilisateur)
const ALL_ROLES = [
  "SUPER_ADMIN",
  "ORGANISATEUR",
  "COMMUNICANT",
  "PARTICIPANT",
  "MEMBRE_COMITE",
  "INVITE",
  "RESP_WORKSHOP",
];

// REGISTER
const register = (req, res) => {
  const {
    nom,
    prenom,
    email,
    mot_de_passe,
    role,
    photo,
    institution,
    domaine_recherche,
  } = req.body;

  if (!ALL_ROLES.includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  db.query("SELECT id FROM utilisateur WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Erreur DB:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    try {
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      const sql = `
        INSERT INTO utilisateur 
          (nom, prenom, email, mot_de_passe, role, photo, institution, domaine_recherche)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [nom, prenom, email, hashedPassword, role, photo, institution, domaine_recherche],
        (err2, resultInsert) => {
          if (err2) {
            console.error("Erreur insertion:", err2);
            return res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
          }

          return res.status(201).json({
            message: "Utilisateur créé avec succès",
            userId: resultInsert.insertId,
            role,
          });
        }
      );
    } catch (e) {
      console.error("Erreur hash:", e);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });
};

// LOGIN
const login = (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  db.query("SELECT * FROM utilisateur WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Erreur DB:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Authentification réussie",
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
  if (!email) return res.status(400).json({ message: "email requis" });

  db.query("SELECT id FROM utilisateur WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "erreur serveur" });
    }

    // Même message pour éviter l’énumération des comptes
    if (result.length === 0) {
      return res.json({ message: "si cet email existe, un code a été envoyé" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    db.query(
      `UPDATE utilisateur
       SET reset_token_hash = ?, reset_token_expires = ?
       WHERE email = ?`,
      [codeHash, expiresAt, email],
      async (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "erreur serveur" });
        }

        try {
          await sendResetEmail(email, code);
        } catch (e) {
          console.error("Erreur envoi email:", e);
          return res.status(500).json({ message: "Impossible d'envoyer l'email pour le moment" });
        }

        return res.json({ message: "si cet email existe, un code a été envoyé" });
      }
    );
  });
};

// RESET PASSWORD
const resetPassword = (req, res) => {
  const { email, code, nouveau_mot_de_passe } = req.body;
  if (!email || !code || !nouveau_mot_de_passe) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  db.query(
    `SELECT id, reset_token_expires
     FROM utilisateur
     WHERE email = ? AND reset_token_hash = ?`,
    [email, codeHash],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "erreur serveur" });
      }
      if (result.length === 0) {
        return res.status(400).json({ message: "code invalide" });
      }

      const user = result[0];
      if (new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({ message: "code expiré" });
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
            return res.status(500).json({ message: "erreur serveur" });
          }
          return res.json({ message: "mot de passe modifié avec succès" });
        }
      );
    }
  );
};

const sendResetEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Réinitialisation du mot de passe",
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
        console.error("Erreur DB getMe:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }
      return res.json({ user: rows[0] });
    }
  );
};

// UPDATE ME (partial update)
const updateMe = (req, res) => {
  const userId = req.user.id;

  const allowed = ["nom", "prenom", "email", "photo", "institution", "domaine_recherche"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      if (k === "photoUrl") updates["photo"] = req.body[k];
      else if (k === "bio") updates["biographie"] = req.body[k];
      else updates[k] = req.body[k];
    }
  }

  // Handle Base64 Image
  if (updates.photo && updates.photo.startsWith("data:image")) {
    try {
      const base64Data = updates.photo.split(",")[1];
      const mimeType = updates.photo.split(";")[0].split(":")[1];
      let extension = mimeType.split("/")[1];
      if (extension === "jpeg") extension = "jpg";

      const filename = `avatar-${userId}-${Date.now()}.${extension}`;
      const dirPath = path.join(__dirname, "..", "uploads", "avatars");

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, filename);
      fs.writeFileSync(filePath, base64Data, "base64");

      updates.photo = `/uploads/avatars/${filename}`;
    } catch (err) {
      console.error("Error saving avatar:", err);
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  const keys = Object.keys(updates);
  const setSql = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => updates[k]);

  const sql = `UPDATE utilisateur SET ${setSql} WHERE id = ?`;

  db.query(sql, [...values, userId], (err) => {
    if (err) {
      console.error("Erreur DB updateMe:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    return res.json({ message: "Profil mis à jour" });
  });
};

// SOCIAL LOGIN (Google)
const socialLogin = (req, res) => {
  const { email, nom, prenom, photo } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  db.query("SELECT * FROM utilisateur WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Erreur DB:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      const defaultRole = "PARTICIPANT";
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

      db.query(
        "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, photo) VALUES (?, ?, ?, ?, ?, ?)",
        [nom || "", prenom || "", email, dummyPassword, defaultRole, photo || ""],
        (err2, insertResult) => {
          if (err2) {
            console.error("Erreur insertion:", err2);
            return res.status(500).json({ message: "Erreur création utilisateur" });
          }

          const newUserId = insertResult.insertId;
          const token = jwt.sign(
            { id: newUserId, email, role: defaultRole },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          return res.json({
            message: "Compte créé et authentifié",
            token,
            user: {
              id: newUserId,
              nom: nom || "",
              prenom: prenom || "",
              email,
              role: defaultRole,
              photo: photo || "",
            },
          });
        }
      );
    } else {
      const user = result[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Authentification réussie",
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
    }
  });
};

module.exports = {
  register,
  login,
  socialLogin,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
};
