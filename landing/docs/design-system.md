# Widamine Landing Design System

**Version:** 1.0  
**Last Updated:** July 27, 2026  
**Location:** `landing/src/lib/theme.tsx`

---

## Overview

The Widamine design system provides a consistent visual language across all landing pages. It's built on design tokens that ensure brand consistency, accessibility, and maintainability.

**Key Principles:**
- **Mobile-First**: Design for 320px, scale up
- **Theme-Driven**: Use tokens exclusively, no hard-coded values
- **Accessible**: WCAG AA contrast minimum
- **Performant**: Optimized animations and lazy loading
- **Consistent**: Predictable spacing, typography, and patterns

---

## Theme Tokens

### Colors (`C`)

Located in: `landing/src/lib/theme.tsx`

```typescript
export const C = {
  bg: '#FBF7EF',          // Warm off-white background
  primary: '#009FD6',     // Teal blue (CTAs, links, accents)
  secondary: '#1a3646',   // Deep navy (headings, body text)
  accent: '#6D0024',      // Burgundy (rare accents)
  orange: '#F7A269',      // Warm orange (testimonials, highlights)
  yellow: '#ffb500',      // Bright yellow (alerts, badges)
  green: '#62bca1',       // Mint green (success states)
  white: '#ffffff',       // Pure white (cards, overlays)
}
```

**Usage:**
```tsx
// ✅ CORRECT
style={{ color: C.primary }}
style={{ background: C.bg }}

// ❌ WRONG
style={{ color: '#009FD6' }}
style={{ background: '#FBF7EF' }}
```

**Color Opacity:**
For semi-transparent colors, use template literals:
```tsx
style={{ color: `${C.secondary}dd` }}  // 87% opacity
style={{ color: `${C.secondary}cc` }}  // 80% opacity
style={{ color: `${C.secondary}aa` }}  // 67% opacity
```

**Accessibility:**
- `C.secondary` on `C.bg`: 9.2:1 ✅ (AAA)
- `C.primary` on `C.white`: 4.8:1 ✅ (AA)
- `${C.secondary}dd` on `C.bg`: ~7.5:1 ✅ (AA)

---

### Typography (`TYPE`)

#### Font Families

```typescript
headingFamily: "'Chambora', serif"      // Display font for headings
bodyFamily: "'Poppins Light', sans-serif" // Body text
```

**Loading:**
Fonts are loaded via `@font-face` in `index.css`. Include fallbacks:
```css
font-family: 'Chambora', Georgia, 'Times New Roman', serif;
font-family: 'Poppins Light', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Fluid Type Scale

Uses `clamp()` for responsive scaling without media queries:

```typescript
h1: 'clamp(1.76rem, 1.242rem + 2.59vw, 4.347rem)'  // 28px → 69px
h2: 'clamp(1.57rem, 1.228rem + 1.71vw, 3.283rem)'  // 25px → 53px
h3: 'clamp(1.4rem, 1.186rem + 1.07vw, 2.471rem)'   // 22px → 40px
h4: 'clamp(1.25rem, 1.132rem + 0.59vw, 1.837rem)'  // 20px → 29px
h5: 'clamp(1.12rem, 1.072rem + 0.24vw, 1.362rem)'  // 18px → 22px
```

**Custom Clamps for Landing:**
For hero sections, use tighter ranges:
```tsx
// Hero headings (mobile-optimized)
text-[clamp(2rem,5vw,4.5rem)]      // 32px → 72px
text-[clamp(2.25rem,6vw,5.5rem)]   // 36px → 88px

// Section headings
text-[clamp(2rem,4vw,3.5rem)]      // 32px → 56px
```

#### Body Text

```typescript
bodyLarge: 'clamp(1.16rem, 1.112rem + 0.24vw, 1.402rem)'  // 18-22px
bodyMain: 'clamp(0.96rem, 0.946rem + 0.07vw, 1.031rem)'   // 15-16px
bodySmall: '0.875rem'                                       // 14px
```

**In Practice:**
```tsx
// ✅ CORRECT - Use theme tokens
<h1 style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h2 }}>

