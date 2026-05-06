# US Hospital Intelligence Dashboard — Deploy to Vercel

## Quick Deploy (3 steps)

### Option A: Vercel CLI (recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel
1. Push this repo to GitHub
2. Go to vercel.com/new → Import repository  
3. Framework: Next.js (auto-detected)
4. Click Deploy

### Option C: Vercel Dashboard drag-and-drop
1. Zip this folder (excluding node_modules and .next)
2. Go to vercel.com/new → drag zip

## Database Setup (optional — for future edit capability)
1. In Vercel dashboard → Storage → Create Postgres database
2. Copy the connection string env vars to your Vercel project settings
3. Visit /api/seed to initialize and seed the database

## Environment Variables needed for DB
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NO_SSL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
