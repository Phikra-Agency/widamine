import type { ReactNode } from 'react'
import { Confetti, GroundShadow, illustrationPalette as C, type IllustrationProps } from './shared'

function Frame({ className, children }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg viewBox='0 0 420 320' className={className} role='img' aria-hidden='true' fill='none'>
      <GroundShadow />
      <Confetti />
      {children}
    </svg>
  )
}

/** Person beside an empty clipboard. */
export function EmptyPatientsIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(248 88)'>
        <rect x='0' y='0' width='96' height='128' rx='12' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <rect x='14' y='18' width='68' height='8' rx='4' fill={C.mist} />
        <rect x='14' y='36' width='52' height='6' rx='3' fill={C.line} />
        <rect x='14' y='50' width='60' height='6' rx='3' fill={C.line} />
        <rect x='14' y='64' width='44' height='6' rx='3' fill={C.line} />
        <circle cx='48' cy='102' r='14' fill={C.mist} stroke={C.sky} strokeWidth='2' strokeDasharray='4 4' />
      </g>
      <g transform='translate(108 108)'>
        <circle cx='34' cy='22' r='22' fill={C.sky} />
        <path d='M10 118c4-34 20-52 48-52s44 18 48 52' fill={C.sea} />
        <path d='M34 52v18M22 74h24' stroke={C.deep} strokeWidth='4' strokeLinecap='round' />
      </g>
    </Frame>
  )
}

/** Two teammates — second figure faded. */
export function EmptyUsersIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(92 104)' opacity='0.45'>
        <circle cx='30' cy='24' r='20' fill={C.mist} />
        <path d='M6 112c4-30 18-46 42-46s38 16 42 46' fill={C.line} />
      </g>
      <g transform='translate(188 96)'>
        <circle cx='38' cy='26' r='24' fill={C.aqua} />
        <path d='M4 126c5-38 24-58 56-58s51 20 56 58' fill={C.sea} />
      </g>
      <g transform='translate(286 108)' opacity='0.45'>
        <circle cx='30' cy='24' r='20' fill={C.mist} />
        <path d='M6 112c4-30 18-46 42-46s38 16 42 46' fill={C.line} />
      </g>
    </Frame>
  )
}

/** Empty inbox tray with floating envelope. */
export function EmptyInboxIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(118 156)'>
        <path d='M0 24h184v72c0 8-6 14-14 14H14c-8 0-14-6-14-14V24z' fill={C.mist} stroke={C.sky} strokeWidth='2' />
        <path d='M0 24l92 52 92-52' stroke={C.sea} strokeWidth='3' strokeLinejoin='round' />
      </g>
      <g transform='translate(248 72)'>
        <rect x='0' y='18' width='88' height='58' rx='10' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <path d='M0 28l44 30 44-30' stroke={C.aqua} strokeWidth='3' strokeLinejoin='round' />
        <circle cx='72' cy='12' r='12' fill={C.sea} />
        <text x='72' y='16' textAnchor='middle' fontSize='12' fontWeight='700' fill={C.paper}>
          0
        </text>
      </g>
    </Frame>
  )
}

/** Wall calendar with blank days. */
export function EmptyCalendarIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(132 72)'>
        <rect x='0' y='0' width='156' height='168' rx='16' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <path d='M0 34h156v-18a16 16 0 0 0-16-16H16A16 16 0 0 0 0 16v18z' fill={C.sea} />
        <circle cx='38' cy='18' r='6' fill={C.paper} />
        <circle cx='118' cy='18' r='6' fill={C.paper} />
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          return (
            <rect
              key={i}
              x={18 + col * 32}
              y={52 + row * 28}
              width='22'
              height='18'
              rx='4'
              fill={row === 0 && col === 1 ? C.aqua : C.mist}
              opacity={row === 0 && col === 1 ? 1 : 0.85}
            />
          )
        })}
      </g>
      <g transform='translate(96 228)'>
        <path d='M0 0h28v36H0z' fill={C.deep} />
        <path d='M14 0v36' stroke={C.paper} strokeWidth='2' />
      </g>
    </Frame>
  )
}

/** Open empty folder. */
export function EmptyFolderIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(118 108)'>
        <path d='M0 36h72l18-20h94v108c0 10-8 18-18 18H18c-10 0-18-8-18-18V36z' fill={C.mist} stroke={C.sky} strokeWidth='2' />
        <path d='M18 72h148v52c0 8-6 14-14 14H32c-8 0-14-6-14-14V72z' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <circle cx='92' cy='104' r='18' fill={C.mist} stroke={C.sky} strokeWidth='2' strokeDasharray='5 4' />
      </g>
    </Frame>
  )
}

/** Care kit / service box. */
export function EmptyServicesIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(144 92)'>
        <rect x='0' y='36' width='132' height='96' rx='16' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <path d='M0 52h132' stroke={C.line} strokeWidth='2' />
        <rect x='48' y='0' width='36' height='44' rx='8' fill={C.mist} stroke={C.sky} strokeWidth='2' />
        <path d='M66 78v28M50 92h32' stroke={C.sea} strokeWidth='8' strokeLinecap='round' />
      </g>
      <g transform='translate(96 228)'>
        <path d='M14 0v36' stroke={C.deep} strokeWidth='4' strokeLinecap='round' />
        <path d='M0 36h28l-3 12H3z' fill={C.deep} />
      </g>
    </Frame>
  )
}

/** Empty treatment room doorway. */
export function EmptyRoomIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(108 68)'>
        <rect x='0' y='0' width='204' height='188' rx='18' fill={C.paper} stroke={C.line} strokeWidth='2' />
        <rect x='58' y='44' width='88' height='144' rx='10' fill={C.mist} stroke={C.sky} strokeWidth='2' />
        <circle cx='132' cy='118' r='6' fill={C.sea} />
        <rect x='24' y='150' width='44' height='10' rx='5' fill={C.line} />
        <rect x='136' y='150' width='44' height='10' rx='5' fill={C.line} />
      </g>
    </Frame>
  )
}

/** Floating motif tags. */
export function EmptyMotifIllustration({ className }: IllustrationProps) {
  return (
    <Frame className={className}>
      <g transform='translate(108 118)' opacity='0.55'>
        <rect x='0' y='0' width='92' height='34' rx='17' fill={C.mist} stroke={C.line} strokeWidth='2' />
      </g>
      <g transform='translate(188 88)'>
        <rect x='0' y='0' width='108' height='38' rx='19' fill={C.aqua} />
        <rect x='18' y='12' width='72' height='8' rx='4' fill={C.paper} opacity='0.8' />
      </g>
      <g transform='translate(148 168)' opacity='0.7'>
        <rect x='0' y='0' width='124' height='38' rx='19' fill={C.sky} />
        <rect x='20' y='12' width='84' height='8' rx='4' fill={C.paper} opacity='0.85' />
      </g>
      <g transform='translate(248 148)' opacity='0.45'>
        <rect x='0' y='0' width='72' height='30' rx='15' fill={C.mist} stroke={C.line} strokeWidth='2' />
      </g>
    </Frame>
  )
}
