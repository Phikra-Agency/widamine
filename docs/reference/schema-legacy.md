# Widamine - Prisma Schema Documentation

## Database Overview

- **Database**: SQLite (`dev.db`)
- **Location**: `/home/alan/widamine/backend/prisma/`

---

## Models

### User
Represents system users (admins, doctors, receptionists).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key, auto-increment |
| name | String | User's full name |
| email | String | Unique email |
| password | String | Hashed password |
| role | String | `ADMIN`, `DOCTOR`, `RECEPTIONIST` |
| admin | Boolean | Admin flag |
| services | Service[] | Services this doctor provides (relation: DoctorServices) |
| motifAssignments | MotifPractitioner[] | Motifs assigned to this doctor |
| assignedAppointments | Appointment[] | Appointments assigned to this doctor |
| availabilityBlocks | AvailabilityBlock[] | Doctor's availability blocks |

---

### Category
Service categories for grouping.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| category | String | Category name |
| services | Service[] | Services in this category |

---

### Service
Medical/aesthetic services offered by the center.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Service name |
| slug | String? | URL-friendly slug |
| price | Float | Price in MAD |
| categoryId | Int | Foreign key to Category |
| category | Category | Relation |
| sessions | Session[] | Available time slots/sessions |
| appointments | Appointment[] | Appointments for this service |
| motifs | Motif[] | Motifs linked to service |
| doctorId | Int | Primary doctor (fallback) |
| doctor | User | Relation (DoctorServices) |
| allowedDoctorIds | String? | JSON array of doctor IDs who can perform this service |
| allowedSalleIds | String? | JSON array of salle IDs where this service can be performed |

---

### Session
Defines time slots for a service.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| session | Int | Session number (1, 2, 3...) |
| duration | Int | Duration in minutes |
| serviceId | Int | Foreign key to Service |
| service | Service | Relation |
| schedules | Schedule[] | Scheduled appointments |

---

### Patient
Patient records.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| firstName | String | First name |
| lastName | String | Last name |
| email | String | Unique email |
| phone | String | Phone number |
| dateOfBirth | DateTime | Birth date |
| gender | String | Gender |
| address | String | Address |
| city | String | City |
| postalCode | String | Postal code |
| country | String | Country |
| medicalHistory | String? | Medical history notes |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

---

### Appointment
Client bookings/appointments.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Client name |
| email | String | Client email |
| phone | String | Client phone |
| context | String? | Notes/context |
| status | String | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| timezone | String | Timezone (default: Africa/Casablanca) |
| expiresAt | DateTime? | Expiration time |
| confirmedAt | DateTime? | Confirmation timestamp |
| cancelledAt | DateTime? | Cancellation timestamp |
| completedAt | DateTime? | Completion timestamp |
| serviceId | Int | Foreign key to Service |
| service | Service | Relation |
| motifId | Int? | Foreign key to Motif |
| motif | Motif? | Relation |
| practitionerId | Int? | Assigned doctor |
| practitioner | User? | Relation (AssignedPractitionerAppointments) |
| resourceId | Int? | Salle/room assigned |
| resource | Resource? | Relation |
| schedules | Schedule[] | Scheduled sessions |
| notifications | NotificationLog[] | Notification history |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

---

### Schedule
Links appointments to specific session times.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| datetime | DateTime | Scheduled time |
| sessionId | Int | Foreign key to Session |
| session | Session | Relation |
| appointmentId | Int | Foreign key to Appointment |
| appointment | Appointment | Relation |

---

### Contact
Contact form submissions from public site.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Visitor name |
| email | String | Visitor email |
| phone | String | Visitor phone |
| context | String | Message |
| read | Boolean | Read status (default: false) |

---

### Motif
Reasons for consultation/booking types.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Unique motif name |
| slug | String | URL-friendly slug |
| bookingType | String | Type of booking |
| description | String? | Description |
| duration | Int | Default duration in minutes |
| isActive | Boolean | Active status |
| requiresPractitionerChoice | Boolean | Client must pick doctor |
| pendingTtlHours | Int | Hours before pending expires |
| serviceId | Int | Primary Service |
| service | Service | Relation |
| practitionerAssignments | MotifPractitioner[] | Assigned doctors |
| resourceAssignments | MotifResource[] | Assigned rooms |
| appointments | Appointment[] | Appointments with this motif |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

---