// ✅ CORRECT - Use Tailwind with responsive classes
<p className='text-sm sm:text-base lg:text-lg'>

// ❌ WRONG - Hard-coded font
<h1 style={{ fontFamily: "'Chambora', serif" }}>

// ❌ WRONG - Hard-coded size
<h1 style={{ fontSize: '3rem' }}>
```

#### Line Heights & Spacing

```typescript
lineHeightHeading: '1.1em'        // Tight for display text
lineHeightBody: '2.15em'          // Generous for readability
headingSpacing: '-0.03em'         // Slight negative tracking
```

**Usage:**
```tsx
<h1 style={{ 
  lineHeight: TYPE.lineHeightHeading,
  letterSpacing: TYPE.headingSpacing 
}}>
```

---

### Spacing (`SPACING`)

#### Container

```typescript
container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
```

**Max Width:** 1280px (7xl)  
**Padding:** 16px → 24px → 32px (mobile → tablet → desktop)

**Usage:**
```tsx
<div className={SPACING.container}>
  {/* Content automatically centered with responsive padding */}
</div>
```

#### Section Padding

```typescript
sectionLarge: 'py-24 sm:py-32 lg:py-40'  // Hero, major sections
sectionMain: 'py-16 sm:py-20 lg:py-28'   // Standard sections
sectionSmall: 'py-10 sm:py-14 lg:py-16'  // Compact sections
```

**Vertical Scale:**
- Large: 96px → 128px → 160px
- Main: 64px → 80px → 112px
- Small: 40px → 56px → 64px

**Custom Scales for Landing:**
For more granular control, use progressive classes:
```tsx
// Hero sections
className='pt-24 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 lg:pb-32'

// Content sections
className='py-16 sm:py-20 lg:py-28'

// CTA sections
className='py-20 sm:py-28 lg:py-32'
```

#### Gaps

```typescript
gapLarge: 'gap-10'  // 40px - Between major sections
gapMain: 'gap-6'    // 24px - Between related items
gapSmall: 'gap-3'   // 12px - Between tight items
```

**Progressive Gaps:**
```tsx
// ✅ CORRECT - Progressive scaling
className='gap-6 md:gap-8 lg:gap-12'

// ✅ CORRECT - Separate x and y
className='gap-x-8 gap-y-12'

// ❌ WRONG - Fixed on all screens
className='gap-12'
```

---

### Border Radius (`RADIUS`)

```typescript
main: '1.25rem'    // 20px - Standard rounded corners
small: '0.5rem'    // 8px - Subtle rounding
round: '100vw'     // Full pill shape
card: '1.5rem'     // 24px - Card components
```

**Usage:**
```tsx
// ✅ CORRECT - Use Tailwind equivalents
className='rounded-2xl'        // 16px
className='rounded-[1.25rem]'  // 20px (RADIUS.main)
className='rounded-full'       // Pills/buttons

// Cards should use 24px
className='rounded-[1.5rem]'   // RADIUS.card
```

---

## Responsive Breakpoints

Widamine uses **mobile-first** approach with Tailwind breakpoints:

| Prefix | Min Width | Target Devices |
|--------|-----------|----------------|
| (none) | 0px | Mobile phones (default) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops, small desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large screens |

**In Practice:**
```tsx
// ✅ CORRECT - Mobile-first progression
<div className='px-4 sm:px-6 lg:px-8'>
<h1 className='text-2xl sm:text-3xl lg:text-4xl'>
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>

