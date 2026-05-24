# Live Demo and Deployment (100% free tier)

This setup keeps the project live for recruiters without a paid server plan.

## Target setup

- Frontend: Vercel (`client/`)
- Backend API: Vercel Functions (`server/`)
- Database: free PostgreSQL provider (Neon/Supabase)

## 1) Deploy backend on Vercel

Create a separate Vercel project for `server/`:

- Root directory: `server`
- Node runtime detected automatically
- Config file used: `server/vercel.json`

`server/vercel.json` already defines:

- route mapping to `server.js`
- hourly cron call to `/api/cron/maintenance`

## 2) Configure backend environment variables

Use `server/.env.example` as baseline.

Required minimum:

- `PROD_PG_URL`
- `JWT_SECRET`
- `FRONTEND_URL` (your frontend Vercel domain)
- `BACKEND_URL` (your backend Vercel domain)
- `CRON_SECRET` (mandatory to secure cron endpoint)

Feature-specific keys (if those features are enabled):

- Cloudinary
- Supabase
- Email provider
- Firebase FCM

## 3) Deploy frontend on Vercel

Create another Vercel project for `client/`:

- Root directory: `client`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

`client/vercel.json` already handles SPA rewrites.

Set frontend envs:

- `VITE_API_URL=https://<your-backend-vercel-domain>`
- `VITE_cloud_name=<your-cloudinary-cloud-name>`

## 4) Cron jobs in serverless mode

Because Vercel Functions are not always running, `setInterval` is not used in production serverless runtime.

Maintenance tasks are executed through:

- `POST /api/cron/maintenance`
- hourly scheduler from `server/vercel.json`
- `Authorization: Bearer <CRON_SECRET>` verification in backend

## 5) Recruiter demo mode

Recommended:

- one demo admin account
- one demo learner account
- one stable certificate ID for verification page

Keep sample data clean and non-sensitive.

## 6) 2-minute recruiter script

1. Open landing page
2. Login with demo learner
3. Open a course and show progress area
4. Open forum and one topic
5. Open certificate verification URL

## 7) Quick health checks after deploy

- Backend responds on `GET /api`
- Frontend loads and calls API successfully
- Auth route works
- One course route works
- Certificate verification route works
