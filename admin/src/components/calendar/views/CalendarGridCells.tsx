import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import EventCard, { type EventCardSchedule } from '@/components/calendar/EventCard'
import { formatLocalDate } from '@/lib/date'
import { getWeekDates, PERIOD_OPTIONS, type PeriodKey } from '@/lib/calendarView'

export type CalendarDaySlots = {
  morning: EventCardSchedule[]
  afternoon: EventCardSchedule[]
  evening: EventCardSchedule[]
}

const DAY_START_HOUR = 8
const DAY_END_HOUR = 21
const HOUR_COUNT = DAY_END_HOUR - DAY_START_HOUR
const DEFAULT_HOUR_HEIGHT_PX = 56
const DEFAULT_EVENT_MINUTES = 30

function useNowTicker() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: number | undefined

    const timeoutId = window.setTimeout(() => {
      tick()
      intervalId = window.setInterval(tick, 60_000)
    }, msUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  return now
}

function flattenDaySlots(day: CalendarDaySlots): EventCardSchedule[] {
  return [...day.morning, ...day.afternoon, ...day.evening].sort((a, b) =>
    a.datetime.localeCompare(b.datetime),
  )
}

function getEventLayout(datetime: string, hourHeight: number) {
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) return null

  const minutesFromStart = (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes()
  const totalMinutes = HOUR_COUNT * 60
  if (minutesFromStart < 0 || minutesFromStart > totalMinutes) return null

  return {
    top: (minutesFromStart / 60) * hourHeight,
    height: Math.max((DEFAULT_EVENT_MINUTES / 60) * hourHeight, 28),
  }
}

function getNowOffsetPx(now: Date, hourHeight: number) {
  const minutesFromStart = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes()
  const totalMinutes = HOUR_COUNT * 60
  if (minutesFromStart < 0 || minutesFromStart > totalMinutes) return null
  return (minutesFromStart / 60) * hourHeight
}

function layoutOverlappingEvents(events: EventCardSchedule[], duration = DEFAULT_EVENT_MINUTES) {
  const sorted = [...events].sort((a, b) => {
    const diff = a.datetime.localeCompare(b.datetime)
    if (diff !== 0) return diff
    return a.id.localeCompare(b.id)
  })

  const columnEnds: number[] = []
  const assignments = new Map<string, number>()

  for (const event of sorted) {
    const start = new Date(event.datetime).getTime()
    const end = start + duration * 60 * 1000
    let placed = false

    for (let col = 0; col < columnEnds.length; col++) {
      if (start >= columnEnds[col]) {
        columnEnds[col] = end
        assignments.set(event.id, col)
        placed = true
        break
      }
    }

    if (!placed) {
      columnEnds.push(end)
      assignments.set(event.id, columnEnds.length - 1)
    }
  }

  const totalColumns = Math.max(columnEnds.length, 1)
  return { assignments, totalColumns }
}

interface ScheduleCellProps {
  schedules: EventCardSchedule[]
  isToday?: boolean
  isLastRow?: boolean
  onOpenSchedule: (schedule: EventCardSchedule) => void
  isOpened: (id: string) => boolean
  formatTime: (value?: string) => string
}

