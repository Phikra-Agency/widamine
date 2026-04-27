# Widamine Project - Comprehensive Diagnosis Report

**Generated:** April 27, 2026  
**Project Path:** `/home/alan/widamine`  
**Status:** ⚠️ Services Down - Requires MongoDB Restart

---

## 🔴 CRITICAL ISSUES

### 1. MongoDB Connection Failure
**Status:** ❌ **DOWN** - Blocking all backend operations

**Error Pattern:**
```
PrismaClientKnownRequestError: 
Raw query failed. Code: `unknown`. 
Message: `Kind: Server selection timeout: No available servers. 
Topology: { Type: Unknown, Servers: [ 
  { Address: 127.0.0.1:27017, Type: Unknown, 
    Error: Kind: I/O error: Connection refused (os error 111) } 
] }`
```

**Affected Endpoints:**
- `GET /services` → `service.service.ts:14:39`
- `GET /appointments` → `appointment.service.ts:53:36`
- `POST /auth/login` → `auth.service.ts:20:48`

**Root Cause:**
MongoDB daemon is not running or not accepting connections on port 27017.

**Impact:**
- ❌ All API endpoints return 500 errors
- ❌ Frontend cannot fetch data
- ❌ Authentication fails
- ❌ Dashboard shows empty state

**Fix:**
```bash
# Restart MongoDB with replica set
cd /home/alan/widamine
./start-mongodb.sh

# Or manually:
pkill -f mongod
mongod --replSet rs0 --dbpath /home/alan/widamine/mongodb_data --port 27017 --fork --logpath /tmp/mongodb.log
sleep 5
mongosh --eval "rs.initiate()"
```

---

## 🟢 BACKEND ARCHITECTURE (NestJS)

### Technology Stack
- **Framework:** NestJS 10.3.0
- **Database:** MongoDB 7.x with Prisma ORM 5.22.0
- **Authentication:** JWT with bcrypt (cost: 10)
- **HTTP:** Express platform
- **Validation:** class-validator + class-transformer
- **Documentation:** PROJECT_OVERVIEW.md, MONGODB_SETUP.md

### Module Inventory (10 Complete CRUD Modules)

| Module | Service | Controller | DTO | Entity | Relations | Status |
|--------|---------|------------|-----|--------|-----------|--------|
| **auth** | 3 methods | 2 endpoints | ✅ LoginDto | User | JWT/cookies | ✅ |
| **user** | 5 methods | 5 endpoints | ✅ | User | Appointments, Services | ✅ |
| **patient** | 6 methods | 5 endpoints | ✅ | Patient | Appointments | ✅ |
| **appointment** | 6 methods | 5 endpoints | ✅ | Appointment | Patient, Service, Motif, Schedule, Resource, Practitioner | ✅ |
| **schedule** | 6 methods | 5 endpoints | ✅ | Schedule | Appointment, Session | ✅ |
| **category** | 5 methods | 5 endpoints | ✅ | Category | Services | ✅ |
| **service** | 5 methods | 5 endpoints | ✅ | Service | Category, Sessions, Appointments, Motifs, Doctor | ✅ |
| **session** | 5 methods | 5 endpoints | ✅ | Session | Service, Schedules | ✅ |
| **motif** | 5 methods | 5 endpoints | ✅ | Motif | Service, Appointments | ✅ |
| **resource** | 5 methods | 5 endpoints | ✅ | Resource | Appointments | ✅ |
| **contact** | 5 methods | 4 endpoints | ✅ | Contact | - | ✅ |

**Total:** 51 Service methods, 48 Controller endpoints

### Database Schema (Prisma)

**15 Models Defined:**

