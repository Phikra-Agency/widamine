# Landing (`landing/`)

Public marketing site and future patient booking entry point.

## Dev

```bash
npm run dev --workspace=widamine-landing
# http://localhost:5173
```

## Status

Placeholder shell — hero copy and staff link. Public pages and booking flow to be ported here.

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_PUBLIC_API_URL` | `/api` | API base (proxied in dev/Docker) |
| `VITE_ADMIN_URL` | `http://localhost:5174` | Staff login link |

## Docker

nginx on port **8081** by default. Set `VITE_ADMIN_URL` at build time via compose args.
