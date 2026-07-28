# Widamine — Agent Guide

## Quick start

```bash
# 1. MongoDB with replica set
nohup mongod --dbpath ~/mongodb_data --replSet rs0 --port 27017 > /dev/null 2>&1
sleep 3
mongosh --quiet --eval 'rs.initiate()'

# 2. Install + generate Prisma client + seed
npm run bootstrap
npm run db:seed

# 3. Start all apps
npm run dev
```

Login: `admin@widamine.com` / `admin123`

## Architecture

```
widamine/
├── api/               NestJS + Prisma + MongoDB (:3000)
├── admin/             Staff app — Vite + shadcn/ui (:5174)
├── landing/           Public site (:5173)
├── docs/              Documentation
└── start-mongodb.sh
```

## Critical requirements

### MongoDB replica set

Prisma needs transactions. Standalone MongoDB fails.

```bash
./start-mongodb.sh
# or manually:
mongod --dbpath ~/mongodb_data --replSet rs0 --port 27017 --fork --logpath /tmp/mongod.log
mongosh --quiet --eval 'rs.initiate()'
```

Verify: `mongosh --quiet --eval 'rs.status().ok'` → `1`

### Env files

**`api/.env`** (required):

```env
DATABASE_URL=mongodb://127.0.0.1:27017/widamine?replicaSet=rs0
JWT_SECRET=your-secret
GROQ_API_KEY=gsk_...          # for chatbot
BREVO_API_KEY=xkeysib-...     # optional, for email
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=info@...
VITE_ADMIN_URL=http://localhost:5174
```

**`api/.env`** does NOT inherit from root `.env`. Set vars directly in `api/.env`.

### Proxy env vars

The system has `HTTP_PROXY` / `HTTPS_PROXY` env vars pointing to Tor (127.0.0.1:9251). These break API outbound calls (Groq chatbot, etc.). Always unset before starting:

```bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
```

## Proxy (Vite)

Vite proxies `/api` → `http://127.0.0.1:3000` with path rewrite (`/api` stripped).  
So frontend calls `/api/chatbot/message` → API receives `POST /chatbot/message`.

## Default users

| Role         | Email              | Password     |
|--------------|--------------------|--------------|
| ADMIN        | admin@widamine.com | admin123     |
| DOCTOR       | ahmed@widamine.com | doctor123    |
| DOCTOR       | fatima@widamine.com| doctor123    |
| DOCTOR       | youssef@widamine.com| doctor123   |
| DOCTOR       | nadia@widamine.com | doctor123    |
| RECEPTIONIST | samir@widamine.com | reception123 |

## Common fixes

| Issue | Fix |
|-------|-----|
| Prisma transaction errors | Start Mongo replica set |
| Chatbot fallback response | Missing `GROQ_API_KEY` in `api/.env` |
| Chatbot not responding | Proxy env vars blocking outbound HTTPS — unset them |
| Login "email_not_found" | DB wiped — re-seed: `npm run db:seed` |
| Patient DELETE 500 | Related appointments exist — cascade delete |

## Chatbot

- **Model**: `llama-3.3-70b-versatile` via Groq API
- **Lead capture**: Always asks for name + email first, stores in `ChatLead` collection
- **Tools**: `store_lead`, `get_services`, `get_service_details`, `get_team`, `get_business_info`, `trigger_popup`

## Admin conventions

- Import UI from `@/components/ui` (shadcn/ui)
- CRUD overlays: `FormDialog` from `@/components/bo/FormDialog`
- Layout utilities: `bo-page`, `bo-chip`, etc. in `index.css`
- No entrance animations
- `npx shadcn add <name> -y` from `admin/`
