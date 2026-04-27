Project Overview — Widamine Frontend
==================================

This document explains the project (frontend) part-by-part, describes where important files live, how the data and assets are organized, and notes current work and next steps.

1) High-level summary
----------------------
- Purpose: Clone/adapt the Widamine landing page into a React/Vite frontend. The app reproduces the reference site's visual structure (hero, services, before/after, experts, testimonials, etc.) while using project-specific components and styling.
- Tech stack: React + Vite, TypeScript (some files use implicit types), Tailwind-ish utility classes (project's design tokens), Swiper/Embla for carousels, GSAP + Framer Motion for animations.

2) Repo layout (important folders)
----------------------------------
- /home/alan/widamine/frontend/
  - public/ - static files served by Vite, includes a widamine-source/ subfolder with harvested images and fonts.
    - public/widamine-source/ - place for copied source images (hero slides, team headshots, testimonials, before/after, flaticon files if added).
  - src/ - application source
    - src/pages/Home.tsx - Single-file page composing most of the landing sections (Hero, Services, BeforeAfter, Experts, Testimonials, etc.). This is the main place where content is wired and layouts live.
    - src/components/Preloader.tsx - Minimal preloader component used on the Home page.
    - src/lib/widamineSource.ts - Single mapping file that exposes WIDAMINE_ASSETS (path pointers to public assets) and WIDAMINE_CONTENT (seed data like testimonials and experts). The Home page imports this file for images and content.
    - src/components and other shared UI components - (navbar, modal stores, icons) — used across pages.

3) Key files and responsibilities
--------------------------------
- frontend/src/pages/Home.tsx
  - Contains the full landing page composition: Hero, Services (two implementations: archived and Swiper-based), ServiceUniverse, MedicalAesthetics, BeforeAfter, PatientJourney, Experts, Testimonials, Trust, News, ConsultationBanner, ClosingSection.
  - Uses Framer Motion for reveal animation, GSAP for some hero animation, Swiper/Embla for carousels.
  - Important constants defined inside: SERVICES, MEDICAL_INSIGHTS, JOURNEY_CARDS, EXPERTISES, TRUST_POINTS, TESTIMONIALS (local copies exist here for internal components), NEWS_POSTS, CARE_UNIVERSES, PROGRAM_GROUPS.
  - Service tiles: SERVICE entries now include an iconClass field (e.g., "flaticon-arm") so the ServiceCard can render an <i className="flaticon-..." /> when the flaticon CSS/fonts are available.
  - Hero: The background image div that previously used WIDAMINE_ASSETS.heroSlides[0] has been removed (the hero displays the logo + decorative overlays now). The logo image is sourced from WIDAMINE_ASSETS.logos.primary.
  - BeforeAfterSection: Implements a range input to change a clipPath which reveals the 'Avant' (left) vs 'Après' (right). Implementation uses WIDAMINE_ASSETS.beforeAfter for images.

- frontend/src/lib/widamineSource.ts
  - Exports WIDAMINE_ASSETS: a map of public asset paths (heroSlides, logos, pageHeader, team, testimonials, beforeAfter).
  - Exports WIDAMINE_CONTENT: seed content (hero text, testimonials array, experts array). This is the canonical mapping the pages import.
  - Locations to update when adding real assets: put files under public/widamine-source/ and update this mapping.

- frontend/src/components/Preloader.tsx
  - Small component that shows the (downloaded) alt logo for ~900ms on initial load. It reads WIDAMINE_ASSETS.logos.alt.

4) Assets and the flaticon icon set
----------------------------------
- The reference site uses a custom flaticon font + CSS with many classes (flaticon-arm, flaticon-pharmacist, flaticon-review, etc.). The repository contains placeholders for the source images in public/widamine-source/ but does not yet automatically load flaticon.css.
- To render the iconClass values in Service cards and other places you must add the flaticon.css and font files to public (for example public/widamine-source/fonts/) and import flaticon.css from your global CSS (index.css) or directly in an entry component.

