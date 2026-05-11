# DuoMath Deployment Guide

## Option 1: Vercel (Frontend) + Railway (Backend + PostgreSQL)

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your GitHub repository with this project
4. Railway will detect the backend. Configure:
   - Root directory: `backend`
   - Build command: `npm run build`
   - Start command: `npm run start`
5. Add PostgreSQL service:
   - Click "+ New Service" → "Database" → "PostgreSQL"
6. Add environment variables to backend service:
   - `DATABASE_URL` (Railway auto-provides this)
   - `JWT_ACCESS_SECRET` → generate a random string (32+ chars)
   - `JWT_REFRESH_SECRET` → generate a random string (32+ chars)
   - `PORT` → `4000`
   - `NODE_ENV` → `production`
7. Click "Deploy"
8. After deployment, copy the Railway URL (e.g., `https://duomath-backend.up.railway.app`)

### Step 2: Run Database Migration on Railway

1. Go to your Railway project → PostgreSQL service
2. Click "Console" or "Query"
3. Run the migration:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
   ```
4. Run the seed data:
   - Copy content from `infra/seed_math.sql`
   - Paste and execute in the console

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework preset: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` → your Railway backend URL + `/api` (e.g., `https://duomath-backend.up.railway.app/api`)
6. Click "Deploy"
7. After deployment, copy the Vercel URL

### Step 4: Update CORS in Backend

1. Go to Railway → Backend service → Variables
2. Add `FRONTEND_URL` → your Vercel URL (e.g., `https://duomath.vercel.app`)
3. Update `backend/src/app.ts` to use this variable for CORS:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || "*"
   }));
   ```
4. Redeploy backend on Railway

### Step 5: Test

1. Open your Vercel URL
2. Try to register/login
3. Check that all pages work (dashboard, lessons, profile)

## Environment Variables Reference

### Backend (Railway)
- `DATABASE_URL` — PostgreSQL connection string (Railway provides)
- `JWT_ACCESS_SECRET` — Random 32+ character string
- `JWT_REFRESH_SECRET` — Random 32+ character string
- `PORT` — 4000
- `NODE_ENV` — production
- `FRONTEND_URL` — Your Vercel URL for CORS

### Frontend (Vercel)
- `VITE_API_URL` — Railway backend URL + `/api`

## Troubleshooting

### "Failed to fetch" errors
- Check `VITE_API_URL` in Vercel settings
- Verify backend is deployed and accessible
- Check CORS settings in backend

### Database connection errors
- Verify `DATABASE_URL` is set correctly in Railway
- Check PostgreSQL service is running
- Ensure schema is migrated (run ALTER TABLE command)

### Build errors
- Check `package.json` scripts are correct
- Ensure all dependencies are installed
- Check build logs in Railway/Vercel
