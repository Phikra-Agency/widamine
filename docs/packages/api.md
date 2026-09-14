# API (`api/`)

NestJS 10 REST API — Prisma 5 ORM — PostgreSQL.

---

## Dev

```bash
# From repo root
npm run dev --workspace=widamine-api

# Or directly
cd api && npm run dev
```

Listens on **:3000**.

> **Proxy gotcha (landing dev):** `landing/vite.config.ts` proxies `/api` → `http://127.0.0.1:3001` (port 3001, not 3000). Admin proxies to 3000. Keep this in mind when testing locally.

> **Shell proxy gotcha:** `HTTP_PROXY`/`HTTPS_PROXY` in shell profile point to Tor (`127.0.0.1:9251`). This breaks outbound HTTPS (Groq, SMTP). Run:
> ```bash
> unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
> ```
> before starting the API locally.

---

## Database

PostgreSQL. Two environments:

| Env | URL |
|-----|-----|
| **Production (default in .env)** | `postgresql://postgres:...@91.98.161.53:5420/postgres` |
| **Local (offline dev)** | `postgresql://postgres@127.0.0.1:5432/widamine_main` |

Switch `DATABASE_URL` in `api/.env` to use local DB.

---

## Auth

JWT cookies. Public endpoints carry no guard. Staff endpoints use `AuthGuard` + optional `RoleGuard`.

**Roles:** `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PRACTITIONER`

**Seeds:**
- `admin@widamine.com` / `admin123` (ADMIN)
- `ahmed/fatima/youssef/nadia@widamine.com` / `doctor123` (DOCTOR)
- `samir@widamine.com` / `reception123` (RECEPTIONIST)

---

## Modules & Routes

| Module | Route prefix | Auth |
|--------|-------------|------|
| auth | `/login`, `/refresh`, `/logout` | Public |
| user | `/users` | AuthGuard |
| patient | `/patients` | AuthGuard |
| appointment | `/appointments` | AuthGuard |
| schedule | `/schedules` | AuthGuard |
| session | `/sessions` | AuthGuard |
| motif | `/motifs` | AuthGuard |
| motif (public) | `/public/motifs` | Public |
| resource | `/resources` | AuthGuard |
| contact | `/contacts` | AuthGuard |
| dashboard | `/dashboard` | AuthGuard |
| settings | `/settings` | AuthGuard |
| unavailability | `/unavailability` | AuthGuard |
| chatbot | `/chatbot/message` | Public |
| clinic-info | `/clinic-info/*` | Public (read-only) |
| search | `/search` | AuthGuard |

### Clinic-Info endpoints (read-only, public)

```
GET /clinic-info/appointments/stats?period=today|week|month
GET /clinic-info/services/available
GET /clinic-info/services/by-practitioner
GET /clinic-info/practitioners/availability
GET /clinic-info/business-hours
```

Used by the chatbot to answer real-data questions about reservations, services, and staff.

---

## Notifications

Single source: `src/appointment/appointment-notification.service.ts`

**Email:** Real SMTP delivery via `smtp.widamineaestheticcenter.com:465`.  
**WhatsApp:** OpenWA (`src/sms/whatsapp.service.ts`) — set `WHATSAPP_ENABLED=true` and scan QR on first run. Session persisted.  
**Per-channel toggles:** `AppSettings` model (singleton, key `"default"`).

**8 notification triggers:**
1. New booking → patient acknowledgment
2. Confirmed → patient confirmation (email + WA)
3. Cancelled → patient cancellation (email + WA) + doctor notice
4. 24h before → patient reminder (email + WA)
5. 1h before → patient reminder (email + WA)

**Template brand:** `#009FD6` primary · `#FBF7EF` bg · `#F7A269` accent · white card · serif headings. No emoji, no note boxes. Footer = site link only.

---

## Chatbot

`POST /chatbot/message` — public, stateless (history passed by client).

| Setting | Value |
|---------|-------|
| Provider | Groq API |
| Model | `openai/gpt-oss-20b` |
| URL | `https://api.groq.com/openai/v1/chat/completions` |
| Key | `GROQ_API_KEY` in `api/.env` |

**Tools available to model:**
- `store_lead` — saves name + email to `ChatLead`
- `get_clinic_stats` — live appointment stats (period: today/week/month)
- `get_services_info` — active motifs with practitioner assignments
- `get_practitioners_info` — team + availability
- `get_business_hours` — address, phone, hours
- `trigger_popup` — signals frontend to open booking or contact modal

**Behaviour:** Answers FAQs naturally first, then asks for name + email. Does not hard-block before answering.

---

## Cron Jobs

`src/cron/cron.service.ts` — runs every 30 minutes:
1. **Expire pending appointments** past `pendingTtlHours`
2. **Send reminders** — 24h and 1h before confirmed appointments (delegates to `AppointmentNotificationService.sendReminder()`)

---

## Environment (`api/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:...@91.98.161.53:5420/postgres
# For local: DATABASE_URL=postgresql://postgres@127.0.0.1:5432/widamine_main

# Auth
JWT_SECRET=<required>

# SMTP
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=admin@widamineaestheticcenter.com
SMTP_PASS=<password>
SMTP_FROM_NAME=Widamine Aesthetic Center
SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com

# Chatbot
GROQ_API_KEY=<required>

# WhatsApp (optional)
WHATSAPP_ENABLED=false   # set true + scan QR to enable

# Server
API_PORT=3000
```

---

## Prisma

```bash
cd api
npx prisma studio              # Visual DB editor at :5555
npx prisma migrate dev         # Create + apply new migration (local only)
npx prisma migrate deploy      # Apply existing migrations (prod)
npx prisma generate            # Regenerate client after schema changes
npm run seed                   # Seed demo data (admin + doctors + motifs)
npm run build                  # Compile TypeScript → dist/
```

> After any schema change: `npx prisma generate` then `npm run build` before running.

---

## Data Models

| Model | Key fields |
|-------|------------|
| User | id, name, email, role (ADMIN/DOCTOR/RECEPTIONIST/PRACTITIONER) |
| Patient | id, firstName, lastName, phone (unique), email |
| Motif | id, name, slug, duration, numberOfSessions, isActive, category |
| Session | id, number, duration, motifId |
| Appointment | id, patientId, motifId, practitionerId, resourceId, status |
| Schedule | id, datetime, sessionId, appointmentId |
| Resource | id, name, slug, type |
| MotifPractitioner | motifId × practitionerId, priority, isActive |
| MotifResource | motifId × resourceId, priority |
| ResourcePractitioner | resourceId × practitionerId |
| PractitionerUnavailability | practitionerId, startDate, endDate, startTime, endTime |
| AvailabilityBlock | startsAt, endsAt, practitionerId (null = global) |
| Contact | name, email, phone, context, read |
| ChatLead | name, email |
| NotificationLog | appointmentId, channel, recipientType, recipient |
| AppSettings | singleton key "default", per-channel + per-type toggles |
