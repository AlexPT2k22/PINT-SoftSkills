[![wakatime](https://wakatime.com/badge/github/AlexPT2k22/PINT-SoftSkills.svg)](https://wakatime.com/badge/github/AlexPT2k22/PINT-SoftSkills)

# SoftSkills

Training and progress-tracking platform for teams, with course management, forum workflows, quizzes, attendance, notifications and certificate verification.

- Live demo (Frontend on Vercel): `https://pint-soft-skills.vercel.app/`
- API healthcheck (Backend on Vercel Functions): `GET /api`

## Why this project matters

SoftSkills centralizes remote learning operations in one product:

- admins create and manage training journeys
- participants follow asynchronous and synchronous content
- progress and attendance are tracked in real time
- certificates are generated and can be publicly verified

## Main capabilities

- Authentication with protected routes (role-aware flows)
- Course lifecycle management (create, edit, publish, enroll)
- Learning progress tracking and attendance management
- Forum module (topics, posts, evaluations, reports, requests)
- Notifications and scheduled maintenance jobs
- Certificate generation and verification

## Tech stack

### Frontend
- React 19 + Vite
- React Router
- Zustand
- Bootstrap / React-Bootstrap

### Backend
- Node.js + Express
- Sequelize
- PostgreSQL
- JWT + cookie-based auth

### Integrations
- Cloudinary (media)
- Supabase (file storage use cases)
- Resend/Mail services (email flows)
- Firebase Admin / FCM (push notifications)
- PDFKit + QRCode (certificate generation)

### Deployment
- Frontend: Vercel (`client/vercel.json`)
- Backend/API: Vercel Functions (`server/vercel.json`)

## High-level architecture

```text
React (Vite SPA on Vercel)
        |
        | HTTPS (REST + Cookies)
        v
Node/Express API (Vercel Functions)
        |
        +--> PostgreSQL (Sequelize)
        +--> Cloudinary (media)
        +--> Supabase (storage)
        +--> Email provider (transactional emails)
        +--> Firebase FCM (push notifications)
```

Detailed diagrams and request flows: `docs/ARCHITECTURE.md`.

## Repository structure

```text
PINT-SoftSkills/
|- client/                 # React + Vite app
|  |- src/
|  |- public/
|  `- vercel.json
|- server/                 # Express API
|  |- controllers/
|  |- routes/
|  |- models/
|  |- database/
|  |- jobs/
|  `- server.js
`- docs/                   # Architecture, flows and demo guide
```

## Getting started locally

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL instance

### 1) Clone

```bash
git clone https://github.com/AlexPT2k22/PINT-SoftSkills.git
cd PINT-SoftSkills
```

### 2) Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 3) Configure environment variables

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

### 4) Run locally

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:4000`

## Deployment guide (Vercel full free tier)

Use the step-by-step setup in `docs/DEMO.md` to publish and maintain a live environment for recruiters using Vercel (frontend + backend) and a free PostgreSQL provider.

## Documentation index

- Architecture: `docs/ARCHITECTURE.md`
- Functional walkthrough: `docs/HOW-IT-WORKS.md`
- Demo and deployment playbook: `docs/DEMO.md`

## Authors

- Alexandre
