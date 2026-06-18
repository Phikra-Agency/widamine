# Widamine

Monorepo for the Widamine clinic platform: public site, staff admin, and API.

## Packages

| Package | Path | Dev port |
|---------|------|----------|
| Landing | `landing/` | 5173 |
| Admin | `admin/` | 5174 |
| API | `api/` | 3000 |

## Quick start

```bash
./start-mongodb.sh
npm run bootstrap
npm run db:seed
npm run dev
```

Staff login: `admin@widamine.com` / `admin123`

## Documentation

Full docs live in **[docs/](docs/README.md)** — setup, Docker, package guides, and agent notes.

## Docker

```bash
cp .env.docker.example .env
npm run docker:up
```

- Landing: http://localhost:8081
- Admin: http://localhost:8080
- API: http://localhost:3000
