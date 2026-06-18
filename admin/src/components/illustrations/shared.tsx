import type { ReactNode } from 'react'

export const illustrationPalette = {
  mist: '#d7f9ff',
  sky: '#9ee7fa',
  aqua: '#3dcdf5',
  sea: '#009fd6',
  deep: '#087391',
  ink: '#043f50',
  paper: '#fafcfb',
  line: '#d5dedc',
  gray: '#b8c5c2',
} as const

export type IllustrationProps = { className?: string }

const C = illustrationPalette

export function GroundShadow() {
  return <ellipse cx='210' cy='292' rx='150' ry='13' fill={C.ink} opacity='0.06' />
}

export function Confetti() {
  return (
    <g opacity='0.9'>
      <circle cx='70' cy='70' r='5' fill={C.sky} />
      <circle cx='350' cy='90' r='4' fill={C.aqua} />
      <circle cx='330' cy='210' r='6' fill={C.mist} />
      <path d='M60 200h14M67 193v14' stroke={C.aqua} strokeWidth='3' strokeLinecap='round' />
      <path d='M360 150h12M366 144v12' stroke={C.sky} strokeWidth='3' strokeLinecap='round' />
    </g>
  )
}

export function IllustrationFrame({
  className,
  children,
}: IllustrationProps & { children: ReactNode }) {
  return (
    <svg viewBox='0 0 420 320' className={className} role='img' aria-hidden='true' fill='none'>
      <GroundShadow />
      <Confetti />
      {children}
    </svg>
  )
}
