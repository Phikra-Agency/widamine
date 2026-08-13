# AI Agents Guide

## Setup

The project root at `/home/alae/Documents/repos/widamine` contains a `.agents/` directory with skills and rules used by AI coding agents.

## Starting the stack for development

```bash
npm run bootstrap   # Install deps + generate Prisma client
npm run dev         # Start all 3 apps (turbo)
```

No local database needed — the app connects to the cloud PostgreSQL instance configured in `api/.env`.

## Project structure

```
widamine/
├── api/          NestJS API (:3000)
├── admin/        Staff dashboard (:5174)
├── landing/      Public site (:5173)
├── docs/
├── scripts/
├── .agents/      AI agent skills & rules
└── _archive/     Archived legacy files (MongoDB era)
```

## Agent rules

See `.agents/rules/` for project-specific agent conventions.

## Skills

The `.agents/skills/` directory contains 44 skill modules covering GSAP, SEO, accessibility, design, documentation, and more.

## Environment

- **API:** `api/.env` — PostgreSQL URL + keys already configured
- **Landing:** No env required locally
- **Admin:** No env required locally

## Useful commands

```bash
# DB
cd api
npx prisma studio          # Visual DB browser at :5555
npm run seed               # Seed demo data
npx prisma migrate dev     # Create new migration

# Build verification
npm run build              # Build all packages
cd api && npm run build    # API only
cd landing && npm run build  # Landing only
cd admin && npm run build  # Admin only
```