```prisma
Core Entities:
├── User (id, name, email, password, role, admin)
├── Category (id, name, slug)
├── Service (id, name, slug, price, categoryId, primaryDoctorId, allowedDoctorIds[], allowedSalleIds[])
├── Session (id, serviceId, duration, maxPatients)
├── Patient (id, firstName, lastName, email, phone, dateOfBirth, gender, address, city)
├── Appointment (id, patientId, serviceId, motifId, practitionerId, resourceId, status, context, timezone, expiresAt, confirmedAt, completedAt, cancelledAt)
├── Schedule (id, datetime, sessionId, appointmentId)
├── Motif (id, name, serviceId)
├── Resource (id, name, type)
├── Contact (id, name, email, phone, message, status)
├── NotificationLog (id, type, status, recipient, message, appointmentId)
├── AvailabilityBlock (id, practitionerId, startTime, endTime, reason)

Join Tables:
├── MotifPractitioner (motifId, practitionerId)
├── ResourcePractitioner (resourceId, practitionerId)
└── MotifResource (motifId, resourceId)
```

**Key Design Decisions:**
- MongoDB with ObjectId as String (`@db.ObjectId`)
- Soft deletes via status fields
- Timezone support (Africa/Casablanca default)
- Array fields for allowed doctors/salles on Service

### Seeded Data (90+ Records)

| Entity | Count | Details |
|--------|-------|---------|
| Users | 5 | 1 Admin, 3 Doctors, 2 Receptionists |
| Categories | 6 | Esthétique Visage/Corps, Chirurgie, Dermatologie, Laser, Médecine Esthétique |
| Services | 10 | Botox, Acide Hyaluronique, Liposuccion, Augmentation Mammaire, etc. |
| Sessions | ~20 | 30-60min durations per service |
| Motifs | 8 | Consultation, Suivi, Traitement, Urgence, etc. |
| Resources | 7 | Salles: Consultation, Traitement, Laser, Bloc opératoire |
| Patients | 50 | Moroccan names, realistic phone numbers |
| **Appointments** | **90** | **10 scheduled for today (Apr 27, 2026)** |
| Contacts | 15 | Form submissions |
| Availability Blocks | 10 | Doctor unavailability periods |

**Test Credentials:**
- Admin: `admin@widamine.com` / `admin123`
- Doctor: `dr.slaoui@widamine.com` / `doctor123`
- Reception: `reception@widamine.com` / `reception123`

### API Endpoints

**Base URL:** `http://localhost:3000`

| Endpoint | Method | Auth | Description |
|----------|--------|------|---------------|
| `/auth/login` | POST | No | Login + JWT cookie |
| `/auth/logout` | POST | Yes | Logout |
| `/auth/refresh` | GET | Yes | Refresh token |
| `/users` | CRUD | Yes | User management |
| `/patients` | CRUD | Yes | Patient CRUD + findOrCreateByPhone |
| `/appointments` | CRUD | Yes | Appointment management |
| `/appointments/availability` | GET | Yes | Get available slots |
| `/schedules` | CRUD | Yes | Schedule management |
| `/schedules/week/:date` | GET | Yes | Get week view |
| `/services` | CRUD | Yes | Service management |
| `/categories` | CRUD | Yes | Category management |
| `/sessions` | CRUD | Yes | Session management |
| `/motifs` | CRUD | Yes | Motif management |
| `/resources` | CRUD | Yes | Resource (salles) management |
| `/contacts` | CRUD | Yes | Contact form management |

---

## 🟢 FRONTEND ARCHITECTURE (React + Vite)

### Technology Stack
- **Framework:** React 18.2.0 + Vite 8.0.3
- **Language:** TypeScript 5.7.3
- **Styling:** Tailwind CSS 3.4.1 + custom design tokens
- **UI Components:** Mantine (dates), Headless UI
- **Animation:** Framer Motion, GSAP + @gsap/react
- **Icons:** @phosphor-icons/react
- **State:** Zustand (authStore, appointmentsStore)
- **HTTP:** Native fetch with interceptors
- **Routing:** react-router-dom 7.1.1

### Page Inventory (15 Pages)

