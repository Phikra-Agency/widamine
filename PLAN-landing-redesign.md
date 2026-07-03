# Widamine Landing Page — Pixel-Perfect Square Moncey Recreation

## Overview
Recreate the Square Moncey landing page structure exactly, using Widamine's color palette and content. Only the landing page (Home.tsx) is modified. Back-office is untouched.

## Color Palette (Widamine)
- Background: `#FFF6F4` (warm peach — same as Square Moncey)
- Primary/CTA: `#2e90c0` (Widamine blue)
- Text headings: `#1a3646` (Widamine navy)
- Accent: `#e8c5b8` (Widamine peach)
- Card accents: blue, peach, navy variants

## Available Assets
- Logo: `/widamine-source/widamine-logo-1-e1719238807194.png`
- Hero/clinic photo: `/hero.png`, `/widamine-source/slide1.jpg`
- Team: `/widamine-source/team4-1.png`
- Testimonials: `/widamine-source/testimonial1-1.png` through `testimonial5-1.png`
- Services: `/services/service_1.png`
- Page header: `/widamine-source/page-header-1-1.jpg`

---

## Section-by-Section Plan

### Step 0: Archive current Home.tsx
- Copy current `Home.tsx` → `Home.tsx.archive`
- This preserves the old version for reference

### Step 1: Update index.css
- Keep `.page-landing` with `background-color: #fff6f4`
- Keep existing theme variables
- No changes needed (already correct)

### Step 2: Rewrite Home.tsx — Section by Section

---

#### Section 1: Hero (pixel-perfect from Square Moncey)

**Layout**: Full viewport height, centered content, organic background

**Background**:
- Base: `#FFF6F4`
- 3-4 soft organic blobs: `border-radius: 50%`, peach/blue tinted, large blur (`blur-3xl` to `blur-3xl`), positioned at corners
- Botanical SVG illustrations at edges (reuse existing `LeafAccent`, `FlowerAccent`, `BranchAccent` components but with Widamine blue/peach tones)

**Content** (centered, max-width ~800px):
1. Logo: Widamine logo image in a soft circle (`h-20 w-20 rounded-full border border-secondary/10 bg-white/80`)
2. "WIDAMINE" — `font-amoria text-xl tracking-[0.2em] text-secondary`
3. "SOBRIÉTÉ ESTHÉTIQUE" — `text-[10px] uppercase tracking-[0.34em] text-secondary/50`
4. **Headline**: "Bienvenue dans *la jungle* de la *dermatologie* esthétique et laser."
   - Font: `font-amoria text-[3.5rem] leading-[1.05] text-secondary md:text-6xl lg:text-7xl`
   - Italic orange words: `<span className='italic text-primary'>la jungle</span>` and `<span className='italic text-primary'>dermatologie</span>`
5. **CTA button**: Orange pill — `rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white` with icon

**Key difference from Square Moncey**: Use `#2e90c0` blue for CTA and italic accents instead of `#E8732A` orange.

---

#### Section 2: Clinic Photo + Intro Text

**Layout**: Centered, generous vertical padding

**Photo**:
- Large rounded image: `rounded-[2rem]` or `rounded-[2.5rem]`
- Max-width ~900px, centered
- Use: `/widamine-source/slide1.jpg` (clinic interior) or `/hero.png`
- Subtle shadow: `shadow-[0_20px_50px_rgba(26,54,70,0.1)]`

**Text below photo** (centered):
- Heading: "Widamine Center, plus qu'un cabinet, *Un lieu.*"
  - `font-amoria text-4xl md:text-5xl text-secondary`
  - Italic accent: `<span className='italic text-primary'>Un lieu.</span>`
- Body paragraph: centered, max-width ~700px, `text-secondary/65 leading-8`

**Botanicals**: Flower illustration on left edge, bird on right edge

---

#### Section 3: L'énergie (2-column)

**Layout**: `grid lg:grid-cols-2 gap-12 items-center`, max-width ~1200px

**Left column**:
- Heading: "*L'énergie* du Widamine Center"
  - `font-amoria text-4xl md:text-5xl`
  - Italic orange on "L'énergie"
- Bold paragraph: `text-lg font-medium text-secondary leading-8`
- Regular paragraph: `text-secondary/65 leading-8`
- Orange pill button: "Traitements du visage" + icon
  - `rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white`

**Right column**:
- Quote card: `rounded-2xl border border-secondary/10 bg-white p-8`
- Blue heart icon (top-right): use `HeartStraight` from Phosphor
- Quote text in primary color italic: `"La nature nous donne la beauté, la sagesse nous aide à la révéler."`
- Attribution: "Proverbe chinois"
- Navigation arrows below: circular blue buttons with `CaretLeft`/`CaretRight`

