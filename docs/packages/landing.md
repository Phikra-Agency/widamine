# Landing (`landing/`)

Public marketing site for Widamine Aesthetic Center. Built with Vite + React + Tailwind + Framer Motion.

## Dev

```bash
npm run dev --workspace=widamine-landing
# http://localhost:5173
```

## Sections

| Section | Description |
|---------|-------------|
| Hero | Title, subtitle, CTA buttons |
| IntroSection | "Notre vision" — single paragraph |
| ConceptSection | "Notre Objectif" — image + text, teal backdrop |
| DoctorSection | Dr. Widad Slaoui bio |
| TeamSection | Team member cards |
| GallerySection | Photo carousel |
| TestimonialsSection | Patient reviews carousel |
| AppointmentSection | Booking info + CTA |
| Footer | Links, socials, legal |

## Chatbot

A floating chatbot button at bottom-right corner of every page.

- **Component**: `src/components/Chatbot.tsx`
- **Endpoint**: `POST /api/chatbot/message` (Vite proxies `/api` → `:3000`)
- **Lead capture**: Collects name + email before answering
- **Quick actions**: "Nos soins visage", "Prendre rendez-vous", "Où vous situez-vous ?", "Équipe du centre"
- **Popup triggers**: Booking modal or contact form via `scheduleModalStore` / `contactPopupStore`

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_PUBLIC_API_URL` | `/api` | API base (proxied in dev/Docker) |
| `VITE_ADMIN_URL` | `http://localhost:5174` | Staff login link |

## Docker

nginx on port **8081**. Set `VITE_ADMIN_URL` at build time via compose args.
