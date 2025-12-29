// middlewares/uploadPdf.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(process.cwd(), "uploads", "submissions");

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  if (err.code === "EEXIST") {
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
    const unique = crypto.randomBytes(16).toString("hex") + "-" + Date.now();
    cb(null, `${unique}.pdf`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype === "application/pdf" && ext === ".pdf") return cb(null, true);
  cb(new Error("Seuls les fichiers PDF sont autorisés"), false);
};

const uploadSubmissionPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = { uploadSubmissionPdf };
