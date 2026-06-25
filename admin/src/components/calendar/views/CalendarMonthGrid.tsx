import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import EventCard, { type EventCardSchedule } from '@/components/calendar/EventCard'
import { formatLocalDate } from '@/lib/date'
import { getMonthGridDates, isSameMonth } from '@/lib/calendarView'

interface CalendarMonthGridProps {
  anchorDate: string
  itemsByDate: Map<string, { morning: EventCardSchedule[]; afternoon: EventCardSchedule[]; evening: EventCardSchedule[] }>
  onOpenSchedule: (schedule: EventCardSchedule) => void
  isOpened: (id: string) => boolean
  formatTime: (value?: string) => string
}

const MAX_VISIBLE_CARDS = 3

export default function CalendarMonthGrid({
  anchorDate,
  itemsByDate,
  onOpenSchedule,
  isOpened,
  formatTime,
}: CalendarMonthGridProps) {
  const gridDates = useMemo(() => getMonthGridDates(anchorDate), [anchorDate])
  const today = formatLocalDate(new Date())
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div className='flex h-full min-w-[640px] flex-col overflow-hidden'>
      <div className='grid grid-cols-7 border-b border-gray-200'>
        {dayLabels.map((label) => (
          <div
            key={label}
            className='border-r border-gray-200 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 last:border-r-0'
          >
            {label}
          </div>
        ))}
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-7' style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}>
        {gridDates.map((date, idx) => {
          const dateKey = formatLocalDate(date)
          const inMonth = isSameMonth(date, anchorDate)
          const isToday = dateKey === today
          const dayData = itemsByDate.get(dateKey)
          const allEvents = dayData
            ? [...dayData.morning, ...dayData.afternoon, ...dayData.evening].sort((a, b) =>
                a.datetime.localeCompare(b.datetime),
              )
            : []

          return (
            <div
              key={idx}
              className={clsx(
                'relative flex min-h-0 flex-col overflow-hidden border-b border-r border-gray-100 last:border-r-0',
                !inMonth && 'bg-gray-50/50',
              )}
            >
              <div className='flex items-center justify-between px-1.5 pt-1'>
                <span
                  className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium',
                    isToday && 'bg-blue-500 text-white',
                    !isToday && inMonth && 'text-gray-700',
                    !isToday && !inMonth && 'text-gray-300',
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              <MonthCellBody
                schedules={allEvents}
                onOpenSchedule={onOpenSchedule}
                isOpened={isOpened}
                formatTime={formatTime}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthCellBody({
  schedules,
  onOpenSchedule,
  isOpened,
  formatTime,
}: {
  schedules: EventCardSchedule[]
  onOpenSchedule: (schedule: EventCardSchedule) => void
  isOpened: (id: string) => boolean
  formatTime: (value?: string) => string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [overflowCount, setOverflowCount] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || schedules.length === 0) {
      setOverflowCount(0)
      return
    }
    const check = () => {
      requestAnimationFrame(() => {
        const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
        if (remaining <= 4) {
          setOverflowCount(0)
          return
        }
        const containerRect = el.getBoundingClientRect()
        const cards = el.querySelectorAll('[data-event-card]')
        let count = 0
        for (const card of cards) {
          if (card.getBoundingClientRect().bottom > containerRect.bottom + 2) count++
        }
        setOverflowCount(count)
      })
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', check)
    }
  }, [schedules.length])

  return (
    <div className='relative min-h-0 flex-1'>
      <div
        ref={scrollRef}
        className='absolute inset-0 flex flex-col gap-1 overflow-y-auto p-1 scrollbar-thin'
      >
        {schedules.map((schedule) => (
          <EventCard
            key={schedule.id}
            schedule={schedule}
            formatTime={formatTime}
            isUnread={!isOpened(schedule.id)}
            variant='grid'
            expandable={false}
            onClick={() => onOpenSchedule(schedule)}
          />
        ))}
      </div>

      {overflowCount > 0 && (
        <div className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center'>
          <div
            className='h-6 w-full'
            style={{ background: 'linear-gradient(to top, white 0%, transparent 100%)' }}
          />
          <span className='absolute bottom-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500'>
            +{overflowCount}
          </span>
        </div>
      )}
    </div>
  )
}
