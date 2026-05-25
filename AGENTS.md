# Widamine — Full Setup Guide for AI Agents

## Quick Start

```bash
# 1. Start MongoDB as replica set (REQUIRED — Prisma needs transactions)
./start-mongodb.sh

# 2. Backend
cd backend
cp .env.example .env   # edit credentials
npm install
npx prisma generate
npm run seed            # creates admin + demo data
npm run start:dev       # starts on :3000

# 3. Frontend
cd frontend
npm install
npm run dev             # starts on :5173, proxies /api → :3000

# 4. Login: admin@widamine.com / admin123
```

## Architecture

```
widamine/
├── backend/          # NestJS + Prisma + MongoDB
│   ├── src/          # Controllers, services, modules
│   ├── prisma/       # Schema + seed
│   └── dist/         # Compiled JS (build before prod run)
├── frontend/         # React + Vite + Tailwind v4 + Framer Motion
│   └── src/
│       ├── pages/back-office/   # 12 lazy-loaded pages
│       ├── components/          # Shared components
│       └── stores/              # Zustand stores
├── start-mongodb.sh  # MongoDB replica set startup
└── AGENTS.md         # This file
```

## Critical Requirements

### MongoDB MUST run as a replica set
Prisma ORM requires transactions for writes. Standalone MongoDB will fail.

```bash
# start-mongodb.sh handles this automatically:
mongod --replSet rs0 --dbpath /data/db --port 27017 --fork --logpath mongod.log
mongosh --eval 'rs.initiate()'
```

Verify: `mongosh --eval 'rs.status().ok'` → `1`

### Backend env (backend/.env)
```env
DATABASE_URL=mongodb://localhost:27017/widamine
JWT_SECRET=your-secret
BREVO_API_KEY=xkeysib-...   # optional, falls back to Ethereal
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=verified-sender@email.com
```

### Frontend env (frontend/.env)
```env
VITE_PUBLIC_API_URL="/api"   # Vite proxy → :3000
```

## Database Roles & Default Users

| Role            | Email                  | Password    |
|-----------------|------------------------|-------------|
| ADMIN           | admin@widamine.com     | admin123    |
| DOCTOR          | dr.slaoui@widamine.com | doctor123   |
| RECEPTIONIST    | Contact in seed        | —           |

Seed: `cd backend && npm run seed`

## Key Conventions

### Back-office UI (12 pages)
- **Entrance animation**: `0.4s, ease [0.22, 1, 0.36, 1], y:20` on all pages
- **Page layout**: `bo-page` > `bo-page-inner bo-page-stack` > `bo-section-stack` + scrollable content
- **Utility classes** (in `index.css`): `bo-surface`, `bo-title`, `bo-subtitle`, `bo-primary-btn`, `bo-fab`, `bo-glass`, `bo-input`, `bo-select`, `bo-page`, `bo-page-inner`, `bo-page-stack`, `bo-section-stack`, `bo-page-scroll`
- **Modal standard**: `shadow-bo-elevated` + `border-black/[0.06]` + `bo-glass` backdrop
- **All pages lazy-loaded** via `React.lazy` with `Suspense`
- **FABs**: `bo-fab lg:hidden` (mobile only), desktop gets `hidden lg:inline-flex` button in heading

### Tailwind v4
- Uses `@import 'tailwindcss'` + `@theme` directive in `index.css`
- Theme colors: `--color-primary: #2e90c0`, `--color-secondary: #1a3646`, `--color-accent: #e8c5b8`

### Fonts
- Amoria (display): `/public/fonts/Amoria.otf`
- Raleway (body): Google Fonts

## Common Fixes

### "Prisma needs transactions" / write operations fail
→ MongoDB not running as replica set. Run `./start-mongodb.sh`.

### "Field service is required, got null" on motifs
→ A motif has a `serviceId` pointing to a non-existent service. Delete the motif or fix the reference.

### "Voir détails" navigates to appointments instead of patients
→ `ScheduleShowModal.tsx:goToDetails()` uses role check. The current fix navigates by `patient.id` when available, regardless of role.

### Patient DELETE returns 500
→ Patient has related appointments. The `remove()` method now deletes schedules, notificationLogs, and appointments first.

### Backend build
`cd backend && npx nest build` → output in `dist/src/main.js`
Run with: `node dist/src/main.js`

### CSS not applying
`index.css` uses Tailwind v4 — run `npm run dev` (Vite handles compilation). On production, CSS is inlined.

## Important Gotchas

1. **Zustand caching**: Dashboard stats store caches with `if (stats) return`. Full page refresh (F5) needed to clear.
2. **Prisma nested writes**: Even with replica set, explicit separated writes (deleteMany + create) are preferred over nested connect/create for clarity.
3. **settings.service.ts** uses `$runCommandRaw` for upsert (legacy — replica set now enables normal ORM writes).
4. **MotifPractitioner deleteMany/create loop**: Used instead of Prisma's nested set for reliability.
5. **notificationEmail**: Optional `String?` on User model. Falls back to `doctor.email` if null.
