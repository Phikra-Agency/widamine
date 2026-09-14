# Admin (`admin/`)

Staff back-office. Vite 8 + React 19 + shadcn/ui v4 + Zustand.

- **Dev:** `http://localhost:5174`
- **Prod:** `https://admin.widamineaestheticcenter.com`
- **Login:** `admin@widamine.com` / `admin123`

---

## Dev

```bash
npm run dev --workspace=widamine-admin
# or: cd admin && npm run dev
```

Proxy: `/api/*` → `http://127.0.0.1:3000`

---

## Pages

| Route | Page | Roles |
|-------|------|-------|
| `/login` | Login | All |
| `/calendar` | Weekly calendar view | ADMIN, RECEPTIONIST, DOCTOR |
| `/appointments` | Appointment queue + CRUD | ADMIN, RECEPTIONIST, DOCTOR |
| `/patients` | Patient records | ADMIN, RECEPTIONIST |
| `/users` | Staff accounts | ADMIN |
| `/motifs` | Motif/treatment definitions | ADMIN |
| `/resources` | Room management | ADMIN |
| `/contacts` | Contact submissions (in-app) | ADMIN, RECEPTIONIST |
| `/settings` | Notification settings | ADMIN |
| `/unavailabilities` | Practitioner unavailability blocks | ADMIN |

---

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| BackOfficeLayout | `components/layouts/BackOfficeLayout.tsx` | Main sidebar layout |
| ScheduleShowModal | `components/ScheduleShowModal.tsx` | Appointment detail modal |
| UnavailabilityFormModal | `components/UnavailabilityFormModal.tsx` | Add/edit unavailability |
| PractitionerStatusBar | `components/PractitionerStatusBar.tsx` | Current/next appointment strip |
| SettingsModal | `components/SettingsModal.tsx` | Notification channel settings (email, WhatsApp toggles) |
| NotificationToast | `components/NotificationToast.tsx` | In-app notification toast |
| CalendarNotificationBell | `components/calendar/CalendarNotificationBell.tsx` | Bell icon with unread count |

---

## Stores (Zustand)

| Store | Purpose |
|-------|---------|
| authStore | JWT + current user |
| appointmentsStore | Appointment list + pagination |
| patientsStore | Patient list |
| motifsStore | Motif list |
| resourcesStore | Room list |
| usersStore | Staff list |
| contactsStore | Contact submissions |
| schedulesStore | Schedule slots |
| notificationsStore | In-app notifications |
| statsStore | Dashboard stats |
| scheduleModalStore | Schedule detail modal state |

---

## UI Conventions

- **UI kit:** shadcn/ui v4 — components in `src/components/ui/`
- **Forms:** `FormDialog` from `src/components/bo/FormDialog.tsx`
- **Layout CSS classes:** `bo-page`, `bo-title`, `bo-subtitle`, `bo-chip` in `index.css`
- **No entrance animations** in back-office
- **Add shadcn component:** `cd admin && npx shadcn add <name> -y`
- **Data tables:** TanStack Table v8 via `src/components/data-table/`

---

## Calendar

Weekly view with coloured motif event cards. Features:
- Room auto-assignment on appointment confirm
- Drag-free — all actions via modals
- Practitioner filter
- Month grid and table grid views also available

---

## Roles & Access

| Role | Can do |
|------|--------|
| ADMIN | Everything |
| DOCTOR | View calendar, own appointments |
| RECEPTIONIST | Appointments, patients, contacts, calendar |
| PRACTITIONER | View only (limited) |

---

## Build

```bash
cd admin && npm run build
# Output: admin/dist/
```

Docker: nginx serves static build, proxies `/api` → `api:3000`. See `admin/Dockerfile`.
