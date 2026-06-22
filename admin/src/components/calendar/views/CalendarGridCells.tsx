import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import EventCard, { type EventCardSchedule } from '@/components/calendar/EventCard'
import { formatLocalDate } from '@/lib/date'
import { isSameMonth, PERIOD_OPTIONS, type PeriodKey } from '@/lib/calendarView'

export type CalendarDaySlots = {
  morning: EventCardSchedule[]
  afternoon: EventCardSchedule[]
  evening: EventCardSchedule[]
}

const DAY_START_HOUR = 7
const DAY_END_HOUR = 21
const HOUR_HEIGHT_PX = 56
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

function getEventLayout(datetime: string) {
  const date = new Date(datetime)
  if (Number.isNaN(date.getTime())) return null

  const minutesFromStart = (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes()
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60
  if (minutesFromStart < 0 || minutesFromStart > totalMinutes) return null

  return {
    top: (minutesFromStart / 60) * HOUR_HEIGHT_PX,
    height: Math.max((DEFAULT_EVENT_MINUTES / 60) * HOUR_HEIGHT_PX, 28),
  }
}

function getNowOffsetPx(now: Date) {
  const minutesFromStart = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes()
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60
  if (minutesFromStart < 0 || minutesFromStart > totalMinutes) return null
  return (minutesFromStart / 60) * HOUR_HEIGHT_PX
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
  const cellRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const [maxCards, setMaxCards] = useState(schedules.length)

  const measure = useCallback(() => {
    if (showAll) return
    const el = cellRef.current
    if (!el || schedules.length === 0) {
      setMaxCards(schedules.length)
      return
    }

    const style = getComputedStyle(el)
    const pt = parseFloat(style.paddingTop)
    const pb = parseFloat(style.paddingBottom)
    const gap = parseFloat(style.rowGap) || parseFloat(style.gap) || 0
    const available = el.clientHeight - pt - pb

    const sample = el.querySelector('[data-event-card]') as HTMLElement
    const cardH = sample ? sample.offsetHeight : 26

    if (cardH <= 0) return

    const btnH = 26
    const reserveButton = schedules.length > 1
    const roomForCards = available - (reserveButton ? btnH + gap : 0)
    const count = Math.max(1, Math.floor((roomForCards + gap) / (cardH + gap)))

    setMaxCards(Math.min(count, schedules.length))
  }, [schedules.length, showAll])

  useEffect(() => {
    const el = cellRef.current
    if (!el) return

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    requestAnimationFrame(measure)
    return () => ro.disconnect()
  }, [measure])

  const overflow = schedules.length - maxCards
  const visible = overflow > 0 ? schedules.slice(0, maxCards) : schedules

  return (
    <div
      ref={cellRef}
      className={clsx(
        'flex min-h-0 flex-col gap-1 overflow-hidden border-r border-border-subtle p-1.5 last:border-r-0',
        !isLastRow && 'border-b',
        isToday && 'bg-primary/[0.02]',
      )}
    >
      {showAll || overflow <= 0
        ? schedules.map((schedule) => (
            <EventCard
              key={schedule.id}
              schedule={schedule}
              formatTime={formatTime}
              isUnread={!isOpened(schedule.id)}
              variant='grid'
              onClick={() => onOpenSchedule(schedule)}
            />
          ))
        : visible.map((schedule) => (
            <EventCard
              key={schedule.id}
              schedule={schedule}
              formatTime={formatTime}
              isUnread={!isOpened(schedule.id)}
              variant='grid'
              onClick={() => onOpenSchedule(schedule)}
            />
          ))}
      {overflow > 0 && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setShowAll(!showAll)}
          className='h-auto shrink-0 px-2 py-1 text-[11px] text-muted-foreground hover:text-primary'
        >
          {showAll ? `-${overflow}` : `+${overflow}`}
        </Button>
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
    dayLabel?.slice(0, 3).toLowerCase() ??
    date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').toLowerCase()

  return (
    <div
      className={clsx(
        'sticky top-0 z-10 flex items-center justify-center border-b border-r border-border-subtle bg-card px-1 py-1.5 last:border-r-0',
        isToday && 'bg-primary/[0.03]',
        compact && 'py-1',
      )}
    >
      <span className='inline-flex items-center gap-1.5 text-[12px] tabular-nums'>
        <span className='font-medium lowercase text-muted-foreground'>{weekday}</span>
        <span
          className={clsx(
            'inline-flex min-w-7 items-center justify-center rounded-full px-1 font-medium',
            isToday ? 'bg-primary py-0.5 text-primary-foreground' : 'text-foreground',
          )}
        >
          {date.getDate()}
        </span>
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
        'sticky left-0 z-10 flex items-start justify-start border-r border-border-subtle bg-card px-2 py-2 text-[10px] font-medium leading-tight text-muted-foreground',
        !isLastRow && 'border-b',
      )}
    >
      {label}
    </div>
  )
}

