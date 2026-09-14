# Quick Start

## Prerequisites

- Node.js 20+
- PostgreSQL (local: `widamine_main` DB) or access to cloud DB (already in `api/.env`)

## Steps

```bash
# 1. Clone / enter repo
cd /home/alae/Documents/repos/widamine

# 2. Unset Tor proxy (shell profile sets HTTP_PROXY → Tor — breaks SMTP/Groq)
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# 3. Install all dependencies + generate Prisma client
npm run bootstrap

# 4. (Optional) Switch to local DB for offline dev
# Edit api/.env:
# DATABASE_URL=postgresql://postgres@127.0.0.1:5432/widamine_main

# 5. Start all three services
cd api && npm run dev &        # :3000
cd landing && npm run dev &    # :5173
cd admin && npm run dev &      # :5174
```

## Verify

```bash
ss -tlnp | grep -E '3000|5173|5174'
curl http://localhost:3000/public/motifs
```

## Seed demo data

```bash
cd api && npm run seed
```

Creates: admin@widamine.com / admin123, 4 doctors, 1 receptionist, motifs, and sample patients.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find module 'dist/main'` | `cd api && npm run build` |
| Groq/SMTP calls fail | `unset HTTP_PROXY HTTPS_PROXY` etc. |
| Admin shows "service unavailable" | API is down — check port 3000, rebuild if needed |
| Landing proxy errors | Check `landing/vite.config.ts` proxy target (port 3001) vs API actual port |
