# Docker deployment

## Setup

```bash
cp .env.docker.example .env
# Edit JWT_SECRET (required)
npm run docker:up
```

## Services

| Service | Default port | Description |
|---------|--------------|-------------|
| `mongo` | 27017 | MongoDB replica set |
| `mongo-init` | — | One-shot replica set init |
| `api` | 3000 | NestJS API |
| `admin` | 8080 | Staff UI (nginx + `/api` proxy) |
| `landing` | 8081 | Public site (nginx + `/api` proxy) |

## Environment variables

See `.env.docker.example`:

- `JWT_SECRET` — required in production
- `API_PORT`, `ADMIN_PORT`, `LANDING_PORT` — host port overrides
- `VITE_ADMIN_URL` — staff link target baked into landing build
- `BREVO_API_KEY`, `SMTP_FROM_*` — optional email

## First-time database seed

Mongo is exposed on `localhost:27017`:

```bash
cd api
DATABASE_URL='mongodb://localhost:27017/widamine?replicaSet=rs0' npm run seed
```

## Commands

```bash
npm run docker:down
npm run docker:logs
```

## Build context

Images build from the monorepo root so workspace dependencies resolve correctly. Dockerfiles live in `api/`, `admin/`, and `landing/`.
