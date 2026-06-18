# Admin (`admin/`)

Staff back-office — Vite + React + shadcn/ui.

## Dev

```bash
npm run dev --workspace=widamine-admin
# http://localhost:5174
```

Login: `admin@widamine.com` / `admin123`

Routes are at app root (`/calendar`, `/patients`, `/login`, …).

## Conventions

- **UI kit**: shadcn/ui v4 — `@/components/ui`
- **Forms**: `FormDialog` from `@/components/bo/FormDialog`
- **Layout CSS**: `bo-page`, `bo-page-inner`, `bo-title`, `bo-chip`, … in `index.css`
- **No entrance animations** — avoid `transition-all`, framer-motion
- **Fonts**: DM Sans (body), Amoria (logo)
- **Add components**: `cd admin && npx shadcn add <name> -y`

## Structure

```
admin/src/
├── components/       UI, calendar, layouts
├── pages/back-office/   Feature pages
└── stores/           Zustand
```

## Docker

nginx serves static build and proxies `/api` → `api:3000`. See `admin/Dockerfile`.
