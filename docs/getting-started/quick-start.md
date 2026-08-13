# Quick start

## Prerequisites

- Node.js 20+
- Access to the PostgreSQL cloud database (already configured in `api/.env`)

## Steps

```bash
# 1. Install dependencies + generate Prisma client
npm run bootstrap

# 2. Seed database (if starting fresh)
npm run db:seed

# 3. Start all apps (turbo)
npm run dev
```

## URLs

| App | URL |
|-----|-----|
| Landing (public) | http://localhost:5173 |
| Admin (staff) | http://localhost:5174 |
| API | http://localhost:3000 |

## Staff login

`admin@widamine.com` / `admin123`

## Environment

The `api/.env` is already configured with the cloud PostgreSQL connection.
Only set these if missing:

```env
JWT_SECRET=<your-secret>
GROQ_API_KEY=<groq-api-key>   # for chatbot
BREVO_API_KEY=<brevo-key>     # for email notifications
```

## Proxy env vars

The system may have `HTTP_PROXY`/`HTTPS_PROXY` pointing to Tor — these break the chatbot. Always unset before starting dev:

```bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY
```

## Chatbot lead capture

The chatbot on the landing page collects visitor name + email and stores in `ChatLead`. Requires `GROQ_API_KEY` in `api/.env`.

## WhatsApp notifications

Set `WHATSAPP_ENABLED=true` in `api/.env`, start the API, and scan the QR code that appears in the terminal with WhatsApp mobile. Session persists across restarts.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Turbo: api + admin + landing |
| `npm run build` | Production build |
| `npm run lint` | Lint all workspaces |
| `npm run db:seed` | Seed demo data |
| `npm run db:generate` | Regenerate Prisma client |
