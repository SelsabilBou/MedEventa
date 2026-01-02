// middlewares/uploadWorkshopSupport.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(process.cwd(), "uploads", "workshop_supports");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = crypto.randomBytes(16).toString("hex") + "-" + Date.now();
        cb(null, `${unique}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExts = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".zip", ".rar", ".7z", ".txt", ".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (allowedExts.includes(ext)) {
        return cb(null, true);
    }
    cb(new Error("Format de fichier non supporté (PDF, PPT, DOC, ZIP autorisés)"), false);
};

const uploadWorkshopSupport = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // Increase to 20MB for ZIP/PPT
});

module.exports = { uploadWorkshopSupport };
