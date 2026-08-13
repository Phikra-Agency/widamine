# Docker Deployment

All three services (API, Admin, Landing) are containerized. The database is external (cloud PostgreSQL).

## Prerequisites

- Docker + Docker Compose
- A `.env` file at the project root (see below)

## Setup

```bash
cp .env.docker.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, BREVO_API_KEY, GROQ_API_KEY
docker compose up -d --build
```

## Ports

| Service | Port |
|---------|------|
| Landing | http://localhost:8081 |
| Admin | http://localhost:8080 |
| API | http://localhost:3000 |

## Environment variables

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=change-me

# Optional but recommended
BREVO_API_KEY=xkeysib-...
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=your@email.com
GROQ_API_KEY=gsk_...
WHATSAPP_ENABLED=false
```

## Commands

```bash
docker compose up -d --build   # Start
docker compose logs -f         # Tail logs
docker compose down            # Stop
docker compose restart api     # Restart single service
```
