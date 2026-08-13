# API (`api/`)

NestJS REST API with Prisma ORM + PostgreSQL (cloud hosted).

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
- Lead capture: Asks for name + email, stores in `ChatLead`
- Tools: `store_lead`, `get_services`, `get_service_details`, `get_team`, `get_business_info`, `trigger_popup`, `get_clinic_stats`, `get_practitioners_info`
- Requires `GROQ_API_KEY` in `api/.env`

## Database

PostgreSQL cloud database hosted on Coolify (`91.98.161.53:5420`).

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
DATABASE_URL=postgresql://...  # Cloud PostgreSQL (already set)
JWT_SECRET=<required>
GROQ_API_KEY=<required for chatbot>
BREVO_API_KEY=<required for email>
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=<your sender email>
WHATSAPP_ENABLED=false         # Set to true and scan QR to enable
VITE_ADMIN_URL=http://localhost:5174
```

## Prisma commands

```bash
cd api
npx prisma studio          # Visual DB editor at :5555
npx prisma migrate dev     # Create and apply new migration
npx prisma migrate deploy  # Apply migrations (production)
npx prisma generate        # Regenerate client after schema changes
npm run seed               # Seed demo data
```

## Notifications

- **Email:** Brevo TransactionalEmailsApi — set `BREVO_API_KEY`
- **WhatsApp:** OpenWA — set `WHATSAPP_ENABLED=true` and scan QR on first run

## Docker

See [Docker setup](../getting-started/docker.md). Image from `api/Dockerfile`.
