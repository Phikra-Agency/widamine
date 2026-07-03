import type React from 'react'

/* ── Widamine Design System ────────────────────────────────────── */
/* Based on square-moncey's design tokens, adapted to Widamine palette */

export const C = {
  bg: '#FBF7EF',
  primary: '#009FD6',
  secondary: '#1E1E1E',
  accent: '#6D0024',
  orange: '#F7A269',
  yellow: '#ffb500',
  green: '#62bca1',
  white: '#ffffff',
} as const

/* Typography tokens — mirrors square-moncey's fluid scale */
export const TYPE = {
  /* Headings use Chambora */
  headingFamily: "'Chambora', serif",
  /* Body uses Poppins Thin */
  bodyFamily: "'Poppins Thin', sans-serif",
  /* Fluid heading sizes */
  h1: 'clamp(1.76rem, 1.242rem + 2.59vw, 4.347rem)',
  h2: 'clamp(1.57rem, 1.228rem + 1.71vw, 3.283rem)',
  h3: 'clamp(1.4rem, 1.186rem + 1.07vw, 2.471rem)',
  h4: 'clamp(1.25rem, 1.132rem + 0.59vw, 1.837rem)',
  h5: 'clamp(1.12rem, 1.072rem + 0.24vw, 1.362rem)',
  /* Body text */
  bodyLarge: 'clamp(1.16rem, 1.112rem + 0.24vw, 1.402rem)',
  bodyMain: 'clamp(0.96rem, 0.946rem + 0.07vw, 1.031rem)',
  bodySmall: '0.875rem',
  /* Line heights */
  lineHeightHeading: '1.1em',
  lineHeightBody: '2.15em',
  /* Letter spacing */
  headingSpacing: '-0.03em',
} as const

/* Spacing tokens — mirrors square-moncey's spacing scale */
export const SPACING = {
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  sectionLarge: 'py-24 sm:py-32 lg:py-40',
  sectionMain: 'py-16 sm:py-20 lg:py-28',
  sectionSmall: 'py-10 sm:py-14 lg:py-16',
  gapMain: 'gap-6',
  gapLarge: 'gap-10',
  gapSmall: 'gap-3',
} as const

/* Border radius tokens */
export const RADIUS = {
  main: '1.25rem',
  small: '0.5rem',
  round: '100vw',
  card: '1.5rem',
} as const

/* ── Shared page helpers ────────────────────────────────────────── */

export const PAGE = {
  outerBg: 'bg-custom-white',
  section: SPACING.sectionLarge,
  container: SPACING.container,
  heading: (text: React.ReactNode) => (
    <h2
      className='text-center leading-tight'
      style={{
        fontFamily: TYPE.headingFamily,
        fontSize: TYPE.h2,
        letterSpacing: TYPE.headingSpacing,
        color: C.secondary,
      }}
    >
      {text}
    </h2>
  ),
  headingWithEm: (emText: string, rest: string, color?: string) => (
    <h2
      className='leading-tight'
      style={{
        fontFamily: TYPE.headingFamily,
        fontSize: TYPE.h2,
        letterSpacing: TYPE.headingSpacing,
        color: C.secondary,
      }}
    >
      <em style={{ color: color || C.primary, fontStyle: 'italic' }}>{emText}</em>
      {rest ? ` ${rest}` : ''}
    </h2>
  ),
  cardShell: {
    rounded: `rounded-[${RADIUS.card}]`,
    border: 'border border-black/5',
    bg: 'bg-white',
    shadow: { boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' } as React.CSSProperties,
  },
} as const
