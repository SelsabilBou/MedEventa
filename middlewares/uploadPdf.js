// middlewares/uploadPdf.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(process.cwd(), "uploads", "communications");

// ✅ création dossier safe
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  if (err.code === "EEXIST") {
    // si quelque chose existe, vérifier que c'est un dossier
    if (!fs.lstatSync(uploadDir).isDirectory()) {
      throw new Error(`Le chemin existe mais ce n'est pas un dossier: ${uploadDir}`);
    }
  } else {
    throw err;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Seuls les fichiers PDF sont autorisés"), false);
};

const uploadSubmissionPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { uploadSubmissionPdf };
