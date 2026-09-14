# Widamine Architecture

> System architecture — models, flows, services. Last updated: 2026-09-14.

---

## Overview

A medical practice automation platform for Widamine Aesthetic Center (Fès, Maroc). One landing page for patients, one admin dashboard for staff, one API powering both.

| App | Tech | Port (dev) | Domain (prod) |
|-----|------|-----------|---------------|
| Landing | Vite 8 + React 19 + Tailwind | 5173 | new.widamineaestheticcenter.com |
| Admin | Vite 8 + React 19 + shadcn/ui | 5174 | admin.widamineaestheticcenter.com |
| API | NestJS 10 + Prisma 5 + PostgreSQL | 3000 | api.widamineaestheticcenter.com |

**Branch:** `latest` (HEAD). `main` is stale — all work on `latest`.  
**DB:** PostgreSQL. Cloud (Coolify `91.98.161.53:5420`) used by default. Local (`127.0.0.1:5432/widamine_main`) for offline dev.

---

## Core Domain

### Motif — The Building Block

A Motif is a self-contained "care product" — the reason for visit.

```
Motif
├── Identity: name, slug, description, color, category, isActive
├── Duration: session length (minutes)
├── Sessions: numberOfSessions (1 = one-off, N = treatment plan)
├── Practitioners: who can do it (MotifPractitioner join table)
├── Rooms: where it can happen (MotifResource join table)
└── Booking rules: requiresPractitionerChoice, pendingTtlHours, isOnlineBookable
```

No Service/Category model — Motif is the atom.

### Appointment Lifecycle

```
PENDING → CONFIRMED → COMPLETED
               └─→ CANCELLED
PENDING → EXPIRED  (cron, after pendingTtlHours)
```

### Patient Flow

```
Landing → Select motif → Pick practitioner (optional) → Pick time → Fill info → PENDING
Admin reviews → CONFIRMED (room auto-assigned, notification sent)
Patient visits → COMPLETED → next session unlocked
```

---

## Data Models

| Model | Description |
|-------|-------------|
| User | Staff accounts — roles: ADMIN, DOCTOR, RECEPTIONIST, PRACTITIONER |
| Patient | Patient records, deduplicated by phone |
| Motif | Treatment/service definition |
| Session | Session number + duration per motif |
| Appointment | A booked visit (patient × motif × practitioner × room) |
| Schedule | Datetime slot(s) for an appointment |
| Resource | Room or equipment |
| MotifPractitioner | Which practitioners can perform a motif |
| MotifResource | Which rooms a motif can use |
| ResourcePractitioner | Practitioner–room assignment |
| PractitionerUnavailability | Blocks off practitioner time ranges |
| AvailabilityBlock | System-wide closure blocks |
| Contact | Contact form submissions (in-app only, no email sent) |
| ChatLead | Chatbot visitor name + email (lead capture) |
| NotificationLog | Notification delivery log (channel, recipient, type) |
| AppSettings | Singleton — notification toggles per channel/type |

---

## API Modules

| Module | Prefix | Notes |
|--------|--------|-------|
| auth | `/login`, `/refresh`, `/logout` | JWT cookie auth |
| user | `/users` | Staff CRUD |
| patient | `/patients` | Patient CRUD |
| appointment | `/appointments` | Full lifecycle, availability |
| schedule | `/schedules` | Datetime slot management |
| session | `/sessions` | Session definitions per motif |
| motif | `/motifs`, `/public/motifs` | Treatment definitions; `/public/*` unguarded |
| resource | `/resources` | Room/equipment CRUD |
| contact | `/contacts` | Contact form (in-app, no outbound email) |
| dashboard | `/dashboard` | Stats for admin overview |
| settings | `/settings` | AppSettings CRUD |
| chatbot | `/chatbot/message` | Groq-powered public chatbot |
| clinic-info | `/clinic-info/*` | Read-only public clinic data for chatbot |
| search | `/search` | Cross-entity search |
| sms | internal | SMS + WhatsApp via OpenWA |
| mail | internal | SMTP email templates |
| unavailability | `/unavailability` | Practitioner unavailability blocks |
| cron | internal | Every 30 min: expire pending, send reminders |

---

## Notification System

Single source of truth: `api/src/appointment/appointment-notification.service.ts`

**8 triggers:**

| Trigger | Who gets it |
|---------|-------------|
| New booking (PENDING) | Patient — acknowledgment email |
| CONFIRMED | Patient — confirmation email + WhatsApp |
| CANCELLED (by staff) | Patient — cancellation email + WhatsApp; Doctor — rejection notice |
| 24h reminder | Patient — email + WhatsApp |
| 1h reminder | Patient — email + WhatsApp |

