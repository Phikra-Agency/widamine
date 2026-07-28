# Prisma Schema Reference

> **Note**: This doc has been updated to reflect the current MongoDB schema.  
> The old SQLite schema (Service, Category, etc.) has been removed.

## Database

- **Provider**: MongoDB
- **Connection**: `mongodb://127.0.0.1:27017/widamine?replicaSet=rs0`

## Models

### User

Staff accounts.

| Field | Type | Notes |
|-------|------|-------|
| id | String @db.ObjectId | Auto-generated |
| name | String | Full name |
| email | String | Unique |
| password | String | Hashed (bcrypt) |
| role | String | ADMIN, DOCTOR, RECEPTIONIST, PRACTITIONER |
| admin | Boolean | Admin flag |
| image | String? | Profile photo URL |
| gender | String? | MALE / FEMALE |

Relations: `MotifPractitioner[]`, `Appointment[]`, `AvailabilityBlock[]`, `ResourcePractitioner[]`

### Motif

A treatment/service definition — the core domain entity.

| Field | Type | Notes |
|-------|------|-------|
| id | String @db.ObjectId | |
| name | String | Unique |
| slug | String | Unique, URL-safe |
| description | String? | |
| duration | Int | Minutes (default 30) |
| numberOfSessions | Int | Default 1 |
| isActive | Boolean | |
| isOnlineBookable | Boolean | Visible on landing |
| color | String | Hex for calendar |
| pendingTtlHours | Int | Auto-expiry (default 24) |

### Patient

| Field | Type | Notes |
|-------|------|-------|
| id | String @db.ObjectId | |
| firstName | String | |
| lastName | String | |
| email | String? | |
| phone | String | Unique, used for dedup |
| gender | String? | |
| medicalHistory | String? | |

### Appointment

| Field | Type | Notes |
|-------|------|-------|
| id | String @db.ObjectId | |
| patientId | ObjectId | → Patient |
| name | String | Patient name (denormalized) |
| email | String | |
| phone | String | |
| status | String | PENDING / CONFIRMED / COMPLETED / CANCELLED / EXPIRED |
| sessionNumber | Int | Auto-calculated |
| motifId | ObjectId | → Motif |
| practitionerId | ObjectId? | → User |
| resourceId | ObjectId? | → Resource |
| expiresAt | DateTime? | Auto-expiry timestamp |

### Session

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| number | Int |
| duration | Int |
| motifId | ObjectId → Motif |

### Schedule

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| datetime | DateTime |
| sessionId | ObjectId → Session |
| appointmentId | ObjectId → Appointment |

### Resource

Rooms and equipment.

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| name | String |
| slug | String (unique) |
| type | String |
| priority | Int |
| isActive | Boolean |

### Contact

Form submissions from landing page.

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| name | String |
| email | String |
| phone | String |
| context | String |
| read | Boolean |

### ChatLead

Chatbot visitor info.

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| name | String |
| email | String |
| createdAt | DateTime |

### NotificationLog

Delivery log for emails/notifications.

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| appointmentId | ObjectId → Appointment |
| channel | String (email, sms, etc.) |
| recipient | String |
| status | String |
| sentAt | DateTime? |

### AppSettings

| Field | Type |
|-------|------|
| id | String @db.ObjectId |
| smsEnabled | Boolean |
| emailEnabled | Boolean |
| inAppEnabled | Boolean |
| ... notification toggles | |

### Join Tables

`MotifPractitioner`, `MotifResource`, `ResourcePractitioner`, `AvailabilityBlock` — many-to-many relations with priority/active flags.