#### Public Pages (4)
| Page | File | Features | Status |
|------|------|----------|--------|
| **Home** | `Home.tsx` | Hero, Services carousel, Before/After slider, Experts, Testimonials, Trust badges, News, Contact banner | ✅ |
| **Contact** | `Contact.tsx` | Contact form with validation | ✅ |
| **Appointment** | `Appointment.tsx` | Booking flow with service selection, availability check | ✅ |
| **Service Detail** | `ServiceDetail.tsx` | Service info display | ✅ |

#### Auth Pages (1)
| Page | File | Features | Status |
|------|------|----------|--------|
| **Login** | `auth/Login.tsx` | JWT login form, error handling | ✅ |

#### Back Office Pages (11)
| Page | File | Theme | Access Control | Features |
|------|------|-------|---------------|----------|
| **Dashboard** | `Dashboard.tsx` | Light | Public + Auth | Stats, today's appointments, quick actions |
| **Dashboard Dark** | `DashboardDark.tsx` | Dark | Public | Same as above, original dark design |
| **Appointments** | `Appointments.tsx` | Light | Auth | Full CRUD, filtering, pagination |
| **Calendar** | `Calendar.tsx` | Light | Auth | Week/month view, drag-drop |
| **Patients** | `Patients.tsx` | Light | Auth | Patient CRUD, search |
| **Users** | `Users.tsx` | Light | Auth | User management (ADMIN only) |
| **Services** | `Services.tsx` | Light | Auth | Service CRUD with sessions |
| **Categories** | `Categories.tsx` | Light | Auth | Category management |
| **Motifs** | `Motifs.tsx` | Light | Auth | Appointment motifs |
| **Resources** | `Resources.tsx` | Light | Auth | Room/salle management |
| **Contacts** | `Contacts.tsx` | Light | Auth | Contact form submissions |

### Layout System (3 Layouts)

| Layout | File | Theme | Use Case |
|--------|------|-------|----------|
| **Layout** | `Layout.tsx` | Light | Public pages (Home, Contact, etc) |
| **BackOfficeLayout** | `BackOfficeLayout.tsx` | Light (white) | `/admin`, `/back-office/*` |
| **BackOfficeLayoutDark** | `BackOfficeLayoutDark.tsx` | Dark (gradient) | `/admin1` |

### Theme System

**Design Tokens (CSS Variables):**
```css
--color-custom-white: #f9fafc    /* Primary background */
--color-primary: #2e90c0         /* Sky blue accent */
--color-secondary: #1a3646       /* Navy text */
--color-accent: #e8c5b8          /* Rose accent */
```

**Dashboard Variants:**