**Channels:** Email (SMTP real delivery, `smtp.widamineaestheticcenter.com`) + WhatsApp (OpenWA).  
**Per-channel toggles** in AppSettings (`emailEnabled`, `whatsappEnabled`, per-type flags).  
**Template style:** brand `#009FD6` primary, `#FBF7EF` bg, `#F7A269` accent, white card, serif headings — matches landing theme. No emoji badges, no note boxes. Footer = site link only.  
**Test mailbox:** holy@beeinbox.com.

---

## Chatbot

Floating widget on every landing page. Powered by Groq API.

- **Endpoint:** `POST /chatbot/message` (public, no auth)
- **Model:** `openai/gpt-oss-20b` (via Groq, `GROQ_API_URL = https://api.groq.com/openai/v1/chat/completions`)
- **Lead capture:** Always asks for name + email; stores via `ChatLead` model
- **Behaviour:** Answers FAQs first, then naturally asks for credentials — not a hard gate
- **Tools:** `store_lead`, `get_clinic_stats`, `get_services_info`, `get_practitioners_info`, `get_business_hours`, `trigger_popup`
- **Live data:** Chatbot tools call `ClinicInfoService` → real DB queries (appointments stats, services, staff availability)
- **Env:** `GROQ_API_KEY` in `api/.env`

---

## Landing — Key Components

| Component | File | Notes |
|-----------|------|-------|
| PublicNavbar | `components/PublicNavbar.tsx` | Mega-menu, mobile drawer, scroll-hide |
| PublicFooter | `components/PublicFooter.tsx` | Social icons (duotone, `#009FD6`), service links (`rgb(26,54,70)`) |
| BookingFlow | `components/BookingFlow.tsx` | Full booking modal — type select → calendar → form |
| Chatbot | `components/Chatbot.tsx` | Floating chatbot bubble |
| BmiPopup | `components/BmiPopup.tsx` | BMI calculator popup (triggered from chatbot) |
| ContactPopup | `components/ContactPopup.tsx` | Contact form popup |

**Home.tsx sections:** HeroSection → IntroSection → ConceptSection → TreatmentsSection (Dr. Widad, image left) → TeamSection → GallerySection → TestimonialsSection → ConsultSection (map left)

**Vite proxy (landing):** `/api/*` → `http://127.0.0.1:3001` (note: port **3001** in dev, not 3000 — see vite.config.ts)

---

## Admin — Key Pages

| Route | Page | Roles |
|-------|------|-------|
| `/calendar` | Weekly calendar | ADMIN, RECEPTIONIST, DOCTOR |
| `/appointments` | Booking queue | ADMIN, RECEPTIONIST, DOCTOR |
| `/patients` | Patient records | ADMIN, RECEPTIONIST |
| `/users` | Staff management | ADMIN |
| `/motifs` | Motif definitions | ADMIN |
| `/resources` | Room management | ADMIN |
| `/contacts` | Contact submissions | ADMIN, RECEPTIONIST |
| `/settings` | Notification settings | ADMIN |
| `/unavailabilities` | Practitioner blocks | ADMIN |

**Vite proxy (admin):** `/api/*` → `http://127.0.0.1:3000`

---

## Deployment (Coolify)

- **Host:** `https://server.wa-pharma.com`
- **Project:** widamine (`jgeq2wv4ylwv41xw1om3o69p`)
- **App:** widamine:api (`tyfa0ow9za5ohqn69dh9zhh4`, dockercompose, branch `latest`)
- **Deploy:** `GET /api/v1/deploy?uuid=tyfa0ow9za5ohqn69dh9zhh4&force=true` with Bearer token
- **Verify:** `/api/v1/resources?project_uuid=...` — check `_api:XXXXXXX` image tag (short SHA)

**Important:** Coolify Bearer token expires — ask user for a fresh one before deploying.

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Motif-first domain | No Service/Category model | Simplicity — Motif is the atom |
| Room assignment | Auto on confirm (lowest priority free) | Admin can override |
| Session tracking | Sequential — cannot skip sessions | Medical protocol integrity |
| Booking verification | Manual confirm + auto-expire (cron) | Prevents ghost bookings |
| Notifications | SMTP (real) + WhatsApp (OpenWA) | No Brevo — direct SMTP |
| Patient dedup | By phone (`findOrCreateByPhone`) | Avoids duplicate records |
| Auth | JWT cookies, role guards | Standard NestJS pattern |
| Contact form | In-app only, no outbound email | Intentional — per design |
| Proxy env vars | `HTTP_PROXY`/`HTTPS_PROXY` point to Tor in shell profile | Must `unset` before starting API locally |
