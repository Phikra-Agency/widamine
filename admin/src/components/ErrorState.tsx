import { Button } from '@/components/ui/button'
import { Confetti, GroundShadow, illustrationPalette as C, type IllustrationProps } from '@/components/illustrations/shared'
import type { ReactNode } from 'react'

/** Unexpected crash — tilted browser window with a cracked screen + warning. */
export function CrashIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox='0 0 420 320' className={className} role='img' aria-hidden='true' fill='none'>
      <GroundShadow />
      <Confetti />
      <g transform='rotate(-5 210 160)'>
        <rect x='95' y='72' width='230' height='176' rx='18' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <path d='M95 90a18 18 0 0 1 18-18h194a18 18 0 0 1 18 18v18H95z' fill={C.mist} />
        <circle cx='117' cy='90' r='5' fill={C.sea} />
        <circle cx='134' cy='90' r='5' fill={C.aqua} />
        <circle cx='151' cy='90' r='5' fill={C.sky} />
        <path
          d='M150 108l34 44-26 20 40 38m72-142l-30 56 28 18-22 30'
          stroke={C.gray}
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          opacity='0.7'
        />
      </g>
      <g transform='rotate(-5 210 160)'>
        <circle cx='210' cy='168' r='38' fill={C.sea} />
        <circle cx='210' cy='168' r='38' fill={C.ink} opacity='0.06' />
        <rect x='205' y='148' width='10' height='26' rx='5' fill={C.paper} />
        <circle cx='210' cy='186' r='5.5' fill={C.paper} />
      </g>
      <g transform='translate(322 196)'>
        <path d='M14 56V30' stroke={C.deep} strokeWidth='3' strokeLinecap='round' />
        <path d='M14 36c-12-2-18-12-16-22 12 2 18 12 16 22z' fill={C.aqua} />
        <path d='M14 30c8-4 11-14 7-22-8 4-11 14-7 22z' fill={C.sea} />
        <path d='M2 56h24l-3 12H5z' fill={C.deep} />
      </g>
    </svg>
  )
}

/** 404 — big number with a magnifier searching an empty map. */
export function NotFoundIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox='0 0 420 320' className={className} role='img' aria-hidden='true' fill='none'>
      <GroundShadow />
      <Confetti />
      <g fill={C.mist}>
        <path d='M70 96a16 16 0 0 1 31-5 14 14 0 0 1 18 13H70z' />
        <path d='M300 70a14 14 0 0 1 27-4 12 12 0 0 1 15 11h-42z' />
      </g>
      <g fontFamily='inherit'>
        <text x='210' y='196' textAnchor='middle' fontSize='110' fontWeight='700' fill={C.mist}>
          404
        </text>
        <text x='210' y='192' textAnchor='middle' fontSize='110' fontWeight='700' fill={C.sea} opacity='0.92'>
          404
        </text>
      </g>
      <g transform='translate(120 60)'>
        <path d='M16 0a16 16 0 0 1 16 16c0 11-16 28-16 28S0 27 0 16A16 16 0 0 1 16 0z' fill={C.aqua} />
        <circle cx='16' cy='16' r='6' fill={C.paper} />
      </g>
      <g transform='translate(252 168)'>
        <circle cx='30' cy='30' r='30' fill={C.sky} opacity='0.5' />
        <circle cx='30' cy='30' r='30' fill='none' stroke={C.sea} strokeWidth='6' />
        <path d='M52 52l22 22' stroke={C.deep} strokeWidth='8' strokeLinecap='round' />
      </g>
    </svg>
  )
}

/** Offline / server unreachable — cloud with a broken link + signal waves. */
export function OfflineIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox='0 0 420 320' className={className} role='img' aria-hidden='true' fill='none'>
      <GroundShadow />
      <Confetti />
      <g stroke={C.gray} strokeWidth='4' strokeLinecap='round' fill='none' opacity='0.55'>
        <path d='M120 150a64 64 0 0 1 180 0' />
        <path d='M150 162a40 40 0 0 1 120 0' />
      </g>
      <g>
        <path
          d='M150 214a40 40 0 0 1 6-79 56 56 0 0 1 108 14 34 34 0 0 1-6 67H156a40 40 0 0 1-6-2z'
          fill={C.mist}
          stroke={C.sky}
          strokeWidth='2'
        />
      </g>
      <g transform='translate(180 168)'>
        <path d='M6 30l16-16a16 16 0 0 1 4 22' stroke={C.sea} strokeWidth='9' strokeLinecap='round' />
        <path d='M54 30L38 46a16 16 0 0 1-4-22' stroke={C.deep} strokeWidth='9' strokeLinecap='round' />
        <path d='M30 6v8M30 50v8M14 30H6M54 30h8' stroke={C.aqua} strokeWidth='4' strokeLinecap='round' />
      </g>
    </svg>
  )
}

const ILLUSTRATIONS = {
  crash: CrashIllustration,
  notFound: NotFoundIllustration,
  offline: OfflineIllustration,
} as const

export type ErrorStateVariant = keyof typeof ILLUSTRATIONS

interface ErrorStateProps {
  variant?: ErrorStateVariant
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function ErrorState({ variant = 'crash', title, description, action, className }: ErrorStateProps) {
  const Illustration = ILLUSTRATIONS[variant]

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center ${className ?? ''}`}
    >
      <Illustration className='h-auto w-full max-w-xs' />
      <div className='flex flex-col items-center gap-2'>
        <p className='text-lg font-medium text-secondary'>{title}</p>
        {description && <p className='max-w-sm text-sm text-muted-foreground'>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default ErrorState
