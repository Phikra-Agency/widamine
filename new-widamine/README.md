# new-widamine

Redesigned Widamine back-office UI (calm, clinical-but-warm) built as a standalone Vite app. The original `frontend/` is preserved unchanged.

## Quick start

```bash
# From repo root — start MongoDB + backend first (see AGENTS.md)
cd new-widamine
npm install
npm run dev   # http://localhost:5174
```

Login: `admin@widamine.com` / `admin123`

## Highlights

- **Calendar**: hierarchical motif families (from `bookingType`), two-layer legend, search, family filters
- **Design system**: evolved `bo-*` tokens in `src/index.css`
- **Same API**: proxies `/api` → backend on `:3000`

## Structure

```
new-widamine/
├── src/
│   ├── components/calendar/   # MotifLegend, EventCard, CalendarControlBar
│   ├── lib/motifFamilies.ts # Family mapping + helpers
│   ├── pages/back-office/   # All BO pages
│   └── stores/              # Shared Zustand stores (ported from frontend)
```
