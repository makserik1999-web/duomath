# DuoMath

## Product goal
Build a Duolingo-style math platform for students from 8th grade and above with short lessons, instant checks, and progress motivation.

## Target audience
- Student only (self-study mode).

## MVP scope
- Student can register and login.
- Student can open math topics and see lessons.
- Student can pass a lesson with step-by-step questions.
- Student gets instant result with score, XP update, streak update, and achievements.
- Student sees personal learning dashboard (progress, XP, streak).

## Core learning loop
`choose topic -> start lesson -> answer questions -> instant validation -> gain XP -> keep streak`

## Out of scope (post-MVP)
- Teacher and parent roles.
- Classroom management.
- Realtime multiplayer challenges.
- Payments and subscriptions.

## MVP done criteria
- Full auth flow works (`register`, `login`, `refresh`, `logout`, `me`).
- Core learning flow works end-to-end for at least one seeded lesson.
- XP, streak, and achievements update correctly after submit.
- Backend and frontend build successfully in CI.
- Basic tests are green.
- Staging and production deployment guides are documented.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Auth: JWT access + refresh tokens
- Infra: Docker Compose

## Project structure
- `frontend` - React application
- `backend` - API server
- `infra` - Docker compose and env templates
- `.github/workflows` - CI pipelines

## Core metrics for first cycle
- Registration -> first lesson started
- Lesson completion rate
- Day 1 / Day 7 retention
- Users with 3-day streak
- Users reaching 100 XP

## Quick start
1. Copy env templates:
   - `copy infra\.env.backend.example infra\.env.backend`
   - `copy infra\.env.frontend.example infra\.env.frontend`
2. Start database:
   - `docker compose -f infra/docker-compose.yml up -d`
3. Install and run:
   - Backend: `cd backend && npm install && npm run dev`
   - Frontend: `cd frontend && npm install && npm run dev`
