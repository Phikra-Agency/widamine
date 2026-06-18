# Widamine - Frontend Components Documentation

## Project Structure

```
/home/alan/widamine/frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── back-office/ # Admin/HR dashboard pages
│   │   └── *.tsx        # Public site pages
│   ├── stores/          # Zustand state stores
│   ├── lib/             # Utilities, API client
│   └── App.tsx          # Main router
```

---

## Public Site Components

### `components/`
| Component | Purpose |
|----------|---------|
| **Header** | Public site header with navigation |
| **PublicNavbar** | Navigation menu |
| **PublicFooter** | Site footer |
| **BookingFlow** | Multi-step reservation booking widget |
| **Preloader** | Loading animation (deprecated) |
| **Scheduling** | Schedule/calendar styling |

### `pages/`
| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing page with hero, services, testimonials |
| **Contact** | `/contact` | Contact form |
| **ServiceDetail** | `/service/:slug` | Individual service page |
| **Appointment** | `/appointment/:id` | Appointment confirmation |
| **Login** | `/login` | Authentication page |

---

## Back-Office Components

### `pages/back-office/`

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/admin` or `/back-office/dashboard` | Overview with stats, upcoming appointments |
| **Appointments** | `/back-office/appointments` | Manage all bookings |
| **Calendar** | `/back-office/calendar` | Weekly calendar view |
| **Services** | `/back-office/services` | Manage services (CRUD) |
| **Categories** | `/back-office/categories` | Service categories |
| **Motifs** | `/back-office/motifs` | Consultation motifs |
| **Resources** | `/back-office/resources` | Rooms/salles |
| **Users** | `/back-office/users` | User accounts (admins, doctors) |
| **Patients** | `/back-office/patients` | Patient records |
| **Contacts** | `/back-office/contacts` | Contact form submissions |

---

## State Stores (Zustand)

### Location: `src/stores/`

| Store | Purpose |
|------|---------|
| **authStore** | User authentication & session |
| **appointmentsStore** | Appointment listings & CRUD |
| **servicesStore** | Service management |
| **categoriesStore** | Category management |
| **motifsStore** | Motif management |
| **resourcesStore** | Room/salle management |
| **usersStore** | User management |
| **patientsStore** | Patient records |
| **contactsStore** | Contact submissions |
| **schedulesStore** | Schedule/calendar data |
| **scheduleModalStore** | Booking widget state |

---

## Key Components Detail

### BookingFlow (`components/BookingFlow.tsx`)
Multi-step booking widget used on public site.

**Steps:**
1. **Step 1**: Select service/motif
2. **Step 2**: Select date & time slot (shows doctor name)
3. **Step 3**: Fill contact info

**Key States:**
```typescript
{
  step: number,           // 1, 2, or 3
  selectedMotif: any,    // Selected service
  selectedDate: Date,   // Selected date
  selectedHour: string, // Selected time slot
  selectedPractitionerId: number, // Selected doctor (auto-set from slot)
  availability: { morning: [], afternoon: [], evening: [] },
  userData: { prenom, nom, email, phone, note },
  submitSuccess: boolean,
}
```

---

### Back-Office Layout (`components/layouts/BackOfficeLayout.tsx`)

**Sidebar Navigation:**
- Dashboard → All roles
- Utilisateurs → ADMIN only
- Motifs → ADMIN only
- Salles → ADMIN only
- Rendez-vous → ADMIN, RECEPTIONIST, DOCTOR
- Calendrier → ADMIN, RECEPTIONIST, DOCTOR

**Role-Based Access:**
- ADMIN: Full access
- RECEPTIONIST: Appointments, Calendar, Dashboard
- DOCTOR: Appointments, Calendar, Dashboard (read-only)

---

### Dashboard (`pages/back-office/Dashboard.tsx`)

**Features:**
- Stats cards: Total reservations, Today's appointments, Upcoming
- Next 7 days overview
- Featured appointment details
- Quick navigation

---

### Services Page (`pages/back-office/Services.tsx`)

**Service Fields:**
- Name
- Price (DH)
- Category (dropdown)
- Primary Doctor (single select)
- **Allowed Doctors** (multi-select) - New feature
- **Allowed Salles** (multi-select) - New feature
- Sessions (time slots: session #, duration)

---

## Frontend API Integration

### API Client (`src/lib/api.ts`)
- Axios-based client for backend calls
- Auto-attaches JWT tokens
- Handles refresh tokens

### Endpoints Used:
```typescript
// Services
api.get('services')
api.post('services', payload)
api.put('services/:id', payload)
api.delete('services/:id')

// Appointments
api.get('appointments')
api.get('appointments/availability?date=...&serviceId=...')
api.post('appointments', payload)

// Users
api.get('users')
api.get('users/doctors')
```

---

## Routing (`App.tsx`)

### Public Routes
| Path | Component |
|------|-----------|
| `/` | Home |
| `/contact` | Contact |
| `/login` | Login |
| `/service/:slug` | ServiceDetail |
| `/appointment/:id` | Appointment |

### Back-Office Routes
| Path | Component | Required Role |
|------|-----------|---------------|
| `/admin` | Dashboard | Any |
| `/back-office/dashboard` | Dashboard | Any |
| `/back-office/users` | Users | ADMIN |
| `/back-office/motifs` | Motifs | ADMIN |
| `/back-office/resources` | Resources | ADMIN |
| `/back-office/services` | Services | ADMIN |
| `/back-office/categories` | Categories | ADMIN |
| `/back-office/appointments` | Appointments | ADMIN/RECEPTIONIST/DOCTOR |
| `/back-office/calendar` | Calendar | ADMIN/RECEPTIONIST/DOCTOR |
| `/back-office/patients` | Patients | ADMIN |
| `/back-office/contacts` | Contacts | ADMIN |

---

## Build & Start Commands

### Frontend
```bash
cd /home/alan/widamine/frontend
npm run dev    # Start dev server (port 5173)
npm run build  # Production build
```

### Backend
```bash
cd /home/alan/widamine/backend
npm run start:dev  # Start dev server (port 3000)
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3000"
```