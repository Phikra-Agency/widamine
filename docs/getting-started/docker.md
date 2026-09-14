# Docker Deployment

All three services (API, Admin, Landing) are containerised. DB is external (cloud PostgreSQL on Coolify).

## Prerequisites

- Docker + Docker Compose
- A `.env` file at the project root (see below)

## Setup

```bash
cp .env.docker.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, GROQ_API_KEY, SMTP_*
docker compose up -d --build
```

## Ports (local Docker)

| Service | Port |
|---------|------|
| Landing | http://localhost:8081 |
| Admin | http://localhost:8080 |
| API | http://localhost:3000 |

## Prod Domains (Coolify)

| Service | Domain |
|---------|--------|
| Landing | https://new.widamineaestheticcenter.com |
| Admin | https://admin.widamineaestheticcenter.com |
| API | https://api.widamineaestheticcenter.com |

## Environment variables

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=change-me

# SMTP (real delivery)
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=admin@widamineaestheticcenter.com
SMTP_PASS=<password>
SMTP_FROM_NAME=Widamine Aesthetic Center
SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com

# Chatbot
GROQ_API_KEY=gsk_...

# WhatsApp (optional)
WHATSAPP_ENABLED=false
```

## Commands

```bash
docker compose up -d --build   # Build and start
docker compose logs -f         # Tail all logs
docker compose logs -f api     # API logs only
docker compose down            # Stop everything
docker compose restart api     # Restart single service
```

## Coolify Deploy

App UUID: `tyfa0ow9za5ohqn69dh9zhh4` (widamine:api, dockercompose, branch `latest`)

```bash
# Trigger deploy (Bearer token must be fresh — ask user)
curl -s "https://server.wa-pharma.com/api/v1/deploy?uuid=tyfa0ow9za5ohqn69dh9zhh4&force=true" \
  -H "Authorization: Bearer <TOKEN>"

# Verify (check _api:XXXXXXX image tag matches new commit SHA)
curl -s "https://server.wa-pharma.com/api/v1/resources?project_uuid=jgeq2wv4ylwv41xw1om3o69p" \
  -H "Authorization: Bearer <TOKEN>" | jq '.[] | .image_tag'
```

Push to `latest` branch to trigger auto-deploy, or use the force URL above.

```bash
# Safe push (bypass Tor proxy for large files)
no_proxy='*' NO_PROXY='*' git push origin latest
```
