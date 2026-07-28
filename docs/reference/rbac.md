# Role-Based Access Control (RBAC) — Design Document

> **Note**: This is a design document/proposal. The `Service` and `Category` models mentioned here have been removed from the codebase — Motif replaces them. The RBAC role definitions (ADMIN/DOCTOR/RECEPTIONIST) and guard architecture are implemented, but some data scoping from this doc is not yet fully applied.

## 1. Current State

### Backend
- **3 roles** defined in `src/enums.ts`: `ADMIN`, `DOCTOR`, `RECEPTIONIST`
- **AuthGuard**: verifies JWT token, attaches `req.user` (decoded JWT payload with `id`)
- **RoleGuard**: checks `req.user.role` against allowed roles — currently only used on `users` and `patients` controllers (both restricted to `ADMIN` only)
- **Problem**: Most controllers (`appointments`, `resources`, `motifs`, `services`, `categories`, `contacts`, `schedules`) have **no guards at all** — any authenticated user can access everything
- **Problem**: No data scoping — a DOCTOR sees ALL patients and ALL appointments, not just their own

### Frontend
- **Sidebar** already filters nav links by role (`BackOfficeLayout.tsx` line 20-33)
- **RoleWrapper** redirects unauthorized users client-side
- **Problem**: Frontend filtering is cosmetic only — backend returns unfiltered data

### Database (Prisma Schema)
- `Appointment.practitionerId` → links appointment to a specific doctor
- `Service.primaryDoctorId` + `allowedDoctorIds` → links services to doctors
- `MotifPractitioner` → many-to-many motif ↔ doctor with priority
- `ResourcePractitioner` → many-to-many resource ↔ doctor with priority
- `AvailabilityBlock.practitionerId` → doctor-specific availability
- **Key insight**: The schema already has the relationships needed for doctor-scoped queries

---

## 2. Role Definitions

### ADMIN
Full system access. Manages the platform, users, and configuration.

| Capability | Access Level |
|---|---|
| Dashboard | Full — all stats, all appointments |
| Calendar | All doctors' appointments (filterable by doctor) |
| Appointments | CRUD all, edit any status, assign practitioners |
| Patients | CRUD all patients |
| Users | CRUD users, assign roles, reset passwords |
| Services/Categories/Motifs | Full CRUD |
| Resources (Salles) | Full CRUD, assign priorities, link motifs |
| Contacts | Read, mark as read, delete |
| Settings | Full access — system config, role management |
| Doctor availability | View/edit any doctor's availability blocks |

### DOCTOR
Sees only their own patients and appointments. Cannot manage users or configuration.

| Capability | Access Level |
|---|---|
| Dashboard | Own stats only — today's own appointments, own completed/pending |
| Calendar | Own appointments only (filtered by `practitionerId = self.id`) |
| Appointments | Read own, edit status of own, **cannot** reassign practitioner |
| Patients | Read own patients (patients with appointments where `practitionerId = self.id`), edit medical history |
| Users | **No access** |
| Services/Categories/Motifs | Read-only (to view service details) |
| Resources (Salles) | Read-only (view assigned rooms) |
| Contacts | **No access** |
| Settings | **No access** |
| Doctor availability | View/edit own availability blocks only |

### RECEPTIONIST
Schedules and manages appointments across all doctors. Registers patients. No admin/config access.

