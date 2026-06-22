import { type MouseEvent } from 'react'
import { getEventColor, getFamilyForMotif } from '@/lib/motifFamilies'

export interface EventCardSchedule {
  id: string
  datetime: string
  session: {
    id: number
    session: number
    duration: number
    motif: { id: string; name: string }
  }
  appointment?: {
    motif?: {
      id: string
      name: string
      color?: string
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
  expandable?: boolean
  onClick: (e: MouseEvent) => void
}

export default function EventCard({
  schedule,
  formatTime,
  isUnread,
  variant = 'grid',
  expandable = true,
  onClick,
}: EventCardProps) {
  const motif = schedule.appointment?.motif
  const family = getFamilyForMotif(motif)
  const accentColor = getEventColor(motif)
  const motifName = motif?.name || 'Session'
  const sublabel = `${motif?.name || 'Session'} · S${schedule.session.session}`

  if (variant === 'list') {
    return (
      <button
        type='button'
        onClick={onClick}
        className='flex w-full cursor-pointer items-center gap-3 rounded-surface border border-border bg-card px-3 py-2.5 text-left transition hover:border-primary/20'
      >
        <div
          className='shrink-0 rounded-element px-2 py-1 text-[10px] font-semibold text-white'
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
            <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.color }} />
          )}
          <div
            className='h-5 w-1 rounded-full'
            style={{ backgroundColor: family.color }}
            title={family.label}
          />
        </div>
      </button>
    )
  }

  const practitionerName = schedule.appointment?.practitioner?.name
  const resourceName = schedule.appointment?.resource?.name
  const hasDetails = practitionerName || resourceName

  return (
    <div data-event-card className='group/sched relative'>
      <button
        type='button'
        onClick={onClick}
        className='w-full cursor-pointer overflow-hidden rounded-element text-left transition-all duration-100 ease-out'
        style={{ backgroundColor: `${accentColor}14` }}
      >
        <div className='flex items-center gap-2 px-2 py-1.5'>
          <span className='shrink-0 text-[10px] font-semibold tabular-nums' style={{ color: accentColor }}>
            {formatTime(schedule.datetime)}
          </span>
          <p className='min-w-0 flex-1 truncate text-[11px] font-medium text-foreground'>{motifName}</p>
          {isUnread && (
            <div className='h-1.5 w-1.5 shrink-0 rounded-full' style={{ backgroundColor: family.color }} />
          )}
        </div>

        {expandable && hasDetails ? (
          <div className='grid transition-all duration-150 ease-out grid-rows-[0fr] group-hover/sched:grid-rows-[1fr]'>
            <div className='overflow-hidden'>
              <div className='border-t px-2 py-1.5 text-[11px] leading-snug' style={{ borderColor: `${accentColor}20` }}>
                <p className='text-secondary'>{sublabel}</p>
                {practitionerName && (
                  <p className='text-secondary/80'>{practitionerName}</p>
                )}
                {resourceName && (
                  <p className='text-secondary/80'>{resourceName}</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </button>
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
