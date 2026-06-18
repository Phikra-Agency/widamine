# Widamine — Agent Setup Guide

## Quick start

```bash
./start-mongodb.sh
npm run bootstrap
npm run db:seed
npm run dev
```

Login: `admin@widamine.com` / `admin123`

## Architecture

```
widamine/
├── package.json       # npm workspaces + turbo
├── turbo.json
├── docker-compose.yml
├── api/               # NestJS + Prisma + MongoDB (:3000)
├── admin/             # Staff app — Vite + shadcn/ui (:5174)
├── landing/           # Public site (:5173)
├── docs/              # Documentation
└── start-mongodb.sh
```

## Critical requirements

### MongoDB replica set

Prisma needs transactions. Standalone MongoDB fails.

```bash
./start-mongodb.sh
# or: docker compose up mongo mongo-init
```

Verify: `mongosh --eval 'rs.status().ok'` → `1`

### API env (`api/.env`)

```env
DATABASE_URL=mongodb://localhost:27017/widamine
JWT_SECRET=your-secret
BREVO_API_KEY=xkeysib-...   # optional
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=verified-sender@email.com
```

### Front-end apps

Default `VITE_PUBLIC_API_URL=/api` (Vite/nginx proxy → API).

## Default user

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| ADMIN | admin@widamine.com | admin123  |

Seed: `npm run db:seed`

## Admin conventions

- Import UI from `@/components/ui`
- CRUD overlays: `FormDialog` from `@/components/bo/FormDialog`
- Layout utilities in `admin/src/index.css` (`bo-page`, `bo-chip`, …)
- No entrance animations
- `npx shadcn add <name> -y` from `admin/`

## Common fixes

| Issue | Fix |
|-------|-----|
| Prisma transaction errors | Start Mongo replica set |
| Motif `service is required, got null` | Fix or delete orphan motif `serviceId` |
| Patient DELETE 500 | Related appointments exist — cascade delete in service |
| API build | `npm run build --workspace=widamine-api` → `api/dist/src/main.js` |

## Gotchas

1. Zustand stats cache — F5 to refresh
2. Prefer explicit `deleteMany` + `create` over nested Prisma writes
3. `MotifPractitioner` uses deleteMany/create loop
4. `notificationEmail` on User falls back to `doctor.email`
