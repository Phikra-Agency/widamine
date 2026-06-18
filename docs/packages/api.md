# API (`api/`)

NestJS REST API with Prisma ORM and MongoDB.

## Dev

```bash
npm run dev --workspace=widamine-api
# or from root: npm run dev
```

Listens on **:3000** by default.

## Build

```bash
npm run build --workspace=widamine-api
# Output: api/dist/src/main.js
```

## Database

```bash
npm run db:generate   # Prisma client
npm run db:seed       # Admin user + demo data
```

## Environment (`api/.env`)

```env
DATABASE_URL=mongodb://localhost:27017/widamine
JWT_SECRET=your-secret
BREVO_API_KEY=...          # optional
SMTP_FROM_NAME=Widamine
SMTP_FROM_EMAIL=...
```

## Docker

See [Docker setup](../getting-started/docker.md). Image built from `api/Dockerfile`.