5) Data flow
------------
- WIDAMINE_ASSETS (paths) -> imported in pages/components -> used as src for <img> elements.
- WIDAMINE_CONTENT (objects) -> used to populate testimonials, experts and other seed data used by Home.tsx.
- Some constants live inline inside Home.tsx (SERVICES, JOURNEY_CARDS, etc.) and are used directly by components on that page. For a consistent approach you can migrate them into lib/widamineSource.ts.

6) Notable UI behaviors
-----------------------
- Services carousel
  - There are two implementations in the file: ServicesArchived (Embla + custom hover panel) and Services (Swiper coverflow). The latter is used by default and has autoplay with pauseOnMouseEnter, hover behaviours that show a contextual panel.
  - ServiceCard now attempts to render an icon via service.iconClass (i.flaticon-...). Without flaticon.css this falls back to an ArrowUpRightIcon (Phosphor).

- Hero
  - Uses WIDAMINE_ASSETS.logos.primary for the logo and multiple overlay/gradient elements. GSAP is used to animate child elements on mount.

- Before / Après
  - Uses two images from WIDAMINE_ASSETS.beforeAfter with a range input controlling a clipPath for the foreground image. The current wiring shows Avant (left) and Après (right) correctly.

- Experts & Testimonials
  - Experts read EXPERTISES in Home.tsx but will fallback to WIDAMINE_CONTENT.experts array when expert.image is not present.
  - TestimonialsSection uses WIDAMINE_CONTENT.testimonials (now expanded to 4 items in the mapping file) and maps avatars from WIDAMINE_ASSETS.testimonials.

7) Development & how to run
---------------------------
From project root (frontend):

1. Install dependencies
   - npm install

2. Start dev server
   - npm run dev
   - Vite default: http://localhost:5173 (the environment previously used 5174 when another instance was active)

3. Build for production
   - npm run build

8) Current work / outstanding items
-----------------------------------
- Flaticon integration: copy flaticon.css + font files to public and import them.
- Populate WIDAMINE_CONTENT.experts with the real doctors (names + headshots) copied from the source site.
- Expand and optimize images: before committing, convert large originals to webp / responsive sizes and/or use git-lfs for large media.
- Decide on committing full-sized source images vs optimized derivatives.

9) Where this project lives on disk (the file you are reading)
-----------------------------------------------------------
- Root of workspace: /home/alan/widamine/
- Frontend code: /home/alan/widamine/frontend/
- Main page we edited: /home/alan/widamine/frontend/src/pages/Home.tsx
- Assets mapping: /home/alan/widamine/frontend/src/lib/widamineSource.ts
- Preloader component: /home/alan/widamine/frontend/src/components/Preloader.tsx
- Downloaded/harvested assets: /home/alan/widamine/frontend/public/widamine-source/

10) Quick pointers to change common things
----------------------------------------
- Update hero background: in Home.tsx the hero background div was removed intentionally. To re-add, modify the section around the comment "background image removed..." and use WIDAMINE_ASSETS.heroSlides[0] as background.
- Add icons: copy flaticon.css + fonts into public and import into src/main.css or index.css. Then ensure SERVICE.iconClass matches an existing class name from flaticon.css.
- Change testimonials: edit frontend/src/lib/widamineSource.ts WIDAMINE_CONTENT.testimonials.
- Add experts: place images into public/widamine-source/ and extend WIDAMINE_CONTENT.experts with { name, role, image, description }.

11) Suggested next commands
--------------------------
- Add flaticon files to public and import them; quick test: add a small flaticon.css containing one class and verify ServiceCard renders the <i> element.
- Run: cd frontend && npm run dev and open the site to verify visuals.

If you want, I can:
- integrate flaticon.css + fonts into the project,
- crawl/download the remaining doctor headshots and add them to WIDAMINE_CONTENT.experts,
- optimize images (webp/responsive) and prepare them for commit.

File path for this document:
- /home/alan/widamine/PROJECT_OVERVIEW.md

---
If you want this written elsewhere (frontend/README.md or frontend/docs/), tell me where and I'll move/create it.