1. **Light Dashboard** (`/admin`, `/back-office/dashboard`)
   - Background: `bg-custom-white` (#f9fafc)
   - Cards: `bg-white` with `border-secondary/10`
   - Text: `text-secondary` (#1a3646)
   - Accents: `text-primary` (#2e90c0), `text-emerald-500`, `text-amber-500`

2. **Dark Dashboard** (`/admin1`)
   - Background: `bg-[#0a1628]` with gradient overlay
   - Cards: Glass effect `bg-white/6` with `border-white/10`
   - Text: `text-slate-100`, `text-white/72`
   - Accents: `text-[#8bd8ff]`, `bg-[#2e90c0]/20`

### Routing Structure

```
/                           → Home (public)
/contact                    → Contact (public)
/appointment                → Appointment booking (public)
/services/:slug             → Service detail (public)
/login                      → Login (unauth only)

/admin                      → Light Dashboard (auth wrapper)
  /users                    → Users (ADMIN only)
  /patients                 → Patients
  /categories               → Categories (ADMIN)
  /services                 → Services (ADMIN)
  /motifs                   → Motifs (ADMIN)
  /resources                → Resources (ADMIN)

/back-office                → Light Layout (auth required)
  /dashboard                → Light Dashboard
  /appointments             → Appointments (ADMIN/RECEPTIONIST/DOCTOR)
  /calendar                 → Calendar (ADMIN/RECEPTIONIST/DOCTOR)
  /patients                 → Patients (all roles)
  /contacts                 → Contacts (ADMIN/RECEPTIONIST)
  /users                    → Users (ADMIN)
  ...

/admin1                     → Dark Dashboard (public, dark layout)
```

### State Management (Zustand)

**authStore:**
- user: User | null
- isAuthenticated: boolean
- login(email, password): Promise<void>
- logout(): Promise<void>
- refreshToken(): Promise<void>

**appointmentsStore:**
- items: Appointment[]
- fetchItems(): Promise<void>
- create(data): Promise<void>
- update(id, data): Promise<void>
- remove(id): Promise<void>

---

## 🟡 PARTIALLY IMPLEMENTED / STUBS

### SMS Service
**File:** `backend/src/sms/sms.service.ts`
**Status:** ⚠️ Stub - Empty implementation
**Code:**
```typescript
@Injectable()
export class SmsService {
  // TODO: Implement SMS sending
}
```

**Impact:** Appointment notifications not sent via SMS

### Mail Service
**File:** `backend/src/mail/mail.service.ts`
**Status:** ⚠️ Basic stub
**Impact:** No email notifications

### Flaticon Integration
**Status:** ⚠️ Not loaded
**Impact:** Service icons fallback to Phosphor icons instead of custom flaticon font
**Fix needed:** Copy flaticon.css + fonts to `public/widamine-source/fonts/`

---

## 📊 DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Home.tsx   │  │  Dashboard   │  │  BackOffice  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐   │
│  │  Zustand    │  │   Zustand    │  │    Zustand    │   │
│  │ authStore   │  │appointments  │  │    Stores     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
└───────────────────────────┼─────────────────────────────┘
                           │ HTTP + Cookies
┌───────────────────────────┼─────────────────────────────┐
│                      BACKEND                           │
│  ┌───────────────────────▼────────────────────────┐    │
│  │              NestJS Controllers                 │    │
│  │  Auth, Appointment, Patient, Service, etc.     │    │
│  └───────────────────────┬────────────────────────┘    │
│                          │                             │
│  ┌───────────────────────▼────────────────────────┐    │
│  │              Prisma ORM (MongoDB)              │    │
│  └───────────────────────┬────────────────────────┘    │
│                          │                             │
│  ┌───────────────────────▼────────────────────────┐    │
│  │              MongoDB 7.x (rs0)                 │    │
│  │           Port 27017, Replica Set              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 DEVELOPMENT COMMANDS

### Start Full Stack

```bash
# Terminal 1: MongoDB
cd /home/alan/widamine
./start-mongodb.sh
# OR manually:
mongod --replSet rs0 --dbpath ./mongodb_data --port 27017 --fork
sleep 5 && mongosh --eval "rs.initiate()"

# Terminal 2: Backend
cd /home/alan/widamine/backend
npm run start:dev
# API available at http://localhost:3000

# Terminal 3: Frontend
cd /home/alan/widamine/frontend
npm run dev
# App available at http://localhost:5173
```

### Useful Commands

```bash
# Check MongoDB status
mongosh --eval "rs.status()"

# Reset database
# Delete mongodb_data folder, restart MongoDB, re-seed:
cd /home/alan/widamine/backend
npm run seed

# View backend logs
tail -f /tmp/backend.log

# View MongoDB logs
tail -f /tmp/mongodb.log
```

---

## 📁 FILE STRUCTURE

```
/home/alan/widamine/
├── backend/                          (89 items)
│   ├── src/
│   │   ├── appointment/              (8 items)
│   │   │   ├── appointment.controller.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── dto/
│   │   ├── auth/                     (6 items)
│   │   ├── category/                 (5 items)
│   │   ├── contact/                  (4 items)
│   │   ├── mail/                     (2 items) - ⚠️ stub
│   │   ├── motif/                    (4 items)
│   │   ├── patient/                  (5 items)
│   │   ├── prisma/                   (2 items)
│   │   ├── resource/                 (4 items)
│   │   ├── schedule/                 (5 items)
│   │   ├── service/                  (5 items)
│   │   ├── session/                  (5 items)
│   │   ├── sms/                      (2 items) - ⚠️ stub
│   │   └── user/                     (5 items)
│   ├── prisma/
│   │   ├── schema.prisma             (256 lines, 15 models)
│   │   └── seed.ts                   (639 lines, comprehensive seed)
│   └── test/                         (e2e tests)
├── frontend/                         (67 items)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── BackOfficeLayout.tsx       (Light)
│   │   │   │   ├── BackOfficeLayoutDark.tsx   (Dark)
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── index.ts
│   │   │   ├── wrappers/
│   │   │   │   ├── AuthWrapper.tsx
│   │   │   │   ├── RefreshWrapper.tsx
│   │   │   │   ├── UnauthWrapper.tsx
│   │   │   │   └── RoleWrapper.tsx
│   │   │   └── Preloader.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Appointment.tsx
│   │   │   ├── ServiceDetail.tsx
│   │   │   ├── auth/
│   │   │   │   └── Login.tsx
│   │   │   └── back-office/        (11 pages)
│   │   │       ├── Dashboard.tsx           (Light)
│   │   │       ├── DashboardDark.tsx       (Dark)
│   │   │       ├── Appointments.tsx
│   │   │       ├── Calendar.tsx
│   │   │       ├── Patients.tsx
│   │   │       ├── Users.tsx
│   │   │       ├── Services.tsx
│   │   │       ├── Categories.tsx
│   │   │       ├── Motifs.tsx
│   │   │       ├── Resources.tsx
│   │   │       └── Contacts.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   └── appointmentsStore.ts
│   │   ├── lib/
│   │   │   └── widamineSource.ts   (Assets mapping)
│   │   ├── App.tsx                 (Main router)
│   │   └── index.css               (Tailwind + custom tokens)
│   └── public/
│       └── widamine-source/        (Images, assets)
├── docs/                           (Documentation)
├── mongodb_data/                   (MongoDB data files)
├── PROJECT_DIAGNOSIS.md           (This file)
├── PROJECT_OVERVIEW.md            (Frontend overview)
├── MONGODB_SETUP.md               (MongoDB setup guide)
└── start-mongodb.sh               (MongoDB start script)
```

---

## 🎯 QUICK ACCESS URLs (When Running)

| URL | Description | Auth Required |
|-----|-------------|---------------|
| http://localhost:5173/ | Landing page | No |
| http://localhost:5173/admin | Light Dashboard | No (preview mode) |
| http://localhost:5173/admin1 | Dark Dashboard | No (preview mode) |
| http://localhost:5173/back-office/dashboard | Full Dashboard | Yes |
| http://localhost:5173/login | Login page | No |
| http://localhost:3000/appointments | API Endpoint | Yes (JWT) |

---

## ✅ VERIFICATION CHECKLIST

- [ ] MongoDB running on port 27017
- [ ] MongoDB replica set initialized (`rs0`)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] API responds: `curl http://localhost:3000/appointments`
- [ ] Database seeded: 90 appointments, 5 users, 50 patients
- [ ] Login works: `admin@widamine.com` / `admin123`
- [ ] Light dashboard shows data: `/admin`
- [ ] Dark dashboard shows data: `/admin1`

---

## 🚨 IMMEDIATE ACTION REQUIRED

**Priority 1: Start MongoDB**
```bash
cd /home/alan/widamine
./start-mongodb.sh
```

**Priority 2: Verify Backend Connection**
```bash
curl http://localhost:3000/appointments | jq '. | length'
# Should return: 90
```

**Priority 3: Verify Frontend**
- Open http://localhost:5173/admin
- Confirm appointments display

---

*End of Diagnosis Report*
