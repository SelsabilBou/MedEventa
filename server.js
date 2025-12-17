const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes'); // Ajout
const { verifyToken } = require('./middlewares/auth.middleware');
const submissionRoutes = require('./routes/submission.routes');


const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.url}`);
  next();
});

app.use(express.json()); // bodyParser.json() supprimé comme suggéré

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); // Ajout
app.use('/api/events', submissionRoutes);


// CETTE ROUTE DOIT ÊTRE LÀ, AVANT LE 404
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Profil accessible',
    user: req.user
  });
});

app.get('/test', (req, res) => {
  res.json({ message: ' Serveur fonctionne correctement!' });
});

// 404 en dernier
app.use((req, res) => {
  res.status(404).json({
    message: ` Route non trouvée: ${req.method} ${req.originalUrl}`
  });
});



app.listen(port, () => {
  console.log(`\n Serveur Express démarré sur le port ${port}`);
  console.log(` Test: http://localhost:${port}/test`);
  console.log(` Register: http://localhost:${port}/api/auth/register`);
  console.log(` Login: http://localhost:${port}/api/auth/login\n`);
  console.log(`Forgot Password: http://localhost:${port}/api/auth/forgot-password`);
  console.log(`Reset Password: http://localhost:${port}/api/auth/reset-password\n`);
  console.log(`creat somission: http://localhost:${port}/api/events/1/submissions`)

});