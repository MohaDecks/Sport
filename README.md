# District Sports Management System (DSMS)

A professional sports management platform with **Admin Portal**, **Mobile App**, and **REST API**.

## Project Structure

```
district-sports-management-system/
├── backend/          # Node.js + Express + MongoDB API
├── admin-portal/     # React + Vite Admin Dashboard
├── mobile-app/       # React Native (Expo) Mobile App
└── README.md
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT, Multer |
| Admin Portal | React, Vite, React Router, Axios, Recharts |
| Mobile App | React Native, Expo, React Navigation, Axios |

## Features

### Admin Portal
- Dashboard with statistics (teams, players, coaches, matches, tournaments)
- Team, Player, Coach CRUD with image upload
- Tournament/Cup management
- Match scheduling and result updates
- Player Activity & Discipline (injuries, suspensions, attendance, cards)
- News & push notifications
- Dark mode, pagination, search & filters

### Mobile App (Coach & Team)
- Login with email or phone
- Today's matches, team schedule, players, standings
- Team profile, match history, results
- Push notifications
- Dark mode support

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or update `MONGODB_URI` in backend `.env`)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # if needed
npm run seed           # seed demo data
npm run dev            # starts on http://localhost:5001
```

### 2. Admin Portal

```bash
cd admin-portal
npm install
npm run dev            # starts on http://localhost:5173
```

### 3. Mobile App

```bash
cd mobile-app
npm install
npm start              # Expo dev server
```

> Update `API_URL` in `mobile-app/src/constants/theme.js` to your machine IP when testing on a physical device.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dsms.com | admin123 |
| Coach | ahmed@dsms.com | coach123 |

## API Endpoints

### Auth
- `POST /api/auth/login` - Login (email or phone)
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Current user

### Core Resources
- `/api/teams` - Team CRUD
- `/api/players` - Player CRUD
- `/api/coaches` - Coach CRUD
- `/api/tournaments` - Tournament CRUD
- `/api/matches` - Match CRUD + `/today`
- `/api/match-results/:matchId` - Match results
- `/api/standings/:tournamentId` - League table
- `/api/news` - News & announcements
- `/api/notifications` - Push notifications

### Discipline
- `/api/discipline/injuries` - Injury management
- `/api/discipline/suspensions` - Suspension tracking
- `/api/discipline/attendance` - Training/match attendance
- `/api/discipline/activities` - Player match activity
- `/api/discipline/notes` - Coach notes
- `/api/discipline/cards` - Card history
- `/api/discipline/player/:playerId` - Full discipline summary

## Database Collections

Users, Teams, Players, Coaches, Tournaments, Matches, MatchResults, Notifications, Standings, Injuries, PlayerCards, Attendance, Suspensions, CoachNotes, PlayerMatchActivity, News

## Suspension Rules

- **Red card** → automatic suspension for next match
- **2 yellow cards** → warning suspension

## Server Deploy (Production)

Server: `http://2.58.82.168:5001`

### Marka hore (hal mar)

```bash
# Server-ka (Ubuntu/Debian)
sudo bash scripts/server-setup.sh

# Clone repo
git clone <repo-url> /opt/dsms && cd /opt/dsms
cp .env.production.example .env.production
# Ku samee backend/.env (MongoDB, JWT_SECRET, iwm.)
npm run install:server
npm run deploy
```

### Marka kasta oo update ah

```bash
cd /opt/dsms
git pull && npm run install:server && npm run deploy
```

> **Root user** (`root@server`): isticmaal `npm run deploy` kaliya.  
> **User kale**: `PM2_CMD="sudo pm2" npm run deploy`

Deploy-ku wuxuu:
1. Dhisaa admin portal (`admin-portal/dist`)
2. Dib u bilaabaa backend PM2 (admin + API hal link)

### Links

| Service | URL |
|---------|-----|
| Admin Portal | http://2.58.82.168:5001/ |
| API Health | http://2.58.82.168:5001/api/health |

APK (mobile) waxaa lagu dhisaa kombuyuutarkaaga: `npm run build:apk` — server-ka Java/Android looma baahna.

## License

MIT