| Capability | Access Level |
|---|---|
| Dashboard | Full — all stats, all today's appointments |
| Calendar | All doctors' appointments (can create/reschedule for any doctor) |
| Appointments | CRUD all, edit status, assign practitioners, create for any doctor |
| Patients | CRUD all patients |
| Users | **No access** |
| Services/Categories/Motifs | Read-only |
| Resources (Salles) | Read-only (view room assignments and availability) |
| Contacts | Read, mark as read |
| Settings | **No access** |
| Doctor availability | Read-only (view any doctor's blocks, cannot edit) |

---

## 3. Backend Changes Required

### 3.1 Apply Guards to All Controllers

Every controller must have at minimum `AuthGuard`. Add `RoleGuard` where role restriction is needed.

```typescript
// Current: no guards
@Controller("appointments")
export class AppointmentController { ... }

// After: authenticated users only
@UseGuards(AuthGuard)
@Controller("appointments")
export class AppointmentController { ... }
```

### 3.2 Enhance AuthGuard — Attach Full User Object

Currently `AuthGuard` only decodes JWT and sets `req.user = { id }`. The RoleGuard then does a separate DB query to get the role. Better approach:

```typescript
// auth.guard.ts — decode JWT and attach full user object
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException("No authorization header");

    try {
      const token = auth.split(" ")[1];
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) throw new UnauthorizedException("User not found");
      req.user = user; // full user object with role, id, name, etc.
      return true;
    } catch (e) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
```

This eliminates the redundant DB query in RoleGuard.

### 3.3 Data Scoping — The Core Change

#### Appointments Controller

```typescript
@UseGuards(AuthGuard)
@Controller("appointments")
export class AppointmentController {

  @Get()
  findAll(@Req() req) {
    const user = req.user;

    if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
      // Admin/Receptionist see everything
      return this.appointmentService.findAll();
    }

    if (user.role === "DOCTOR") {
      // Doctor sees only their own appointments
      return this.appointmentService.findByPractitioner(user.id);
    }
  }

  @Put(":id")
  async update(@Req() req, @Param("id") id: string, @Body() data: any) {
    const user = req.user;

    if (user.role === "DOCTOR") {
      // Doctor can only update their own appointments
      const appointment = await this.appointmentService.findOne(id);
      if (appointment.practitionerId !== user.id) {
        throw new ForbiddenException("Not your appointment");
      }
      // Doctor cannot reassign practitioner
      delete data.practitionerId;
    }

    return this.appointmentService.update(id, data);
  }
}
```

#### Patients Controller

```typescript
@UseGuards(AuthGuard)
@Controller("patients")
export class PatientController {

  @Get()
  findAll(@Req() req) {
    const user = req.user;

    if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
      return this.patientService.findAll();
    }

    if (user.role === "DOCTOR") {
      // Only patients who have appointments with this doctor
      return this.patientService.findByPractitioner(user.id);
    }
  }

  @Post()
  create(@Req() req, @Body() dto: CreatePatientDto) {
    const user = req.user;
    // ADMIN and RECEPTIONIST can create patients
    if (user.role === "DOCTOR") {
      throw new ForbiddenException("Doctors cannot create patients directly");
    }
    return this.patientService.create(dto);
  }

  @Put(":id")
  async update(@Req() req, @Param("id") id: string, @Body() dto: UpdatePatientDto) {
    const user = req.user;

    if (user.role === "DOCTOR") {
      // Doctor can only edit medicalHistory of their own patients
      const patient = await this.patientService.findOne(id);
      const isOwnPatient = await this.patientService.isPatientOfDoctor(id, user.id);
      if (!isOwnPatient) throw new ForbiddenException("Not your patient");
      // Restrict to medicalHistory only
      return this.patientService.updateMedicalHistory(id, dto.medicalHistory);
    }

    return this.patientService.update(id, dto);
  }
}
```

#### New Service Methods Needed

```typescript
// appointment.service.ts
async findByPractitioner(practitionerId: string) {
  return this.prisma.appointment.findMany({
    where: { practitionerId },
    include: { patient: true, service: true, practitioner: true, schedules: true },
    orderBy: { createdAt: "desc" },
  });
}

// patient.service.ts
async findByPractitioner(practitionerId: string) {
  return this.prisma.patient.findMany({
    where: {
      appointments: {
        some: { practitionerId },
      },
    },
    include: { appointments: { where: { practitionerId } } },
  });
}

async isPatientOfDoctor(patientId: string, practitionerId: string): Promise<boolean> {
  const count = await this.prisma.appointment.count({
    where: { patientId, practitionerId },
  });
  return count > 0;
}
```

### 3.4 Controller Guard Summary

| Controller | ADMIN | DOCTOR | RECEPTIONIST |
|---|---|---|---|
| `appointments` | Full CRUD | Read own, edit status own | Full CRUD |
| `patients` | Full CRUD | Read own, edit medicalHistory | Full CRUD |
| `users` | Full CRUD | No access | No access |
| `services` | Full CRUD | Read-only | Read-only |
| `categories` | Full CRUD | Read-only | Read-only |
| `motifs` | Full CRUD | Read-only | Read-only |
| `resources` | Full CRUD | Read-only | Read-only |
| `contacts` | Full access | No access | Read, mark read |
| `schedules` | Full CRUD | Read own, edit own | Read all, create for any |
| `availability` | Full CRUD | Read/edit own | Read all |

### 3.5 New Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/appointments/mine` | DOCTOR | Shortcut for doctor's own appointments |
| `GET` | `/patients/mine` | DOCTOR | Shortcut for doctor's own patients |
| `GET` | `/availability/mine` | DOCTOR | Shortcut for doctor's own availability |
| `GET` | `/users/doctors` | ALL AUTH | List doctors (for practitioner selection dropdowns) |
| `GET` | `/dashboard/stats` | ALL AUTH | Role-scoped dashboard statistics |

---

## 4. Frontend Changes Required

### 4.1 API Layer — Pass User Context

The frontend already sends the JWT token via `api` interceptor. The backend will use it to scope data. **No frontend API changes needed** — the backend filters based on the JWT identity.

### 4.2 Conditional UI Based on Role

#### Dashboard
- **ADMIN/RECEPTIONIST**: Show all stats, all today's appointments
- **DOCTOR**: Show only own stats, own today's appointments

```typescript
// Dashboard.tsx — use auth store to conditionally render
const { user } = useAuthStore()
const isDoctor = user?.role === 'DOCTOR'
// If doctor, fetchItems already returns scoped data from backend
```

#### Calendar
- **ADMIN/RECEPTIONIST**: Show all doctors' appointments, add doctor filter dropdown
- **DOCTOR**: Show only own appointments (no filter needed)

#### Appointments Page
- **ADMIN**: Full edit — can change status, practitioner, resource
- **RECEPTIONIST**: Can create/edit appointments, change status, assign practitioner
- **DOCTOR**: Can only change status of own appointments (practitioner field locked)

#### Patients Page
- **ADMIN/RECEPTIONIST**: Full CRUD
- **DOCTOR**: Read own patients, edit medical history only (hide create/delete buttons)

#### Sidebar (already partially done)
Add new links:
```typescript
{ to: 'services', label: 'Services', icon: Stethoscope, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
{ to: 'settings', label: 'Paramètres', icon: Gear, roles: ['ADMIN'] },
```

### 4.3 New Settings Page (ADMIN only)

A new `/back-office/settings` page for:
- **Role management**: View/edit role permissions (future: customizable roles)
- **System configuration**: Default appointment duration, notification settings
- **Clinic info**: Name, address, phone for public site
- **Integration settings**: SMS provider, email provider

---

## 5. Implementation Priority

### Phase 1 — Backend Auth Foundation (Critical)
1. ✅ Enhance `AuthGuard` to attach full user object
2. ✅ Apply `AuthGuard` to all controllers
3. ✅ Add `RoleGuard` where needed
4. ✅ Add data-scoping logic to `appointments` and `patients` controllers
5. ✅ Add `findByPractitioner` service methods

### Phase 2 — Frontend Role Awareness
1. ✅ Update Dashboard to handle scoped data
2. ✅ Add doctor filter to Calendar for ADMIN/RECEPTIONIST
3. ✅ Conditionally hide create/delete buttons for DOCTOR on Patients
4. ✅ Lock practitioner field for DOCTOR on Appointments edit
5. ✅ Add Settings page link to sidebar (ADMIN only)

### Phase 3 — Settings & Polish
1. ⬜ Create Settings page with role management
2. ⬜ Add `/dashboard/stats` endpoint with role-scoped aggregation
3. ⬜ Add audit logging for admin actions
4. ⬜ Add "impersonate" feature for admin debugging

---

## 6. Security Considerations

- **Never trust frontend role checks alone** — always enforce on backend
- **JWT contains only `id`** — role is fetched from DB on each request (prevents stale role in token)
- **Doctor data scoping** must happen in the **query**, not by filtering results after fetch (performance + security)
- **ForbiddenException** (HTTP 403) for unauthorized access, not just hiding UI elements
- **Rate limiting** on login endpoint to prevent brute force
- **Password reset** flow should be admin-initiated (no self-service for now)

---

## 7. Data Flow Diagram

```
┌─────────────┐     JWT      ┌─────────────┐
│  Frontend    │ ──────────► │  AuthGuard   │
│  (React)     │             │  (verifies)  │
└─────────────┘              └──────┬──────┘
                                    │ req.user = { id, role, name, ... }
                                    ▼
                             ┌─────────────┐
                             │  RoleGuard   │
                             │  (checks)    │
                             └──────┬──────┘
                                    │
                          ┌─────────┼─────────┐
                          ▼         ▼         ▼
                     ┌────────┐ ┌────────┐ ┌──────────┐
                     │ ADMIN  │ │ DOCTOR │ │ RECEPT.  │
                     │all data│ │scoped  │ │all data  │
                     └────────┘ └────────┘ └──────────┘
                                    │
                                    ▼
                     Prisma query with:
                     WHERE practitionerId = req.user.id
```
