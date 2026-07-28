# Admin (`admin/`)

Staff back-office — Vite + React + shadcn/ui + Zustand.

## Dev

```bash
npm run dev --workspace=widamine-admin
# http://localhost:5174
```

Login: `admin@widamine.com` / `admin123`

## Pages

| Route | Page | Roles |
|-------|------|-------|
| `/login` | Login | All |
| `/calendar` | Weekly calendar | ADMIN, RECEPTIONIST, DOCTOR |
| `/appointments` | Appointment queue | ADMIN, RECEPTIONIST, DOCTOR |
| `/patients` | Patient records | ADMIN, RECEPTIONIST |
| `/users` | User management | ADMIN |
| `/motifs` | Motif definitions | ADMIN |
| `/resources` | Room management | ADMIN |
| `/contacts` | Contact submissions | ADMIN, RECEPTIONIST |

## Conventions

- **UI kit**: shadcn/ui v4 — `@/components/ui`
- **Forms**: `FormDialog` from `@/components/bo/FormDialog`
- **Layout CSS**: `bo-page`, `bo-chip`, etc. in `index.css`
- **No entrance animations**
- **Add components**: `cd admin && npx shadcn add <name> -y`

## Calendar

Weekly view with colored motif blocks. Room auto-assignment on confirm. Drag-free, modal-based scheduling.

## Docker

nginx serves static build, proxies `/api` → `api:3000`. See `admin/Dockerfile`.
