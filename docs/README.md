# Documentation

## Getting started

| Doc | Description |
|-----|-------------|
| [Quick start](getting-started/quick-start.md) | Local dev bootstrap |
| [Docker](getting-started/docker.md) | Compose deployment |
| [MongoDB](getting-started/mongodb.md) | Replica set setup and notes |
| [WSL](getting-started/wsl.md) | WSL2 dev environment |

## Packages

| Doc | Description |
|-----|-------------|
| [API](packages/api.md) | NestJS + Prisma backend |
| [Admin](packages/admin.md) | Staff back-office (shadcn/ui) |
| [Landing](packages/landing.md) | Public marketing site |

## Development

| Doc | Description |
|-----|-------------|
| [Agents guide](development/agents.md) | Setup and conventions for AI agents |

## Design

| Doc | Description |
|-----|-------------|
| [Calendar legend](design/calendar-legend.md) | Motif color / legend redesign spec |

## Reference (legacy)

| Doc | Description |
|-----|-------------|
| [RBAC design](reference/rbac.md) | Role-based access proposals |
| [Components (legacy)](reference/components-legacy.md) | Old frontend component map |
| [Schema (legacy)](reference/schema-legacy.md) | Pre-MongoDB schema notes |

## Repo layout

```
widamine/
├── api/              NestJS API (:3000)
├── admin/            Staff app (:5174)
├── landing/          Public site (:5173)
├── docs/             Documentation (you are here)
├── package.json      npm workspaces + turbo
├── turbo.json
└── docker-compose.yml
```