// ❌ WRONG - Desktop-first (harder to maintain)
<div className='px-8 md:px-6 sm:px-4'>
```

**Critical Widths:**
- **320px**: iPhone SE (minimum support)
- **375px**: iPhone 12/13 (common mobile)
- **768px**: iPad portrait (tablet start)
- **1024px**: iPad landscape (desktop start)
- **1440px**: Common desktop (design reference)

---

## Component Patterns

### Buttons

#### Primary CTA

```tsx
<button
  className='inline-flex min-h-12 sm:min-h-14 items-center justify-center rounded-full px-8 sm:px-10 text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1 shadow-[0_10px_24px_rgba(0,159,214,0.25)] hover:shadow-[0_16px_32px_rgba(0,159,214,0.35)]'
  style={{ background: C.primary, color: C.white, fontFamily: TYPE.bodyFamily }}
>
  Button Text
</button>
```

**Key Features:**
- Min height: 48px mobile, 56px desktop (WCAG touch target)
- Full rounded corners (`rounded-full`)
- Uppercase with wide tracking
- Lift on hover (`-translate-y-1`)
- Animated shadow depth

#### Secondary Button

```tsx
<button
  className='inline-flex min-h-12 sm:min-h-14 items-center justify-center rounded-full px-8 sm:px-10 text-sm font-semibold tracking-wide border-2 transition-all hover:bg-secondary hover:text-white'
  style={{ borderColor: C.secondary, color: C.secondary }}
>
  Button Text
</button>
```

#### Text Link

```tsx
<a
  href='/path'
  className='inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest transition hover:opacity-60'
  style={{ color: C.secondary }}
>
  Link Text →
</a>
```

---

### Cards

#### Service Card

```tsx
<div className='overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-black/5 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] transition-all hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)]'>
  <div className='p-6 sm:p-8'>
    {/* Card content */}
  </div>
</div>
```

#### Content Card

```tsx
<div className='rounded-xl sm:rounded-2xl border p-6 sm:p-8' style={{ borderColor: 'rgba(26,54,70,0.08)', background: C.white }}>
  {/* Content */}
</div>
```

---

### Sections

#### Hero Section

```tsx
<section className='pt-24 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 lg:pb-32'>
  <div className={SPACING.container}>
    <h1 className='text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] mb-6 sm:mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
      Hero Title
    </h1>
    <p className='text-base sm:text-lg lg:text-xl leading-relaxed' style={{ color: `${C.secondary}dd`, fontWeight: 300 }}>
      Hero description
    </p>
  </div>
</section>
```

#### Content Section

```tsx
<section className='py-16 sm:py-20 lg:py-28'>
  <div className={SPACING.container}>
    <div className='max-w-6xl mx-auto'>
      {/* Section content */}
    </div>
  </div>
</section>
```

#### CTA Section

```tsx
<section className='py-20 sm:py-28 lg:py-32'>
  <div className={SPACING.container}>
    <div className='max-w-4xl mx-auto text-center'>
      <h2 className='text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-6 sm:mb-8' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
        Call to Action
      </h2>
      <button>{/* CTA button */}</button>
    </div>
  </div>
