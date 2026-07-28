# Components

> **Note**: The old monolithic frontend (`frontend/`) has been replaced by two packages:  
> [`landing/`](../packages/landing.md) (public site) and [`admin/`](../packages/admin.md) (staff back-office).  
> This doc has been updated to reflect the current structure.

---

## Landing (`landing/`)

### Components

| Component | File | Purpose |
|-----------|------|---------|
| Chatbot | `src/components/Chatbot.tsx` | Floating AI chatbot with lead capture |
| Layout | `src/components/layouts/Layout.tsx` | Site shell (header, footer, chatbot) |

### Sections (in `src/pages/Home.tsx`)

| Section | Description |
|---------|-------------|
| HeroSection | Title, subtitle, CTAs |
| IntroSection | "Notre vision" — single paragraph |
| ConceptSection | "Notre Objectif" — image + text |
| DoctorSection | Dr. Widad Slaoui bio |
| TeamSection | Team member cards |
| GallerySection | Photo carousel |
| TestimonialsSection | Patient reviews |
| ContactSection | Booking info |
| Footer | Links, socials |

### Stores

| Store | File | Purpose |
|-------|------|---------|
| scheduleModalStore | `src/stores/scheduleModalStore.ts` | Booking modal state |
| contactPopupStore | `src/stores/contactPopupStore.ts` | Contact form popup state |

---

## Admin (`admin/`)

### Pages (in `src/pages/back-office/`)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview stats |
| Appointments | `/appointments` | Booking queue |
| Calendar | `/calendar` | Weekly calendar |
| Users | `/users` | Staff accounts (ADMIN) |
| Patients | `/patients` | Patient records |
| Motifs | `/motifs` | Treatment definitions (ADMIN) |
| Resources | `/resources` | Room management (ADMIN) |
| Contacts | `/contacts` | Contact form submissions |

### UI Components

shadcn/ui v4 from `@/components/ui/`. Key custom components:

| Component | Path | Purpose |
|-----------|------|---------|
| FormDialog | `@/components/bo/FormDialog` | CRUD overlay dialogs |
| LoadingScreen | `@/components/bo/LoadingScreen` | Full-page loader |

### Stores

Zustand stores in `src/stores/`: auth, appointments, patients, users, motifs, resources, contacts, schedules, scheduleModal.
