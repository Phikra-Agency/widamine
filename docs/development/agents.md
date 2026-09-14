# AI Agents Guide

> Read this first. Every agent session starts here.

---

## Repo

```
/home/alae/Documents/repos/widamine
Branch: latest (HEAD)   ← all work here
main is stale — do NOT use main
```

---

## Starting the local stack

```bash
# 0. Unset Tor proxy (REQUIRED — breaks SMTP + Groq if set)
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# 1. DB — use local PostgreSQL
# Edit api/.env: DATABASE_URL=postgresql://postgres@127.0.0.1:5432/widamine_main

# 2. Start each service (separate terminals or tmux windows)
cd api && npm run dev              # :3000
cd landing && npm run dev          # :5173
cd admin && npm run dev            # :5174
```

Verify:
```bash
ss -tlnp | grep -E '3000|5173|5174'
curl http://localhost:3000/public/motifs
```

If API crashes with `Cannot find module 'dist/main'` → run `cd api && npm run build` first.

---

## Environment Gotchas

| Gotcha | Fix |
|--------|-----|
| `HTTP_PROXY`/`HTTPS_PROXY` → Tor (`127.0.0.1:9251`) in shell profile | `unset` all before starting API or pushing large files |
| Landing vite proxy → port **3001** not 3000 | Don't change — matches docker-compose port mapping |
| Admin vite proxy → port **3000** | Correct for direct local dev |
| `api/.env` DATABASE_URL points to prod by default | Change to local URL for offline dev |
| API needs `npm run build` after new TS files added | Always build before running `npm run dev` if new modules were created |
| WhatsApp QR scan needed on first run | Set `WHATSAPP_ENABLED=true`, scan QR in terminal, session saves |

---

## Project Structure

```
widamine/
├── api/                   NestJS API (:3000)
│   ├── prisma/            Schema (schema.prisma) + seed.ts
│   ├── src/
│   │   ├── app.module.ts  All modules registered here
│   │   ├── appointment/   Appointment CRUD + notifications
│   │   ├── chatbot/       Groq chatbot (model: openai/gpt-oss-20b)
│   │   ├── clinic-info/   Read-only public endpoints for chatbot
│   │   ├── cron/          30-min job: expire + remind
│   │   ├── mail/          SMTP mail service
│   │   ├── sms/           WhatsApp (OpenWA) + SMS
│   │   ├── settings/      AppSettings (notification toggles)
│   │   ├── unavailability/ Practitioner unavailability
│   │   └── ...            auth, user, patient, motif, resource, etc.
│   └── .env               Secrets — do NOT commit changes
├── admin/                 Staff dashboard (:5174)
│   └── src/
│       ├── pages/back-office/   All admin pages
│       ├── components/          UI + layout
│       └── stores/              Zustand state
├── landing/               Public site (:5173)
│   └── src/
│       ├── pages/         Home, About, Contact, ServiceCategory, ServiceDetail
│       ├── components/    Navbar, Footer, BookingFlow, Chatbot, BmiPopup, etc.
│       ├── stores/        Zustand state
│       └── lib/           theme.tsx (C.primary=#009FD6), siteContent.ts
├── docs/                  ← you are here
├── AGENTS.md              Workspace-level agent rules (STRICT MODE)
└── NOTIFICATION_FIX_SUMMARY.md   Mail system reference
```

---

## Strict Execution Loop (mandatory)

Every non-trivial change must follow:

1. **Inspect** — read/grep actual files. Never edit from memory.
2. **Plan** — state exact file + line numbers + what changes.
3. **Patch** — smallest diff that works. No drive-by refactors.
4. **Verify** — run `npm run build` in affected workspace. Show raw output.

On failure: stop, show raw error verbatim, fix root cause. Do not silently retry.

---

## Useful Commands

```bash
# Build verification (run after any code change)
cd api && npm run build
cd landing && npm run build
cd admin && npm run build

# Database
cd api
npx prisma studio              # Visual DB browser at :5555
npx prisma migrate dev         # New migration (local only)
npx prisma migrate deploy      # Apply migrations (prod)
npx prisma generate            # Regenerate client after schema change
npm run seed                   # Seed: admin + doctors + motifs + patients

# Push to prod
git add <files>
git commit -m "..."
no_proxy='*' NO_PROXY='*' git push origin latest

# Coolify deploy (needs fresh Bearer token from user)
curl -s "https://server.wa-pharma.com/api/v1/deploy?uuid=tyfa0ow9za5ohqn69dh9zhh4&force=true" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@widamine.com | admin123 | ADMIN |
| Doctor 1 | ahmed@widamine.com | doctor123 | DOCTOR |
| Doctor 2 | fatima@widamine.com | doctor123 | DOCTOR |
| Doctor 3 | youssef@widamine.com | doctor123 | DOCTOR |
| Doctor 4 | nadia@widamine.com | doctor123 | DOCTOR |
| Reception | samir@widamine.com | reception123 | RECEPTIONIST |

---

## What Has Been Done (don't redo)

- **Mail system rebuilt** — `appointment-notification.service.ts` is single template source. Brand theme matches landing. 8 triggers verified e2e with real SMTP. No Brevo — uses direct SMTP.
- **Chatbot upgraded** — Model changed to `openai/gpt-oss-20b`. System prompt improved (FAQ-first, natural lead capture). `ClinicInfoModule` added with 5 read-only endpoints for live data.
- **Landing UI polish** — Navbar CamelCase, dropdown spacing, logo swapped, team cards grown, dots removed, gallery enlarged, star colors, footer social icons duotone `#009FD6`, service links `rgb(26,54,70)`, "Réalisé avec ❤️" removed.
- **Home layout** — Dr. Widad image left on desktop, map left in ConsultSection.
- **BookingFlow** — Dr. portrait row on mobile (90×90px), full column on desktop.
- **BMI popup** — Added `BmiPopup.tsx` + `bmiPopupStore`, integrated with chatbot.
- **Unavailability module** — Practitioners can have time blocks (`PractitionerUnavailability` model).
- **SettingsModal** — `admin/src/components/SettingsModal.tsx` — notification channel toggles UI (untracked, to be wired to Settings page).
- **Prod admin login** — Fixed by seeding the missing admin user on prod DB.

## Known Non-Bugs (don't chase)

- Firefox `file:///` Security Error on admin login → Chromium is clean. No `file://` in code/DB. Browser-side issue only.
- `docs/packages/api.md` previously mentioned Brevo → code uses SMTP. Docs now corrected.
- `browser-use` AI tool returns `model_not_found` → broken, don't use. Use `puppeteer_*` or `curl`.

## Pending / Unresolved

- `admin/src/components/SettingsModal.tsx` — untracked file. Real component (email/WhatsApp toggles). Needs to be wired into `admin/src/pages/back-office/Settings.tsx` and committed.
- Root `*.md` junk files (30+) — safe to delete all except `README.md`, `AGENTS.md`, `NOTIFICATION_FIX_SUMMARY.md`, `WHATSAPP_SETTINGS_INTEGRATION.md`.
- `landing/scripts/_backup/` — old image files, safe to delete.
- `landing/src/components/BookingFlow.tsx` — modified, uncommitted. Build passes.
- Coolify Bearer token expired — ask user for fresh token before any prod deploy.
