# API (`api/`)

NestJS REST API with Prisma ORM + MongoDB.

## Dev

```bash
npm run dev --workspace=widamine-api
# or from root: npm run dev
```

Listens on **:3000**.

## Auth

JWT-based. Public endpoints carry no guard. Staff endpoints use `AuthGuard` + optional `RoleGuard` (ADMIN / DOCTOR / RECEPTIONIST).

## Chatbot

`POST /chatbot/message` — public endpoint.

- Model: `llama-3.3-70b-versatile` via Groq API
- Lead capture: Always asks for name + email, stores in `ChatLead` collection
- Tools: `store_lead`, `get_services`, `get_service_details`, `get_team`, `get_business_info`, `trigger_popup`
- Requires `GROQ_API_KEY` in `api/.env`

## Database

| Model | Description |
|-------|-------------|
| User | Staff accounts (ADMIN, DOCTOR, RECEPTIONIST, PRACTITIONER) |
| Patient | Patient records, deduplicated by phone |
| Motif | Treatment/service definition |
| Session | Session number + duration per motif |
| Appointment | Booked visit |
| Schedule | Datetime slot |
| Resource | Room/equipment |
| Contact | Contact form submissions |
| ChatLead | Chatbot visitor info (name + email) |
| NotificationLog | Notification delivery log |
| AppSettings | System config |

## Environment (`api/.env`)

```env
DATABASE_URL=mongodb://127.0.0.1:27017/widamine?replicaSet=rs0
JWT_SECRET=<required>
GROQ_API_KEY=<required for chatbot>
BREVO_API_KEY=<optional>
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=<optional>
VITE_ADMIN_URL=http://localhost:5174
```

## Docker

See [Docker setup](../getting-started/docker.md). Image from `api/Dockerfile`.
