# Widamine Architecture

> Brainstorm and design document — the full picture of the system.

---

## The Product

A **medical practice automation platform**. One landing page for patients, one dashboard for staff (admins, practitioners, receptionists). The goal is to configure once, then automate everything possible — booking, scheduling, assignment, notifications, progress tracking.

---

## The Core Domain

### Motif — The Building Block

Everything revolves around **Motif** (the reason for visit). A Motif is a self-contained "care product" — a rulebook for a type of visit.

```
Motif
├── Identity: name, slug, description, color, isActive
├── Duration: how long one session takes (e.g., 30 min)
├── Sessions: numberOfSessions this treatment needs
│     (1 = one-off visit, 3 = treatment plan)
├── Practitioners: who can do it (MotifPractitioner)
├── Rooms: where it can happen (MotifResource with priority)
├── Booking rules:
│   ├── requiresPractitionerChoice
│   ├── pendingTtlHours (auto-expire pending bookings)
│   └── isOnlineBookable (visible on landing or staff-only)
```

No Service, no Category, no bookingType/famille. Just Motif.

### Appointments & Session Tracking

```
Appointment (one visit)
├── Patient (name, phone, email, gender, nationality)
├── Motif
├── Practitioner (chosen by patient on landing)
├── Room (auto-assigned on confirm, admin can override)
├── Session number (auto-calculated, validated)
├── Datetime (picked by patient on landing calendar)
└── Status: PENDING → CONFIRMED → COMPLETED
                        ↓
                   CANCELLED / EXPIRED
```

**Session progress explained:**
- A Motif with `numberOfSessions: 3` means the patient needs 3 visits
- Each visit is a separate Appointment with `sessionNumber: 1`, `2`, or `3`
- Session number auto-calculates as: last completed session + 1 for this patient + motif
- Cannot skip: session 2 requires session 1 to be COMPLETED first
- If admin tries to set session 2 without session 1 → error with link to create session 1

---

## Flows

### Patient on Landing Page

```
1. Selects Motif (from online-bookable list)
2. Selects Practitioner (filtered by motif's allowed practitioners)
3. Calendar shows open time slots based on:
   - Practitioner's availability + existing bookings
   - At least one free room from motif's allowed rooms
   - Motif duration (slots sliced accordingly)
4. Picks time → fills name, gender, nationality, phone, email
5. Status: PENDING (slot tentatively held, auto-expires after TTL)
```

### Admin Dashboard — Verification Queue

```
Sees all PENDING bookings:
┌─────────┬──────────┬───────┬──────┬──────────┬──────────┐
│ Patient │ Motif    │ Session│ Time │ Status   │ Action   │
├─────────┼──────────┼───────┼──────┼──────────┼──────────┤
│ Ahmed   │ Détartrage │ 1/3  │ Mon 10:00 │ PENDING  │ ✅ / ❌ │
│ Sara    │ Consult. │ 1/1   │ Mon 11:30 │ PENDING  │ ✅ / ❌ │
└─────────┴──────────┴───────┴──────┴──────────┴──────────┘
```

### Admin Confirms a Booking

```
Click ✅ on a PENDING booking → Confirmation modal:

┌─────────────────────────────────────┐
│ Patient: Ahmed                      │
│ Motif: Détartrage (3 sessions)      │
│ Practitioner: Dr. Salim (can change)│
│ Session: 1/3 (auto, can change)     │
│ Room: Salle 2 (auto-assigned)       │
│ Date & Time: Mon 10 Jan 2026 10:00  │
│   [Calendar picker with available    │
│    slots highlighted]                │
│                                     │
│ [Reschedule] [Confirm] [Cancel]     │
└─────────────────────────────────────┘

- Room auto-assigns: lowest priority free room at chosen time
- Admin can override room, practitioner, session number
- Session validation: can't skip (2 without 1 → error + link)
- On Confirm: Appointment status → CONFIRMED, Schedule created
- On Expire without action: status → EXPIRED, slot freed
```

### Admin/Receptionist Adds New Session for Patient

Used when a patient completes a session and needs the next one.

```
Trigger points:
- From appointment detail: "+ Next Session" button on COMPLETED session
- From patient profile: progress bar per motif with "+" button
- Walk-in reception: quick booking form

Modal (pre-filled, editable):
┌─────────────────────────────────────┐
│ Patient: Ahmed (auto)               │
│ Motif: Détartrage (auto)            │
│ Practitioner: Dr. Salim (auto)      │
│ Session: 2/3 (auto = last + 1)      │
│ Room: [auto-assign on save]         │
│ Date & Time: [calendar picker]      │
│   ↑ Only available slots shown      │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘

- Same session validation applies
- On Save: creates Appointment as CONFIRMED immediately
- Notifications sent to patient
```

