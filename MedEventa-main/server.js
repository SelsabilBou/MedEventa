// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const workshopRoutes = require("./routes/workshop.routes"); // added
const sessionRoutes = require("./routes/session.routes");
const inscriptionRoutes = require("./routes/inscription.routes");
const { verifyToken } = require("./middlewares/auth.middlewares");
const submissionRoutes = require("./routes/submission.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const questionRoutes = require("./routes/question.routes");
const surveyRoutes = require("./routes/survey.routes");
const messageRoutes = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const port = process.env.PORT || 3000;

const attestationRoutes = require("./routes/attestation.routes");
const statsRoutes = require("./routes/stats.routes");
const authorRoutes = require("./routes/author.routes");
const userRoutes = require("./routes/user.routes");

// Logger simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable CORS manually (allows direct calls from port 5173 to 3000)
app.use((req, res, next) => {
  // Always specific origin for credentials support
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://localhost:5180"
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Pour parser le JSON -> AVANT toutes les routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Fix COOP for Google login popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/events", statsRoutes);
app.use("/api/events", workshopRoutes); // mount workshops under /api/events
app.use("/api/events", submissionRoutes); // mount submissions under /api/events
app.use("/api/events", eventRoutes); // eventRoutes last because it has generic /:id
app.use("/api/evaluations", evaluationRoutes);
app.use("/api", sessionRoutes);
app.use("/api/inscriptions", inscriptionRoutes);
app.use("/api", questionRoutes);
app.use("/api", surveyRoutes);
app.use("/api", messageRoutes);
app.use("/api", notificationRoutes);
app.use("/api", require("./routes/feedback.routes"));
app.use("/api/attestations", attestationRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/users", userRoutes);

// Route profil protégée
app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profil accessible",
    user: req.user,
  });
});

// Route test
app.get("/test", (req, res) => {
  res.json({ message: "Serveur fonctionne correctement!" });
});

// 404 en dernier
app.use((req, res) => {
  res.status(404).json({
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
  });
});

// Lancement serveur
app.listen(port, () => {
  console.log('--- Environment:', process.env.NODE_ENV);
  console.log('--- Configured Port:', port);
  console.log('--- process.env.PORT:', process.env.PORT);
  console.log(`\nServeur Express démarré sur le port ${port}`);
  console.log(`Test:     http://localhost:${port}/test`);
  console.log(`Register: http://localhost:${port}/api/auth/register`);
  console.log(`Login:    http://localhost:${port}/api/auth/login\n`);
});
