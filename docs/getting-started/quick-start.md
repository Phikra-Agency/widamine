# Quick start

## Prerequisites

- Node.js 20+
- MongoDB 7+ as a **replica set** (Prisma transactions)

## Steps

```bash
# 1. Start MongoDB replica set
./start-mongodb.sh

# 2. Install dependencies + generate Prisma client
npm run bootstrap

# 3. Seed database
npm run db:seed

# 4. Start all apps (turbo)
npm run dev
```

## URLs

| App | URL |
|-----|-----|
| Landing (public) | http://localhost:5173 |
| Admin (staff) | http://localhost:5174 |
| API | http://localhost:3000 |

## Staff login

`admin@widamine.com` / `admin123`

## Environment

Copy `api/.env.example` to `api/.env` and set required vars:

```env
JWT_SECRET=<your-secret>
GROQ_API_KEY=<groq-api-key>   # for chatbot
```

`VITE_PUBLIC_API_URL` defaults to `/api` (proxied to API in dev and via nginx in Docker).

## Proxy env vars

The system may have `HTTP_PROXY`/`HTTPS_PROXY` pointing to Tor — these break the chatbot. Always unset before starting dev:

```bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
```

## Chatbot lead capture

The chatbot on the landing page collects visitor name + email and stores in `ChatLead` collection. Requires `GROQ_API_KEY` in `api/.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Turbo: api + admin + landing |
| `npm run build` | Production build |
| `npm run lint` | Lint all workspaces |
| `npm run db:seed` | Seed demo data |
