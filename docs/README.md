# Widamine Project

Medical/aesthetic clinic management system with public booking site and admin dashboard.

## Project Overview

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: NestJS + Prisma + SQLite
- **Database**: SQLite

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd /home/alan/widamine/frontend
npm install

# Backend
cd /home/alan/widamine/backend
npm install
```

### 2. Start Development Servers

**Terminal 1 (Backend):**
```bash
cd /home/alan/widamine/backend
npm run start:dev
# Runs on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd /home/alan/widamine/frontend
npm run dev
# Runs on http://localhost:5173
```

### 3. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## Project Structure

```
/home/alan/widamine/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   │   ├── back-office/  # Admin dashboard
│   │   │   └── *.tsx         # Public site
│   │   ├── stores/       # Zustand state
│   │   ├── lib/         # Utilities
│   │   └── App.tsx      # Router
│   └── package.json
│
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── prisma/    # Database schema
│   │   ├── auth/      # Authentication
│   │   ├── users/     # User management
│   │   ├── services/  # Services CRUD
│   │   ├── appointments/  # Bookings
│   │   └── *.ts       # Other modules
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── docs/            # Documentation
    ├── SCHEMA.md      # Database schema
    └── COMPONENTS.md  # Frontend components
```

---

## Features

### Public Site
- Landing page with services showcase
- Service detail pages
- Multi-step booking flow
- Contact form
- Doctor/salle availability checking

### Admin Dashboard
- **Dashboard**: Overview stats, upcoming appointments
- **Appointments**: Manage all bookings
- **Calendar**: Weekly schedule view
- **Services**: CRUD with multi-doctor/multi-salle support
- **Categories**: Service categorization
- **Motifs**: Consultation types
- **Resources**: Room/salle management
- **Users**: Admin, Doctor, Receptionist accounts
- **Patients**: Patient records
- **Contacts**: Form submissions

### Booking System
- Multiple doctors per service
- Multiple rooms/salles per service
- Real-time availability checking
- Prevents double-booking (doctor + salle)
- Shows doctor name on time slots

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Mantine (date picker)
- Zustand (state management)
- React Router
- Axios

### Backend
- NestJS
- Prisma ORM
- SQLite
- JWT Authentication
- Class Validator

---

## Deployment

### Development

Both servers run locally:
- Frontend: Vite dev server
- Backend: NestJS with watch mode

### Production Build

**Frontend:**
```bash
cd /home/alan/widamine/frontend
npm run build
# Output: dist/
```

**Backend:**
```bash
cd /home/alan/widamine/backend
npm run build
# Output: dist/
```

---

## Database

### Migrations

```bash
cd /home/alan/widamine/backend
npx prisma db push      # Apply schema
npx prisma generate    # Generate client
```

### Seed Data

The database starts empty. Add:
- Categories
- Doctors (Users with role: DOCTOR)
- Services (linked to doctors)
- Rooms (Resources)
- Sessions (time slots for services)

---

## Authentication

### Login
- Public site: `/login`
- Default admin: Create via backend or direct database insert

### JWT
- Tokens stored in localStorage
- Auto-refresh on expiry
- Role-based access control

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| GET | `/services` | List services |
| GET | `/appointments/availability` | Available slots |
| GET | `/users/doctors` | List doctors |
| GET | `/resources` | List rooms |

---

## Scripts

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview # Preview build
```

### Backend
```bash
npm run start:dev    # Development with watch
npm run build       # Production build
npm run start       # Production run
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
fuser -k 3000/tcp   # Backend
fuser -k 5173/tcp   # Frontend
```

### Database Errors
```bash
# Reset database
cd /home/alan/widamine/backend
rm prisma/dev.db
npx prisma db push
```

---

## Files Created in This Project

### Documentation (`docs/`)
- `SCHEMA.md` - Database schema
- `COMPONENTS.md` - Frontend components guide

### Backend Fixes
- Added `allowedDoctorIds`, `allowedSalleIds` to Service model
- Updated `getAvailability` to check doctor + salle conflicts
- Fixed appointment availability logic

### Frontend Fixes
- Added animations to all admin pages
- Fixed booking flow auto-load availability
- Removed preloader
- Added doctor/salle multi-select to Services page
- Time slots now show doctor name

### Bug Fixes
- Modal closing tag mismatches
- Services page structure issues
- Availability not loading on date selection