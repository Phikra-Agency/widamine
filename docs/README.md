# Documentation

## Getting started

| Doc | Description |
|-----|-------------|
| [Quick start](getting-started/quick-start.md) | Local dev bootstrap |
| [Docker](getting-started/docker.md) | Compose deployment |
| [MongoDB](getting-started/mongodb.md) | Replica set setup and notes |

## Packages

| Doc | Description |
|-----|-------------|
| [API](packages/api.md) | NestJS + Prisma + MongoDB backend |
| [Admin](packages/admin.md) | Staff back-office (shadcn/ui) |
| [Landing](packages/landing.md) | Public marketing site |

## Development

| Doc | Description |
|-----|-------------|
| [Agents guide](development/agents.md) | Setup and conventions for AI agents |

## Repo layout

```
widamine/
├── api/              NestJS API (:3000)
├── admin/            Staff app (:5174)
├── landing/          Public site (:5173)
├── docs/             Documentation
├── scripts/          Utility scripts
├── package.json      npm workspaces + turbo
├── turbo.json
└── docker-compose.yml
```
