# Quick start

## Prerequisites

- Node.js 20+
- MongoDB 7 as a **replica set** (Prisma transactions)

## Steps

```bash
# 1. MongoDB
./start-mongodb.sh

# 2. Install dependencies + Prisma client
npm run bootstrap

# 3. Seed admin user (first time)
npm run db:seed

# 4. Start all apps
npm run dev
```

## URLs

| App | URL |
|-----|-----|
| Landing | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API | http://localhost:3000 |

## Staff login

`admin@widamine.com` / `admin123`

## Environment

Copy `api/.env.example` to `api/.env` and set `JWT_SECRET`, `DATABASE_URL`, and optional email keys.

Front-end apps default `VITE_PUBLIC_API_URL` to `/api` (proxied to the API in dev and nginx in Docker).

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Turbo: api + admin + landing |
| `npm run build` | Production build for all packages |
| `npm run lint` | Lint all workspaces |
| `bash scripts/dev.sh` | Mongo + turbo dev |