export function ScheduleCell({
  schedules,
  isToday,
  isLastRow,
  onOpenSchedule,
  isOpened,
  formatTime,
}: ScheduleCellProps) {
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
    <div
      className={clsx(
        'relative flex min-h-0 flex-col overflow-hidden border-r border-gray-200 last:border-r-0',
        !isLastRow && 'border-b',
        isToday && 'bg-blue-50/30',
      )}
    >
      <div
        ref={scrollRef}
        className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-1.5 scrollbar-thin'
      >
        {schedules.map((schedule) => (
          <EventCard
            key={schedule.id}
            schedule={schedule}
            formatTime={formatTime}
            isUnread={!isOpened(schedule.id)}
            variant='grid'
            onClick={() => onOpenSchedule(schedule)}
          />
        ))}
      </div>

      {overflowCount > 0 && (
        <div className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center'>
          <div
            className='h-8 w-full'
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

export function DayHeaderCell({
  date,
  dayLabel,
  compact = false,
}: {
  date: Date
  dayLabel?: string
  compact?: boolean
}) {
  const isToday = formatLocalDate(date) === formatLocalDate(new Date())
  const weekday =
    dayLabel?.slice(0, 3).toUpperCase() ??
    date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').toUpperCase()

  return (
    <div
      className={clsx(
        'sticky top-0 z-10 flex flex-col items-center border-b border-r border-gray-200 bg-gray-50/80 backdrop-blur-sm px-1 py-3 last:border-r-0',
        isToday && 'bg-blue-50/50',
        compact && 'py-2',
      )}
    >
      <span className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>
        {weekday}
      </span>
      <span
        className={clsx(
          'mt-1.5 flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-semibold tabular-nums',
          isToday ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-900',
        )}
      >
        {date.getDate()}
      </span>
    </div>
  )
}

export function PeriodLabelCell({
  label,
  title,
  isLastRow,
}: {
  label: string
  title?: string
  isLastRow?: boolean
}) {
  return (
    <div
      title={title ?? label}
      className={clsx(
        'sticky left-0 z-10 flex items-start justify-start border-r border-gray-200 bg-gray-50/80 backdrop-blur-sm px-3 py-3 text-[15px] sm:text-[11px] font-medium leading-tight text-gray-500',
        !isLastRow && 'border-b',
      )}
    >
      {label}
    </div>
  )
}

export function CornerCell() {
  return <div className='sticky left-0 top-0 z-20 border-b border-r border-gray-200 bg-gray-50/80 backdrop-blur-sm' />
}

interface WeekGridProps {
  weekDates: Date[]
  dayLabels: string[]
  displayItems: CalendarDaySlots[]
  onOpenSchedule: (schedule: EventCardSchedule) => void
  isOpened: (id: string) => boolean
  formatTime: (value?: string) => string
}

export function CalendarWeekGrid({
  weekDates,
  dayLabels,
  displayItems,
  onOpenSchedule,
  isOpened,
  formatTime,
}: WeekGridProps) {
  return (
    <div className='grid h-full min-w-[880px] grid-cols-[4.25rem_repeat(6,minmax(0,1fr))] grid-rows-[3.5rem_repeat(3,minmax(0,1fr))]'>
      <CornerCell />
      {weekDates.map((date, dayIdx) => (
        <DayHeaderCell key={dayLabels[dayIdx]} date={date} dayLabel={dayLabels[dayIdx]} />
      ))}
      {PERIOD_OPTIONS.map((period, periodIdx) => (
        <div key={period.value} className='contents'>
          <PeriodLabelCell
            label={period.shortLabel}
            title={period.label}
            isLastRow={periodIdx === PERIOD_OPTIONS.length - 1}
          />
          {dayLabels.map((dayLabel, dayIdx) => (
            <ScheduleCell
              key={`${dayLabel}-${period.value}`}
              schedules={displayItems[dayIdx]?.[period.value] || []}
              isToday={formatLocalDate(weekDates[dayIdx]) === formatLocalDate(new Date())}
              isLastRow={periodIdx === PERIOD_OPTIONS.length - 1}
              onOpenSchedule={onOpenSchedule}
              isOpened={isOpened}
              formatTime={formatTime}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CalendarDayGrid({
  date,
  displayDay,
  onOpenSchedule,
  isOpened,
  formatTime,
}: {
  date: Date
  displayDay: CalendarDaySlots
  onOpenSchedule: (schedule: EventCardSchedule) => void
  isOpened: (id: string) => boolean
  formatTime: (value?: string) => string
}) {
  const now = useNowTicker()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isToday = formatLocalDate(date) === formatLocalDate(new Date())
  const hours = useMemo(
    () => Array.from({ length: HOUR_COUNT }, (_, index) => DAY_START_HOUR + index),
    [],
  )
  const events = useMemo(() => flattenDaySlots(displayDay), [displayDay])
  const eventLayout = useMemo(() => layoutOverlappingEvents(events), [events])
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const hourHeight = Math.max(containerHeight / HOUR_COUNT, DEFAULT_HOUR_HEIGHT_PX)
  const nowTop = isToday ? getNowOffsetPx(now, hourHeight) : null
  const totalHeight = HOUR_COUNT * hourHeight
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dayTitle = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (!isToday || !scrollRef.current) return
    const top = getNowOffsetPx(new Date(), hourHeight)
    if (top == null) return
    scrollRef.current.scrollTop = Math.max(0, top - scrollRef.current.clientHeight * 0.35)
  }, [isToday, date, hourHeight])

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div
        className={clsx(
          'shrink-0 border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm px-5 py-3',
          isToday && 'bg-blue-50/30',
        )}
      >
        <p className='text-[14px]'>
          <span className='capitalize font-medium text-gray-500'>{weekday}</span>{' '}
          <span className='font-semibold text-gray-900'>{dayTitle}</span>
        </p>
      </div>

      <div ref={scrollRef} className='min-h-0 flex-1 overflow-y-auto'>
        <div className='relative flex min-w-[320px]' style={{ minHeight: totalHeight }}>
          {/* Time column */}
          <div className='w-[72px] shrink-0'>
            {hours.map((hour) => (
              <div
                key={hour}
                className='relative'
                style={{ height: hourHeight }}
              >
                <span className='absolute top-1 right-3 text-[11px] font-medium tabular-nums text-gray-400'>
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Grid lines + events */}
          <div
            className='relative min-w-0 flex-1 border-l border-gray-200'
            style={{ height: totalHeight }}
          >
            {/* Hour grid lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className='border-b border-gray-100'
                style={{ height: hourHeight }}
              />
            ))}

            {/* Events + now indicator */}
            <div className='absolute inset-0'>
              {/* Now indicator — z-0 paints behind events */}
              {nowTop != null && (
                <div
                  className='pointer-events-none absolute left-0 right-0'
                  style={{ top: nowTop, zIndex: 0 }}
                  aria-hidden
                >
                  <div className='absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' />
                  <div className='h-[2px] w-full bg-red-500/70' />
                </div>
              )}

              {/* Events — z-10 paints on top of indicator */}
              <div className='absolute inset-0 overflow-hidden' style={{ zIndex: 10 }}>
                {events.map((schedule) => {
                  const layout = getEventLayout(schedule.datetime, hourHeight)
                  if (!layout) return null

                  const col = eventLayout.assignments.get(schedule.id)
                  const colIdx = col ?? 0
                  const totalCols = eventLayout.totalColumns
                  const colWidth = 100 / totalCols

                  return (
                    <div
                      key={schedule.id}
                      className='absolute bg-white'
                      style={{
                        top: layout.top + 2,
                        height: layout.height - 4,
                        left: `calc(${colIdx * colWidth}% + 15px)`,
                        width: `calc(${colWidth}% - 30px)`,
                      }}
                    >
                      <EventCard
                        schedule={schedule}
                        formatTime={formatTime}
                        isUnread={!isOpened(schedule.id)}
                        variant='grid'
                        expandable={false}
                        onClick={() => onOpenSchedule(schedule)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
