# Widamine — Next Agent Brief

## Project Context
Full backoffice admin (React 19, NestJS, Prisma + MongoDB) + public landing page (Mantine v9).
All architecture, conventions, and setup in `AGENTS.md` and `docs/development/agents.md`.

## Recent Changes (this session)

### Notification compactness — DONE
All three notification components now show timestamp inline with message (`"message / HH:mm"`) instead of a separate line:
- `admin/src/components/NotificationToast.tsx` — removed `minHeight: 150`, compact layout with `items-center`, `py-2` instead of `p-2.5`, smaller bell icon
- `admin/src/components/SidebarNotificationBell.tsx` — timestamp moved inline with `<span className='ml-1.5'>`
- `admin/src/components/calendar/CalendarNotificationBell.tsx` — same inline timestamp

### Calendar date picker min-width — DONE (see AGENTS.md for full history)

### Calendar filter button width — reverted to original (no min-width)

## Pending High-Priority Work

### 1. Sidebar search pollutes table filters
**Root cause:** `SidebarSearch.tsx` line 78 calls `setGlobalTerm(value)` which writes to a zustand store (`globalSearchStore.ts`). Every page (`Contacts`, `Calendar`, `Users`, `Patients`, `Resources`, `Motifs`, `Reservations`) reads from that same store via `useDebouncedGlobalSearch()` and passes it as `globalFilter` to TanStack Table.

**Fix needed:**
1. Remove `setGlobalTerm` / `clearTerm` from `SidebarSearch.tsx`
2. Remove `useDebouncedGlobalSearch` / `useGlobalSearchStore` imports from all page files
3. Each page that needs its own search should use LOCAL state only (not global)

**Affected files:**
- `admin/src/stores/globalSearchStore.ts` — likely can be deleted
- `admin/src/hooks/useDebouncedGlobalSearch.ts` — likely can be deleted
- `admin/src/components/layouts/SidebarSearch.tsx` — remove global store references
- `admin/src/pages/back-office/Contacts.tsx` lines 7, 10, 45, 47-48, 72-75, 117-125
- `admin/src/pages/back-office/Motifs.tsx` lines 14, 66
- `admin/src/pages/back-office/Resources.tsx` lines 24-25, 72
- `admin/src/pages/back-office/Users.tsx` lines 22, 24, 81
- `admin/src/pages/back-office/Appointments.tsx` lines 24, 64
- `admin/src/pages/back-office/Calendar.tsx` lines 38, 151
- `admin/src/pages/back-office/Reservations.tsx` lines 21, 23, 105
- `admin/src/pages/back-office/Patients.tsx` line 7

### 2. Search term highlighting in sidebar results
In `SidebarSearch.tsx` result items, `label` and `subtitle` render as plain text. Need to bold/highlight the portion matching the search term (e.g., search "na" → shows "**Na**dia").

**Implementation:** create a helper function that splits text on the search term (case-insensitive) and wraps matches in `<strong>`. Apply to both `label` and `subtitle` in the result rendering section (~lines 252-254).

### 3. Practitioner hover popover — verify stability
The popover uses `position: fixed` via `getBoundingClientRect()` on hover. It should:
- Show on hover of any practitioner row
- Not clip on the last row (fixed positioning escapes overflow)
- Only use one shared popover instance (managed in `PractitionerAnalytics.tsx`)

### 4. Calendar "Aujourd'hui" button — verify gap
The today button is positioned at `calc(50% + 130px)` from center. The desktop CalendarDatePicker now has `min-w-[190px]` to ensure the nav group stays wide enough in week/month modes so the gap to "Aujourd'hui" doesn't expand.

## Key Architecture

### Admin stack
- React 19, React Router 7, Tailwind 4, shadcn/ui (base-ui), TanStack Table, zustand
- `@phosphor-icons/react` v2, `use-debounce`, zod, clsx
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- Vite proxy: `/api` → `localhost:3000`

### Page pattern (CRUD pages)
`bo-page > bo-page-inner bo-section-stack > Heading + Card.bo-table-card > DataTable.Root > (DataTable.Toolbar + DataTable.Desktop + DataTable.Mobile)`

### Notification system
Zustand store (`notificationsStore.ts`) with polling. Three UI components:
- `NotificationToast` — fixed bottom-right, auto-dismiss after 5s
- `SidebarNotificationBell` — portal dropdown from sidebar
- `CalendarNotificationBell` — dropdown from calendar toolbar

### Search API
`api/src/search/` module — `GET /search?q=term` — searches Patients, Appointments, Contacts, Users via MongoDB `$runCommandRaw` + `$regex` + `$options: "i"`

## Common Pitfalls
- MongoDB `$regex` needs `$options: "i"` for case-insensitive (Prisma's `contains` is case-sensitive with MongoDB)
- `$runCommandRaw` returns `{ cursor: { firstBatch: [...] } }`, `_id` may be ObjectId
- The Table component (`admin/src/components/ui/table.tsx`) wraps `<table>` in `<div data-slot="table-container">` with `overflow-auto` — this clips absolutely-positioned popovers
- Landing backoffice pages (14 files under `landing/`) are legacy/unused — not in router
