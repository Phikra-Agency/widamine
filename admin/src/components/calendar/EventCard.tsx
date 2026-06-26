import { type MouseEvent, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    patient?: { firstName: string; lastName: string }
    status?: string
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}

function getTint(color: string, opacity: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

function getTextColor(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return '#1f2937'
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#1f2937' : '#ffffff'
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
    const bgColor = getTint(accentColor, 0.12)
    const textColor = '#1f2937'

    return (
      <button
        type='button'
        onClick={onClick}
        className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-px'
        style={{ backgroundColor: bgColor }}
      >
        <div
          className='shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold'
          style={{ backgroundColor: accentColor, color: getTextColor(accentColor) }}
        >
          {formatTime(schedule.datetime)}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[12px] font-semibold' style={{ color: textColor }}>{motifName}</p>
          <p className='text-[10px]' style={{ color: getTint(accentColor, 0.7) }}>{sublabel}</p>
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          {isUnread && (
            <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.color }} />
          )}
        </div>
      </button>
    )
  }

  const practitionerName = schedule.appointment?.practitioner?.name
  const resourceName = schedule.appointment?.resource?.name
  const patientName = schedule.appointment?.patient
    ? `${schedule.appointment.patient.firstName} ${schedule.appointment.patient.lastName}`
    : null
  const status = schedule.appointment?.status

  return (
    <EventCardWithHover
      schedule={schedule}
      formatTime={formatTime}
      isUnread={isUnread}
      expandable={expandable}
      onClick={onClick}
      motifName={motifName}
      sublabel={sublabel}
      accentColor={accentColor}
      family={family}
      practitionerName={practitionerName}
      resourceName={resourceName}
      patientName={patientName}
      status={status}
    />
  )
}

function EventCardWithHover({
  schedule,
  formatTime,
  isUnread,
  expandable,
  onClick,
  motifName,
  sublabel,
  accentColor,
  family,
  practitionerName,
  resourceName,
  patientName,
  status,
}: {
  schedule: EventCardSchedule
  formatTime: (value?: string) => string
  isUnread?: boolean
  expandable: boolean
  onClick: (e: MouseEvent) => void
  motifName: string
  sublabel: string
  accentColor: string
  family: { color: string; label: string }
  practitionerName?: string
  resourceName?: string
  patientName?: string | null
  status?: string
}) {
  const [showDetail, setShowDetail] = useState(false)
  const [popupRect, setPopupRect] = useState<{ top: number; left: number; height: number; flipAbove: boolean } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bgColor = getTint(accentColor, 0.15)
  const hoverBg = getTint(accentColor, 0.22)
  const textColor = '#1f2937'

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const POPUP_HEIGHT = 220
        const POPUP_WIDTH = 320
        const GAP = 8
        const spaceBelow = window.innerHeight - rect.bottom
        const flipAbove = spaceBelow < POPUP_HEIGHT + GAP
        let left = rect.left
        if (left + POPUP_WIDTH > window.innerWidth - GAP) {
          left = window.innerWidth - POPUP_WIDTH - GAP
        }
        if (left < GAP) left = GAP
        setPopupRect({ top: rect.top, left, height: rect.height, flipAbove })
      }
      setShowDetail(true)
    }, 300)
  }

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setShowDetail(false)
      setPopupRect(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      data-event-card
      className='group/sched relative h-full'
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type='button'
        onClick={onClick}
        className='flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg text-left shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px'
        style={{
          backgroundColor: bgColor,
        }}
      >
        <div className='flex min-h-0 flex-1 items-start gap-1.5 px-2 py-1.5'>
          <p className='min-w-0 flex-1 truncate text-[11px] font-semibold leading-tight' style={{ color: textColor }}>{motifName}</p>
          {isUnread && (
            <span className='absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.color }} />
          )}
        </div>
      </button>

      {/* Hover detail card — portaled above everything */}
      {showDetail && popupRect && createPortal(
        <div
          className='fixed z-[999] w-80 pointer-events-none'
          style={{
            top: popupRect.flipAbove ? popupRect.top - 8 : popupRect.top + popupRect.height + 8,
            left: popupRect.left,
            ...(popupRect.flipAbove ? { transform: 'translateY(-100%)' } : {}),
          }}
        >
          <div
            className='rounded-xl border border-gray-200 bg-white p-3 shadow-lg'
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <p className='text-[13px] font-semibold text-gray-900'>{motifName}</p>
                <p className='mt-0.5 text-[11px] text-gray-500'>{sublabel}</p>
              </div>
              <span
                className='shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium'
                style={{ backgroundColor: accentColor, color: getTextColor(accentColor) }}
              >
                {formatTime(schedule.datetime)}
              </span>
            </div>

            <div className='mt-2 flex flex-col gap-1 text-[11px] text-gray-600'>
              {patientName && (
                <div className='flex items-center gap-1.5'>
                  <svg className='h-3 w-3 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                  <span>{patientName}</span>
                </div>
              )}
              {practitionerName && (
                <div className='flex items-center gap-1.5'>
                  <svg className='h-3 w-3 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                  <span>{practitionerName}</span>
                </div>
              )}
              {resourceName && !practitionerName && (
                <div className='flex items-center gap-1.5'>
                  <svg className='h-3 w-3 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                  </svg>
                  <span>{resourceName}</span>
                </div>
              )}
              {status && (
                <div className='flex items-center gap-1.5'>
                  <span
                    className='inline-block h-1.5 w-1.5 rounded-full'
                    style={{
                      backgroundColor:
                        status === 'CONFIRMED' ? '#22c55e' :
                        status === 'CANCELLED' ? '#ef4444' :
                        status === 'COMPLETED' ? '#6b7280' : '#f59e0b'
                    }}
                  />
                  <span className='capitalize'>{status.toLowerCase()}</span>
                </div>
              )}
            </div>

            <div className='mt-2 pt-2 border-t border-gray-100'>
              <p className='text-[10px] text-gray-400 text-center'>Cliquer pour ouvrir</p>
            </div>
          </div>
          {/* Arrow */}
          {popupRect.flipAbove ? (
            <div className='absolute left-4 bottom-0 translate-y-full'>
              <div className='h-2 w-2 rotate-45 border-r border-b border-gray-200 bg-white' />
            </div>
          ) : (
            <div className='absolute left-4 top-0 -translate-y-full'>
              <div className='h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white' />
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}

export function CalendarEmptyState({ message }: { message: string }) {
  return (
    <div className='flex h-full min-h-[12rem] flex-col items-center justify-center px-6 text-center'>
      <p className='text-[11px] text-gray-400'>{message}</p>
    </div>
  )
}