---

## Auto-Assignment Rules

### Room Assignment
- On confirm, system picks the room with **lowest priority** (`Resource.priority`) that is:
  - In the motif's allowed rooms list (`MotifResource`)
  - Free at the chosen datetime (no conflicting appointments)
  - Active
- Admin can override in modal

### Practitioner Assignment
- Patient picks on landing (for online bookings)
- Staff picks manually (for staff-initiated bookings)
- Motif has preferred/default practitioners

### Session Number Auto-Calculation
- Query: last `COMPLETED` appointment for this patient + motif
- Session = that number + 1
- If no previous completed → session 1
- If session > `numberOfSessions` → warn that treatment plan is complete

---

## Notifications System

### Trigger Events

| Event | Channel | When | Content |
|---|---|---|---|
| Booking submitted | Email + WhatsApp | On PENDING creation | Confirmation of request, "we'll call you" |
| Booking confirmed | Email + WhatsApp | On CONFIRMED | Slot details, practitioner, room, date/time |
| Booking cancelled | Email + WhatsApp | On CANCELLED | "Your appointment has been cancelled" |
| Booking expired | Email + WhatsApp | On EXPIRED | "Your booking request expired" |
| Reminder | Email + WhatsApp | 24h before session | "Your appointment is tomorrow at 10:00" |
| New session added | Email + WhatsApp | On new CONFIRMED session | "A new session has been scheduled" |
| Rescheduled | Email + WhatsApp | On datetime change | "Your appointment has been rescheduled to..." |
| Session completed | Email + WhatsApp | On COMPLETED | "Session X/Y completed. Next session: ..." |

### Scheduling Logic
- A cron job runs every hour / every 30 min
- Queries appointments with datetime in 24h window + status CONFIRMED
- Checks if reminder was already sent (via `NotificationLog`)
- Sends pending reminders
- Same for expiry: marks PENDING appointments past `expiresAt` as EXPIRED

---

## Domain Model (Target Schema)

```
Patient
  id, firstName, lastName, email, phone
  gender, nationality, dateOfBirth
  address, city, medicalHistory

Motif
  id, name, slug, description, color
  duration (minutes)
  numberOfSessions
  isActive, isOnlineBookable
  requiresPractitionerChoice
  pendingTtlHours (default 24)
  practitionerAssignments → MotifPractitioner[]
  resourceAssignments → MotifResource[]

Session
  id, number, duration
  motifId → Motif
  schedules → Schedule[]

Appointment
  id, status (PENDING | CONFIRMED | CANCELLED | EXPIRED | COMPLETED)
  sessionNumber
  datetime, timezone
  expiresAt, confirmedAt, cancelledAt, completedAt
  patientId → Patient
  motifId → Motif
  practitionerId → User
  resourceId → Resource
  schedules → Schedule[]
  notifications → NotificationLog[]

Schedule
  id, datetime
  appointmentId → Appointment
  sessionId → Session

Resource (Salle)
  id, name, slug, type, description
  priority, isActive
  motifAssignments → MotifResource[]

User (Practitioner / Admin / Receptionist)
  id, name, email, role
  availabilityBlocks → AvailabilityBlock[]
  motifAssignments → MotifPractitioner[]
  assignedAppointments → Appointment[]
```

---

## Removed Concepts

| Removed | Reason |
|---|---|
| **Service** | Merged into Motif — Motif is now the self-contained rulebook |
| **Category** | No hierarchical grouping needed |
| **bookingType / famille** | Unnecessary classification — Motif IS the type |

---

## Key Design Decisions

| Decision | Choice |
|---|---|
| Time picking | Patient picks time on landing calendar |
| Room assignment | Auto on confirm (lowest priority free), admin overrides |
| Session tracking | Sequential — cannot skip, validation with auto-fix link |
| Booking verification | Manual phone call — slot tentatively held, auto-expires |
| Notifications | Email + WhatsApp, automated per event |
| Notif. scheduling | Cron-based (every 30 min), deduped via NotificationLog |
| Practitioner selection | Patient picks on landing, staff picks manually |
| Landing form fields | Motif, Practitioner, Time, Name, Gender, Nationality, Phone, Email |
