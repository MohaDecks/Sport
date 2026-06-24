require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const coachRoutes = require('./routes/coachRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const matchRoutes = require('./routes/matchRoutes');
const matchResultRoutes = require('./routes/matchResultRoutes');
const standingRoutes = require('./routes/standingRoutes');
const disciplineRoutes = require('./routes/disciplineRoutes');
const newsRoutes = require('./routes/newsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const rbacRoutes = require('./routes/rbacRoutes');

connectDB();

const app = express();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/match-results', matchResultRoutes);
app.use('/api/standings', standingRoutes);
app.use('/api/discipline', disciplineRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rbac', rbacRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'District Sports Management System API is running' });
});

const releasesDir = path.join(__dirname, '../public/releases');
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir, { recursive: true });

app.get('/api/mobile/apk', (req, res) => {
  const apkPath = path.join(releasesDir, 'district-sports.apk');
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ success: false, message: 'APK not built yet. Run npm run deploy on the server.' });
  }
  const stat = fs.statSync(apkPath);
  res.json({
    success: true,
    url: '/downloads/district-sports.apk',
    size: stat.size,
    updatedAt: stat.mtime,
  });
});

app.use('/downloads', express.static(releasesDir));

const adminDist = path.join(__dirname, '../../admin-portal/dist');
if (fs.existsSync(adminDist)) {
  app.use(express.static(adminDist));
  app.get(/^(?!\/api|\/uploads|\/downloads).*/, (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`DSMS Server running on port ${PORT}`);
});
