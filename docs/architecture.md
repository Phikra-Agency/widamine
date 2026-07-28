# Widamine Architecture

> System architecture — models, flows, services.

---

## Overview

A medical practice automation platform. One landing page for patients, one admin dashboard for staff, one API powering both.

| App | Tech | Port |
|-----|------|------|
| Landing | Vite + React | 5173 |
| Admin | Vite + React + shadcn/ui | 5174 |
| API | NestJS + Prisma + MongoDB | 3000 |

---

## Core Domain

### Motif — The Building Block

A Motif is a self-contained "care product" — the reason for visit.

```
Motif
├── Identity: name, slug, description, color, isActive
├── Duration: session length (e.g., 30 min)
├── Sessions: numberOfSessions (1 = one-off, 3 = treatment plan)
├── Practitioners: who can do it (MotifPractitioner)
├── Rooms: where it can happen (MotifResource)
└── Booking rules: requiresPractitionerChoice, pendingTtlHours
```

No Service, Category, or bookingType — just Motif.

### Appointments

```
Appointment
├── Patient (name, phone, email, linked via Patient model)
├── Motif
├── Practitioner
├── Room (auto-assigned on confirm)
├── Session number (auto-calculated from last completed)
├── Datetime (picked by patient on landing calendar)
└── Status: PENDING → CONFIRMED → COMPLETED → CANCELLED / EXPIRED
```

### Patient Flow

```
Landing → Select motif → Pick practitioner → Pick time → Fill info → PENDING
Admin reviews → CONFIRMED (room auto-assigned, notification sent)
Patient visits → COMPLETED → Next session available
```

---

## Models

```
User           Staff accounts (ADMIN, DOCTOR, RECEPTIONIST, PRACTITIONER)
Patient        Patient records (deduplicated by phone)
Motif          Treatment/service definition
Session        Session number + duration per motif
Appointment    A booked visit (links patient, motif, practitioner, room)
Schedule       Datetime slot for an appointment session
Resource       Room/equipment
Contact        Contact form submissions
ChatLead       Chatbot visitor info (name + email)
NotificationLog Notification delivery log
AppSettings    System-wide settings
```

---

## Chatbot

The landing page includes a chatbot powered by Groq API (`llama-3.3-70b-versatile`).

- **Endpoint**: `POST /chatbot/message`
- **Auth**: None (public)
- **Tools**: `store_lead`, `get_services`, `get_service_details`, `get_team`, `get_business_info`, `trigger_popup`
- **Lead capture**: Before any response, the bot asks for name + email and stores via `ChatLead` model
- **Env**: `GROQ_API_KEY` in `api/.env`

---

## Key Design Decisions

| Decision | Choice |
|---|---|
| Motif-first domain | No Service/Category — Motif is the atom |
| Room assignment | Auto on confirm (lowest priority free), admin overrides |
| Session tracking | Sequential — cannot skip |
| Booking verification | Manual — slot held tentatively, auto-expires |
| Notifications | Brevo email (optional), cron-based every 30 min |
| Patient dedup | By phone number (`findOrCreateByPhone`) |
| Auth | JWT with role-based guards (ADMIN/DOCTOR/RECEPTIONIST) |
