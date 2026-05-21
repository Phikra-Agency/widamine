# Widamine — Documentation

Medical/aesthetic clinic management system with public booking site and admin back-office.

## Documentation Index

| File | Description |
|------|-------------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Overall system architecture, tech stack, design decisions |
| **[FRONTEND.md](FRONTEND.md)** | Frontend pages, components, stores, routing, theming |
| **[BACKEND.md](BACKEND.md)** | Backend modules, controllers, services, API endpoints |
| **[DATABASE.md](DATABASE.md)** | Prisma schema, all models, fields, relationships |
| **[AUTH.md](AUTH.md)** | Authentication flow, JWT, role-based access control |
| **[API.md](API.md)** | Complete API reference with endpoints, params, responses |
| **[BOOKING.md](BOOKING.md)** | Booking flow: components, store, availability algorithm |
| **[SETUP.md](SETUP.md)** | Local development setup, environment variables, troubleshooting |
| **[COMPONENTS.md](COMPONENTS.md)** | Frontend component reference (legacy) |
| **[SCHEMA.md](SCHEMA.md)** | Database schema documentation (legacy, SQLite-based) |
| **[RBAC_DESIGN.md](RBAC_DESIGN.md)** | RBAC design document with proposed changes |

## Quick Links

- **Frontend**: `cd frontend && npm run dev` → http://localhost:5173
- **Backend**: `cd backend && npm run start:dev` → http://localhost:3000
- **MongoDB**: Requires replica set (`mongod --replSet rs0`)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Framer Motion 12, Zustand 5 |
| Backend | NestJS, Prisma ORM, JWT |
| Database | MongoDB |
| Email | Brevo API |
| Icons | Phosphor Icons |
| UI Library | Mantine v9 |

## Project Structure

```
widamine/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── layouts/  # Layout shells
│   │   │   └── wrappers/ # Route guards
│   │   ├── pages/        # Page components
│   │   │   ├── back-office/  # Admin pages (11 pages)
│   │   │   └── auth/     # Login
│   │   ├── stores/       # Zustand stores (11 stores)
│   │   ├── lib/          # API client, utilities, content
│   │   └── App.tsx       # Router
│   └── package.json
│
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # Authentication
│   │   ├── user/      # User management
│   │   ├── patient/   # Patient records
│   │   ├── appointment/  # Bookings + availability
│   │   ├── schedule/  # Weekly schedules
│   │   ├── service/   # Services CRUD
│   │   ├── category/  # Categories
│   │   ├── motif/     # Consultation types
│   │   ├── resource/  # Rooms/salles
│   │   ├── session/   # Time slots
│   │   ├── contact/   # Contact forms
│   │   ├── dashboard/ # Stats
│   │   ├── settings/  # Notification settings
│   │   ├── mail/      # Email (Brevo)
│   │   ├── sms/       # SMS (stub)
│   │   └── prisma/    # DB client
│   ├── prisma/
│   │   └── schema.prisma  # 15 models
│   └── package.json
│
└── docs/              # Documentation (you are here)
    ├── ARCHITECTURE.md
    ├── FRONTEND.md
    ├── BACKEND.md
    ├── DATABASE.md
    ├── AUTH.md
    ├── API.md
    ├── BOOKING.md
    ├── SETUP.md
    ├── COMPONENTS.md
    ├── SCHEMA.md
    └── RBAC_DESIGN.md
```

## Features

### Public Site
- Landing page with hero, services, testimonials, gallery
- Multi-step booking flow with real-time availability
- Service detail pages
- Contact form
- Responsive design

### Back-Office
- Dashboard with stats and overview
- Weekly calendar view
- Appointment management (CRUD, status updates)
- Patient records with history
- User management with role-based access
- Service, category, motif, resource CRUD
- Contact form submissions
- Notification settings
- Practitioner status bar

### Booking System
- Multiple doctors per service
- Multiple rooms per service
- Real-time availability checking
- Double-booking prevention (doctor + room)
- Auto-generated time slots
- Confirmation/cancellation emails
- Find-or-create patient by phone

## Roles

| Role | Access |
|------|--------|
| ADMIN | Full system access |
| DOCTOR / PRACTITIONER | Own appointments and patients |
| RECEPTIONIST | Appointments, patients, contacts |

## Quick Start

```bash
# 1. Start MongoDB (replica set)
mongod --replSet rs0

# 2. Backend
cd backend
npm install
npx prisma generate && npx prisma db push
npm run start:dev

# 3. Frontend
cd frontend
npm install
npm run dev
```

See **[SETUP.md](SETUP.md)** for detailed instructions.