### MotifPractitioner
Many-to-many: which doctors can handle which motifs.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| motifId | Int | Foreign key to Motif |
| motif | Motif | Relation |
| practitionerId | Int | Foreign key to User |
| practitioner | User | Relation |
| priority | Int | Priority order |
| isPreferred | Boolean | Preferred doctor |
| isActive | Boolean | Active status |

**Unique Constraint**: `[motifId, practitionerId]`

---

### Resource
Rooms/salles available for appointments.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Room name |
| slug | String | URL-friendly slug |
| type | String | Room type |
| description | String? | Description |
| isActive | Boolean | Active status |
| motifAssignments | MotifResource[] | Motifs assigned to this room |
| appointments | Appointment[] | Appointments in this room |
| availabilityBlocks | AvailabilityBlock[] | Blocked time slots |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

---

### MotifResource
Many-to-many: which motifs can use which rooms.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| motifId | Int | Foreign key to Motif |
| motif | Motif | Relation |
| resourceId | Int | Foreign key to Resource |
| resource | Resource | Relation |
| priority | Int | Priority order |
| isPreferred | Boolean | Preferred room |
| isRequired | Boolean | Required for this motif |

**Unique Constraint**: `[motifId, resourceId]`

---

### AvailabilityBlock
Blocks specific time slots (vacations, meetings, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| startsAt | DateTime | Block start time |
| endsAt | DateTime | Block end time |
| reason | String? | Reason for block |
| isActive | Boolean | Active status |
| practitionerId | Int? | Doctor (if blocked) |
| practitioner | User? | Relation |
| resourceId | Int? | Room (if blocked) |
| resource | Resource? | Relation |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

---

### NotificationLog
Tracks notifications sent to clients.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| appointmentId | Int | Foreign key to Appointment |
| appointment | Appointment | Relation |
| channel | String | `EMAIL`, `SMS` |
| recipientType | String | `CLIENT`, `PRACTITIONER` |
| recipient | String | Email or phone |
| provider | String? | Provider used (SendGrid, Twilio, etc.) |
| status | String | `PENDING`, `SENT`, `FAILED` |
| message | String? | Message sent |
| externalId | String? | External provider message ID |
| error | String? | Error message if failed |
| sentAt | DateTime? | Sent timestamp |
| createdAt | DateTime | Creation timestamp |

---

## Relationships Diagram

```
User (DOCTOR)
  ├── Service (primary doctor) ← doctorId
  ├── MotifPractitioner ← motif assignments
  ├── Appointment (practitioner) ← practitionerId
  └── AvailabilityBlock ← for doctors

Category
  └── Service ← categoryId

Service
  ├── Category
  ├── User (doctor)
  ├── Session ← serviceId
  ├── Motif ← serviceId
  ├── Appointment ← serviceId
  └── allowedDoctorIds, allowedSalleIds (JSON arrays)

Session
  └── Service
  └── Schedule ← sessionId

Motif
  ├── Service
  ├── MotifPractitioner ← motif assignments
  ├── MotifResource ← resource assignments
  └── Appointment (via motifId)

MotifPractitioner
  ├── Motif
  └── User (doctor)

Resource (Salle)
  ├── MotifResource ← assignments
  ├── Appointment (resourceId)
  └── AvailabilityBlock

Appointment
  ├── Service
  ├── Motif (optional)
  ├── User (practitioner, optional)
  ├── Resource (salle, optional)
  ├── Schedule[]
  └── NotificationLog[]

Schedule
  ├── Session
  └── Appointment
```

---

## Roles & Permissions

| Role | Access |
|------|--------|
| ADMIN | Full access - all pages |
| RECEPTIONIST | Appointments, Calendar, Dashboard |
| DOCTOR | Appointments, Calendar, Dashboard |

---

## Backend API Endpoints

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | `/services` | List all services |
| POST | `/services` | Create service |
| GET | `/services/:id` | Get single service |
| PUT | `/services/:id` | Update service |
| DELETE | `/services/:id` | Delete service |
| GET | `/appointments/availability` | Get available slots |
| GET | `/appointments` | List appointments |
| POST | `/appointments` | Create appointment |
| GET | `/users` | List users |
| GET | `/users/doctors` | List only doctors |
| GET | `/resources` | List rooms/salles |
| GET | `/motifs` | List motifs |
| GET | `/categories` | List categories |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh token |