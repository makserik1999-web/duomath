# Deployment Guide

## Backend (Render/Railway/Fly)
1. Create service from `backend` folder.
2. Set env vars from `infra/.env.backend.example`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm run start`.
5. Provision PostgreSQL and set `DATABASE_URL`.

## Frontend (Vercel/Netlify)
1. Create project from `frontend` folder.
2. Set `VITE_API_URL` to public backend API URL.
3. Build command: `npm install && npm run build`.
4. Publish folder: `dist`.

## Health checks
- Backend: `GET /health`
- Frontend: open `/auth`, complete login, start a lesson, submit answers.
