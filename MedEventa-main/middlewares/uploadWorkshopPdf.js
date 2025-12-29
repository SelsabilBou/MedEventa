// middlewares/uploadWorkshopPdf.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(process.cwd(), "uploads", "workshop_supports");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString("hex") + "-" + Date.now();
    cb(null, `${unique}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (file.mimetype === "application/pdf" && ext === ".pdf") return cb(null, true);
  cb(new Error("Seuls les fichiers PDF sont autorisés"), false);
};

const uploadWorkshopPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { uploadWorkshopPdf };
