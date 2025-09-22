[![wakatime](https://wakatime.com/badge/github/AlexPT2k22/PINT-SoftSkills.svg)](https://wakatime.com/badge/github/AlexPT2k22/PINT-SoftSkills)

# SoftSkills - A project for Softinsa (an IBM subsidiary)

> Training & progress-tracking platform for remote teams — full-stack project with a Vite front-end and a Node/Express API. Features email delivery, media storage, PDF certificate generation and interactive experiences.

**Demo:** https://pint-soft-skills.vercel.app/

---

## Table of contents
- [About](#about)  
- [Features](#features)  
- [Tech stack](#tech-stack)  
- [Getting started (local)](#getting-started-local)  
- [Environment variables (example)](#environment-variables-example)  

---

## About
**SoftSkills** is a platform designed to centralize team training, track user progress and issue certificates. The project combines a modern front-end with server-side features (API, email delivery, file management, PDF generation)

---

## Features
- Admin panel for creating and managing courses.  
- User enrollment and progress tracking.  
- Email notifications and certificate delivery.  
- Media upload & storage (Cloudinary / Supabase suggested).  
- PDF certificate generation.  
- Auth / protected routes for users and admins.

---

## Tech stack
Core technologies used in the project (adjust as necessary to match your code):
- Vite
- NodeJS
- ExpressJS
- Render (API and Database hosting)
- PostgreSQL
- Resend (Email sending)
- Zustand (State management)
- Cloudinary (Image and video storage)
- PDFmaker (For certificates)
- Supabase (Store files)

---

## Getting started (local)

> Requirements: Node.js, npm or pnpm, PostgreSQL (or another compatible DB)

1. Clone the repo:
bash git clone https://github.com/AlexPT2k22/PINT-SoftSkills.git
cd PINT-SoftSkills

2.Install server dependencies:
cd server
npm install

3.Install client dependencies:
cd ../client
npm install

4.Create .env files (see example below) and start both apps
# In one terminal (server)
cd server
npm run dev

# In another terminal (client)
cd client
npm run dev

> Note: Replace npm run dev with the exact commands defined in each package.json if they differ (start, dev:server, etc.).

## Environment variables (example)

# Server

DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
PORT=4000
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://...
RESEND_API_KEY=your_resend_key
SUPABASE_URL=https://...
SUPABASE_KEY=...
NODE_ENV=development

# Client

VITE_API_BASE_URL=http://localhost:4000/api
VITE_CLOUDINARY_KEY=your_cloudinary_key
