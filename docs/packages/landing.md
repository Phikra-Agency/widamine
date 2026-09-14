# Landing (`landing/`)

Public marketing + booking site. Vite 8 + React 19 + Tailwind + Framer Motion + GSAP.

- **Dev:** `http://localhost:5173`
- **Prod:** `https://new.widamineaestheticcenter.com`

---

## Dev

```bash
npm run dev --workspace=widamine-landing
# or: cd landing && npm run dev
```

> **Proxy:** `/api/*` → `http://127.0.0.1:3001` (note: port **3001**).  
> Unset Tor proxy vars before starting API: `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy all_proxy ALL_PROXY`

---

## Pages

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `pages/Home.tsx` | Main marketing page |
| `/about` | `pages/About.tsx` | About the clinic |
| `/contact` | `pages/Contact.tsx` | Contact form page |
| `/category/:slug` | `pages/ServiceCategory.tsx` | Services by category |
| `/services/:slug` | `pages/ServiceDetail.tsx` | Individual service detail |
| `/appointment` | — | Opens booking modal |

---

## Home.tsx Sections

Order in page:

| Section | Description |
|---------|-------------|
| HeroSection | Hero title, subtitle, 2 CTAs, video/image |
| IntroSection | "Notre vision" — paragraph |
| ConceptSection | "Notre Objectif" — text left, image right |
| TreatmentsSection | Dr. Widad Slaoui — **image left**, content right (desktop); stacked mobile |
| TeamSection | Swiper slider — 3 cards/view, autoplay 2200ms, spaceBetween 12 |
| GallerySection | Stacked card gallery — 340×480 slider left, text right; **no 3×3 dots** |
| TestimonialsSection | Dual marquee rows; star color `rgb(247, 162, 105)` |
| ConsultSection | **Map left**, contact info + CTA right |

---

## Key Components

| Component | File | Notes |
|-----------|------|-------|
| PublicNavbar | `components/PublicNavbar.tsx` | Mega-menu dropdown, mobile drawer, scroll-hide; CTA = "Contacter Nous" (CamelCase) |
| PublicFooter | `components/PublicFooter.tsx` | Social icons duotone `#009FD6`; service links `rgb(26,54,70)`; no "Réalisé avec ❤️" |
| BookingFlow | `components/BookingFlow.tsx` | Booking modal: type select → calendar → Dr. portrait (row mobile, col desktop) → form |
| Chatbot | `components/Chatbot.tsx` | Floating bubble bottom-right, Groq-powered |
| BmiPopup | `components/BmiPopup.tsx` | BMI calculator, triggered from chatbot |
| ContactPopup | `components/ContactPopup.tsx` | Contact form popup, triggered by navbar/chatbot |
| ServiceIcon | `components/ServiceIcon.tsx` | Per-slug SVG icons for nav dropdown |

---

## Stores (Zustand)

| Store | File | Purpose |
|-------|------|---------|
| scheduleModalStore | `stores/scheduleModalStore.ts` | Booking modal open/close |
| contactPopupStore | `stores/contactPopupStore.ts` | Contact popup open/close |
| bmiPopupStore | `stores/bmiPopupStore.ts` | BMI popup open/close |
| motifsStore | `stores/motifsStore.ts` | Motif list cache |
| appointmentsStore | `stores/appointmentsStore.ts` | Appointment state |

---

## Theme (`lib/theme.tsx`)

```ts
C.primary   = '#009FD6'   // teal blue
C.secondary = '#1a3646'   // dark navy
C.bg        = '#FBF7EF'   // warm cream
C.orange    = '#F7A269'   // testimonial stars, accents
```

---

## Chatbot

- **Component:** `src/components/Chatbot.tsx`
- **Endpoint:** `POST /api/chatbot/message` (proxied)
- **Quick actions:** Nos soins visage · Prendre rendez-vous · Où vous situez-vous ? · Équipe du centre
- **Popup triggers:** `scheduleModalStore.open()` (booking) or `contactPopupStore.open()` (contact) — activated via `trigger` field in API response
- **Lead capture:** Asks for name + email naturally (not hard-gated)
- **Clinic data:** Can answer questions about live appointment stats, services, practitioner availability

---

## Static Assets (`landing/public/`)

| Asset | Notes |
|-------|-------|
| `/logo.svg` | Icon-only logo (mobile) |
| `/logo-widamine.svg` | Full horizontal logo (desktop navbar + footer) |
| `/hero.jpg` | Hero section background image |
| `/catalogue.pdf` | 45MB original catalogue (linked from hero CTA) |
| `/images/team/` | Team member photos including `dr widad slaoui.jpg` |
| `/images/gallery/` | Clinic interior photos |

---

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_PUBLIC_API_URL` | `/api` | API base URL (proxied in dev) |
| `VITE_ADMIN_URL` | `http://localhost:5174` | Staff login link |

---

## Build

```bash
cd landing && npm run build
# Output: landing/dist/
```

Docker: nginx on port **8081**.