export function CornerCell() {
  return <div className='sticky left-0 top-0 z-20 border-b border-r border-border-subtle bg-card' />
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
    <div className='grid h-full min-w-[880px] grid-cols-[4.25rem_repeat(6,minmax(0,1fr))] grid-rows-[3rem_repeat(3,minmax(7rem,1fr))]'>
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
    () => Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => DAY_START_HOUR + index),
    [],
  )
  const events = useMemo(() => flattenDaySlots(displayDay), [displayDay])
  const nowTop = isToday ? getNowOffsetPx(now) : null
  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dayTitle = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (!isToday || !scrollRef.current) return
    const top = getNowOffsetPx(new Date())
    if (top == null) return
    scrollRef.current.scrollTop = Math.max(0, top - scrollRef.current.clientHeight * 0.35)
  }, [isToday, date])

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div
        className={clsx(
          'shrink-0 border-b border-border-subtle bg-card px-4 py-2.5',
          isToday && 'bg-primary/[0.03]',
        )}
      >
        <p className='text-[11px] font-medium capitalize text-muted-foreground'>{weekday}</p>
        <p className='text-sm font-semibold text-foreground'>{dayTitle}</p>
      </div>

      <div ref={scrollRef} className='min-h-0 flex-1 overflow-y-auto'>
        <div className='relative flex min-w-[320px]' style={{ minHeight: totalHeight }}>
          <div className='w-14 shrink-0 border-r border-border-subtle bg-card'>
            {hours.map((hour) => (
              <div
                key={hour}
                className='relative border-b border-border-subtle/70'
                style={{ height: HOUR_HEIGHT_PX }}
              >
                <span className='absolute -top-2.5 right-2 text-[10px] tabular-nums text-muted-foreground'>
                  {hour} h
                </span>
              </div>
            ))}
          </div>

          <div className='relative min-w-0 flex-1 bg-card/40'>
            {hours.map((hour) => (
              <div
                key={hour}
                className='border-b border-border-subtle/70'
                style={{ height: HOUR_HEIGHT_PX }}
              />
            ))}

            {events.map((schedule) => {
              const layout = getEventLayout(schedule.datetime)
              if (!layout) return null

              return (
                <div
                  key={schedule.id}
                  className='absolute right-1 left-1 z-10'
                  style={{ top: layout.top, height: layout.height }}
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

            {nowTop != null && (
              <div
                className='bo-now-indicator pointer-events-none absolute right-0 left-0 z-20'
                style={{ top: nowTop }}
                aria-hidden
              >
                <span className='bo-now-indicator-dot' />
                <span className='bo-now-indicator-line' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CalendarMonthGrid({
  monthDates,
  anchorDate,
  itemsByDate,
  onOpenSchedule,
  onSelectDate,
  formatTime,
}: {
  monthDates: Date[]
  anchorDate: string
  itemsByDate: Map<string, CalendarDaySlots>
  onOpenSchedule: (schedule: EventCardSchedule) => void
  onSelectDate: (date: string) => void
  formatTime: (value?: string) => string
}) {
  const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const [popupDate, setPopupDate] = useState<string | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!popupDate) return
    const close = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupDate(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [popupDate])

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='grid grid-cols-7 border-b border-border-subtle'>
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className='px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground'
          >
            {label}
          </div>
        ))}
      </div>
      <div className='grid min-h-0 flex-1 auto-rows-fr grid-cols-7'>
        {monthDates.map((date) => {
          const dateKey = formatLocalDate(date)
          const inMonth = isSameMonth(date, anchorDate)
          const isToday = dateKey === formatLocalDate(new Date())
          const day = itemsByDate.get(dateKey)
          const events = day
            ? [...day.morning, ...day.afternoon, ...day.evening].sort((a, b) =>
                a.datetime.localeCompare(b.datetime),
              )
            : []
          const overflow = events.length - 2
          const overflowItems = overflow > 0 ? events.slice(2) : []

          return (
            <div
              key={dateKey}
              role='button'
              tabIndex={0}
              onClick={() => onSelectDate(dateKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDate(dateKey)
                }
              }}
              className={clsx(
                'flex min-h-[5.5rem] cursor-pointer flex-col border-b border-r border-border-subtle p-1.5 text-left transition hover:bg-muted/20',
                !inMonth && 'bg-muted/10 text-muted-foreground/50',
                isToday && inMonth && 'bg-primary/[0.04]',
              )}
            >
              <span
                className={clsx(
                  'mb-1 flex h-6 w-6 items-center justify-center self-center rounded-full text-xs tabular-nums',
                  isToday && inMonth && 'bg-primary font-medium text-primary-foreground',
                )}
              >
                {date.getDate()}
              </span>
              <div className='flex flex-col gap-0.5'>
                {events.slice(0, 2).map((schedule) => (
                  <EventCard
                    key={schedule.id}
                    schedule={schedule}
                    formatTime={formatTime}
                    variant='grid'
                    expandable
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenSchedule(schedule)
                    }}
                  />
                ))}
                {overflow > 0 && (
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        setPopupDate(popupDate === dateKey ? null : dateKey)
                      }}
                      className='block w-full px-1 text-left text-[10px] text-muted-foreground hover:text-primary'
                    >
                      +{overflow}
                    </button>
                    {popupDate === dateKey && (
                      <div
                        ref={popupRef}
                        className='absolute bottom-full left-0 z-50 mb-1 min-w-40 rounded-lg border border-border bg-card p-1 shadow-lg'
                      >
                        <div className='flex flex-col gap-0.5'>
                          {overflowItems.map((schedule) => (
                            <EventCard
                              key={schedule.id}
                              schedule={schedule}
                              formatTime={formatTime}
                              variant='grid'
                              expandable
                              onClick={(e) => {
                                e.stopPropagation()
                                setPopupDate(null)
                                onOpenSchedule(schedule)
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