</section>
```

---

### Animations (Framer Motion)

#### Fade In

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

#### Stagger Children

```tsx
<motion.div>
  {items.map((item, idx) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
    >
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

**Best Practices:**
- Duration: 0.5-0.6s for most animations
- Stagger delay: 0.05s per item (max 10 items)
- Use `viewport={{ once: true }}` to prevent re-triggering
- Add margin to trigger slightly before visible

---

## Accessibility Guidelines

### Color Contrast

**Minimum Requirements (WCAG AA):**
- Body text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Our Standards:**
- Primary text (`C.secondary` on `C.bg`): 9.2:1 ✅
- Body text with opacity (`${C.secondary}dd`): ~7.5:1 ✅
- Links (`C.primary` on `C.white`): 4.8:1 ✅

**Avoid:**
- `${C.secondary}99` (60% opacity): Only ~3.8:1 ❌

### Touch Targets

**Minimum:** 44×44px (WCAG 2.1)  
**Our Standard:** 48×56px (mobile → desktop)

```tsx
// ✅ CORRECT
<button className='min-h-12 sm:min-h-14'>  // 48px → 56px

// ❌ WRONG
<button className='h-8'>  // Only 32px
```

### Focus States

Always include visible focus indicators:

```tsx
// ✅ CORRECT
<button className='focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>

// ❌ WRONG
<button className='focus:outline-none'>  // No alternative indicator
```

### Semantic HTML

```tsx
// ✅ CORRECT - Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// ❌ WRONG - Skipping levels
<h1>Page Title</h1>
<h3>Section Title</h3>
```

---

## Best Practices

### 1. Always Use Theme Tokens

```tsx
// ✅ CORRECT
style={{ color: C.primary, fontFamily: TYPE.bodyFamily }}

// ❌ WRONG
style={{ color: '#009FD6', fontFamily: "'Poppins', sans-serif" }}
```

### 2. Mobile-First Responsive

```tsx
// ✅ CORRECT
<div className='px-4 sm:px-6 lg:px-8'>
<h1 className='text-2xl sm:text-3xl lg:text-4xl'>

// ❌ WRONG
<div className='px-8'>  // Fixed on all screens
```

### 3. Progressive Spacing

```tsx
// ✅ CORRECT - Scales with viewport
className='gap-6 md:gap-8 lg:gap-12'
className='py-16 sm:py-20 lg:py-28'

// ❌ WRONG - Same on all screens
className='gap-12'
className='py-28'
```

### 4. Consistent Rounding

```tsx
// ✅ CORRECT
className='rounded-2xl'        // Cards (16px)
className='rounded-full'       // Buttons/pills
className='rounded-[1.5rem]'   // Large cards (24px)

// ❌ WRONG - Random values
className='rounded-[17px]'
className='rounded-[2.3rem]'
```

### 5. Semantic Color Usage

```tsx
// ✅ CORRECT
C.primary    // CTAs, links, interactive elements
C.secondary  // Headings, body text, primary content
C.bg         // Page background
C.white      // Cards, overlays, contrast areas

// ❌ WRONG - Inconsistent usage
C.primary    // For body text
C.secondary  // For buttons
```

---

## Performance Optimization

### Images

```tsx
// ✅ CORRECT - Lazy loading + responsive
<img 
  src='/image.jpg' 
  alt='Description'
  loading='lazy'
  className='w-full h-auto'
/>

// Better - Use srcset for responsive images
<img 
  src='/image-800.jpg' 
  srcSet='/image-400.jpg 400w, /image-800.jpg 800w, /image-1200.jpg 1200w'
  sizes='(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px'
  alt='Description'
  loading='lazy'
/>
```

### Fonts

```css
/* ✅ CORRECT - font-display: swap prevents invisible text */
@font-face {
  font-family: 'Chambora';
  src: url('/fonts/chambora.woff2') format('woff2');
  font-display: swap;
}
```

### Animations

```tsx
// ✅ CORRECT - Respect user preferences
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
  // In CSS, add: @media (prefers-reduced-motion: reduce)
>
```

---

## Testing Checklist

### Visual Regression

- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone 12/13)
- [ ] Test on 768px width (iPad portrait)
- [ ] Test on 1024px width (iPad landscape)
- [ ] Test on 1440px width (desktop)
- [ ] Verify no horizontal scroll on any size
- [ ] Check all images load and scale correctly

### Accessibility

- [ ] Run axe DevTools (0 violations target)
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test screen reader (VoiceOver/NVDA)
- [ ] Verify color contrast (WebAIM tool)
- [ ] Check focus indicators visible
- [ ] Verify heading hierarchy (h1 → h2 → h3)

### Performance

- [ ] Lighthouse score > 90 (mobile)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Test on slow 3G connection
- [ ] Verify fonts load with fallback

---

## Resources

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Modern Font Stacks](https://modernfontstacks.com/)

**Extensions:**
- axe DevTools (Chrome/Firefox)
- WAVE (Chrome/Firefox)
- Lighthouse (Chrome DevTools)

---

**Maintained by:** Widamine Development Team  
**Questions?** Refer to `landing/src/lib/theme.tsx` or contact the team.