---

#### Section 4: La méthode (3 colorful cards)

**Layout**: Centered heading + 3 equal-width cards

**Heading** (centered):
- "*La méthode* Widamine Center"
- `font-amoria text-4xl md:text-5xl text-secondary`
- Italic on "La méthode"

**3 cards** in `grid sm:grid-cols-3 gap-6`:

| Card | Background | Title | Button text |
|------|-----------|-------|-------------|
| 1 | `bg-primary/10` with `border border-primary/15` | "Traitements du visage" | "Découvrir les traitements" |
| 2 | `bg-accent/30` with `border border-accent/25` | "Traitements du corps" | "Découvrir les traitements" |
| 3 | `bg-secondary/10` with `border border-secondary/15` | "Les différentes techniques" | "Découvrir les techniques" |

Each card:
- `rounded-[2rem] p-8`
- Small icon at top (emoji or Phosphor icon in a small circle)
- Title: `text-xl font-semibold text-secondary`
- White pill button at bottom: `rounded-full bg-white px-5 py-2.5 text-sm font-medium text-secondary border border-secondary/10`

---

#### Section 5: L'équipe

**Heading** (centered):
- "*L'équipe* du Widamine Center"
- Italic on "L'équipe"

**Team cards**: Use existing `EXPERTISES` data
- `grid md:grid-cols-2 gap-8`
- Each card: `rounded-[2rem] border border-secondary/8 bg-white overflow-hidden`
- Image: full-width, `h-72 object-cover`
- Content: role (uppercase, primary color), name (text-2xl font-semibold), description, star rating

---

#### Section 6: Témoignages

**Heading** (centered):
- "*Les* Témoignages de nos patientes"
- Italic on "Témoignages"

**3 cards** in `grid sm:grid-cols-3 gap-6`:
- Use existing `WIDAMINE_CONTENT.testimonials` data (first 3)
- Card backgrounds: alternating soft colors — `bg-primary/8`, `bg-accent/20`, `bg-secondary/8`
- Each card: `rounded-[2rem] p-7`
- Circular photo: `h-14 w-14 rounded-full object-cover`
- Name below photo
- Testimonial text below

---

#### Section 7: CTA Banner

**Full-width** section with warm background:
- `bg-primary` (blue) or `bg-gradient-to-r from-primary to-primary/90`
- Rounded corners: `rounded-[2.5rem]`
- Organic shapes: soft circles + botanical SVG illustrations (white/transparent)

**Layout**: `grid lg:grid-cols-2 gap-10 items-center`, max-width ~1200px

**Left side**:
- Oval-framed photo: `rounded-full` or `rounded-[3rem]` with border
- Use: `/widamine-source/team4-1.png` or `/hero.png`

**Right side**:
- Heading: "Comment prendre rendez-vous au Widamine Center?"
  - `font-amoria text-4xl text-white`
- Body text: `text-white/80`
- Contact info with icons (CalendarDays, PhoneCall, MapPin, Clock3)
- Dark pill button: "Prendre rendez-vous" — `bg-white text-primary rounded-full`

---

#### Section 8: Footer

**Background**: `#FFF6F4` (same warm peach)

**4-column layout**: `grid lg:grid-cols-4 gap-8`

| Column | Content |
|--------|---------|
| 1 | Logo image + "WIDAMINE" + "SOBRIÉTÉ ESTHÉTIQUE" |
| 2 | "Widamine Center" heading + links: Le concept, Notre équipe |
| 3 | "Services" heading + links: Visage, Corps, Laser |
| 4 | "Coordonnées" heading + address, email, phone (with icons) |

**Bottom bar**: `border-t border-secondary/10 pt-6`
- Left: "© 2026 Widamine Aesthetic Center. Tous les droits sont réservés."
- Center: "Réalisé avec ❤ par [developer]"
- Right: Social icons (placeholder)

---

## File Changes

| File | Action |
|------|--------|
| `src/pages/Home.tsx.archive` | CREATE — copy of current Home.tsx |
| `src/pages/Home.tsx` | REWRITE — all 8 sections |
| `src/index.css` | MINOR — ensure `.page-landing` background is correct |
| `src/components/PublicNavbar.tsx` | NO CHANGE |
| `src/components/PublicFooter.tsx` | NO CHANGE |
| `src/lib/widamineSource.ts` | NO CHANGE |
| Back-office files | NO CHANGE |

## Verification
1. `npx tsc --noEmit` — TypeScript compiles
2. Visual check in browser at `localhost:5173`
3. Check all 8 sections match Square Moncey's layout
4. Verify landing page `/` renders correctly
5. Verify back-office `/back-office/*` is unaffected
6. Verify other public pages (`/contact`, `/appointment`, `/services/*`) still work
