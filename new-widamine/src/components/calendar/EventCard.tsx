import { getEventColor, getFamilyForMotif } from '@/lib/motifFamilies'

export interface EventCardSchedule {
  id: string
  datetime: string
  session: {
    id: number
    session: number
    service: { name: string }
  }
  appointment?: {
    motif?: {
      id: string
      name: string
      color?: string
      bookingType?: string
    }
    practitioner?: { name: string }
    resource?: { name: string }
  }
}

interface EventCardProps {
  schedule: EventCardSchedule
  formatTime: (value?: string) => string
  isUnread?: boolean
  variant?: 'grid' | 'list'
  onClick: () => void
}

export default function EventCard({
  schedule,
  formatTime,
  isUnread,
  variant = 'grid',
  onClick,
}: EventCardProps) {
  const motif = schedule.appointment?.motif
  const family = getFamilyForMotif(motif)
  const accentColor = getEventColor(motif)
  const motifName = motif?.name || schedule.session.service.name
  const sublabel = `${schedule.session.service.name} · S${schedule.session.session}`

  if (variant === 'list') {
    return (
      <button
        type='button'
        onClick={onClick}
        className='flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition hover:border-primary/20'
      >
        <div
          className='shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold text-white'
          style={{ backgroundColor: accentColor }}
        >
          {formatTime(schedule.datetime)}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[12px] font-medium text-secondary'>{motifName}</p>
          <p className='text-[10px] text-secondary/45'>{sublabel}</p>
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          {isUnread && (
            <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.hue }} />
          )}
          <div
            className='h-5 w-1 rounded-full'
            style={{ backgroundColor: family.hue }}
            title={family.label}
          />
        </div>
      </button>
    )
  }

  return (
    <div className='group/sched relative'>
      <button
        type='button'
        onClick={onClick}
        className='w-full shrink-0 rounded-xl border border-border bg-card text-left transition hover:border-primary/20'
      >
        <div className='flex items-center gap-2 px-2.5 py-2'>
          <div
            className='flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-[10px] font-semibold text-white'
            style={{ backgroundColor: accentColor }}
          >
            {formatTime(schedule.datetime)}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[11px] font-medium leading-4 text-secondary'>{motifName}</p>
            <p className='mt-0.5 text-[10px] text-secondary/45'>{sublabel}</p>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            {isUnread && (
              <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.hue }} />
            )}
            <div
              className='h-5 w-1 rounded-full'
              style={{ backgroundColor: family.hue }}
              title={family.label}
            />
          </div>
        </div>
      </button>

      <div className='pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover/sched:opacity-100'>
        <div
          className='whitespace-nowrap rounded-lg px-3 py-2 text-[11px] leading-snug text-white shadow-lg'
          style={{ backgroundColor: accentColor }}
        >
          <p className='font-semibold'>{motifName}</p>
          <p className='mt-0.5 text-white/75'>
            {formatTime(schedule.datetime)} · {schedule.session.service.name}
          </p>
          {schedule.appointment?.practitioner && (
            <p className='mt-0.5 text-white/60'>{schedule.appointment.practitioner.name}</p>
          )}
          {schedule.appointment?.resource && (
            <p className='mt-0.5 text-white/60'>{schedule.appointment.resource.name}</p>
          )}
        </div>
        <div className='mx-auto -mt-1 h-2 w-2 rotate-45' style={{ backgroundColor: accentColor }} />
      </div>
    </div>
  )
}

export function CalendarEmptyState({ message }: { message: string }) {
  return (
    <div className='flex h-full min-h-[12rem] flex-col items-center justify-center px-6 text-center'>
      <p className='text-[11px] text-secondary/45'>{message}</p>
    </div>
  )
}
