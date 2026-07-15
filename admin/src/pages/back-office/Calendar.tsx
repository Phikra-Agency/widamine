import { useSchedulesStore } from '@/stores/schedulesStore'
import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'
import {
  getDayIndexInWeek,
  getWeekDates,
  navigateCalendarDate,
  shouldShowTodayButton,
  getMonthFetchMondays,
  getMonthGridDates,
  isSameMonth,
  type CalendarViewMode,
} from '@/lib/calendarView'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import clsx from 'clsx'
import { Button, Card } from '@/components/ui'
import {
  appointmentToScheduleLike,
  clearStashedAppointment,
  getMobileDayIndexForDate,
  getWeekMondayForPending,
  parsePendingCalendarOpen,
  readStashedAppointment,
  resolveScheduleForOpen,
  type PendingCalendarOpen,
} from '@/lib/scheduleNavigation'
import CalendarControlBar from '@/components/calendar/CalendarControlBar'

import PractitionerAnalytics from '@/components/calendar/PractitionerAnalytics'
import EventCard from '@/components/calendar/EventCard'
import {
  CalendarDayGrid,
  CalendarWeekGrid,
  type CalendarDaySlots,
} from '@/components/calendar/views/CalendarGridCells'
import CalendarMonthGrid from '@/components/calendar/views/CalendarMonthGrid'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'
import { CalendarFilterSelect } from '@/components/calendar/CalendarFilterSelect'

import { Funnel, User, Tag, CaretDown, CalendarBlank } from '@phosphor-icons/react'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'CANCELLED', label: 'Annulé' },
]

const OPENED_STORAGE_KEY = 'calendar-opened-keys-new'

function useOpenedKeys() {
  const keysRef = useRef<Set<string>>(new Set(loadOpenedKeys()))

  function loadOpenedKeys(): string[] {
    try {
      const raw = localStorage.getItem(OPENED_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  }

  function persist(keys: Set<string>) {
    localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify([...keys]))
  }

  const markOpened = useCallback((key: string) => {
    if (!keysRef.current.has(key)) {
      keysRef.current = new Set([...keysRef.current, key])
      persist(keysRef.current)
    }
  }, [])

  const isOpened = useCallback((key: string) => keysRef.current.has(key), [])

  return { markOpened, isOpened }
}

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

interface MotifItem {
  id: string
  name: string
  color: string
}

function formatTimeOnly(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function Calendar() {
  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      <Planner />
    </div>
  )
}

function Planner() {
  const {
    items,
    filters,
    fetchItems,
    setFetchedDate,
    fetchedDate,
    setItem,
    openShowSchedule,
    setFilters,
    pendingCalendarOpen,
    clearPendingCalendarOpen,
    openShowModal,
  } = useSchedulesStore()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingOpen, setPendingOpen] = useState<PendingCalendarOpen | null>(null)
  const processedOpenRef = useRef<string | null>(null)
  const effectivePending = pendingOpen ?? pendingCalendarOpen
  const weekDates = useMemo(() => getWeekDates(filters.date), [filters.date])
  const activeDayIdx = useMemo(() => getDayIndexInWeek(filters.date), [filters.date])
  const [viewMode, setViewMode] = useState<CalendarViewMode>(
    () => (searchParams.get('view') as CalendarViewMode) || 'day',
  )
  const showTodayButton = useMemo(
    () => shouldShowTodayButton(viewMode, filters.date),
    [viewMode, filters.date],
  )
  const [mobileDayIdx, setMobileDayIdx] = useState(0)
  const [pageView, setPageView] = useState<'calendar' | 'analytics'>('calendar')
  const [filterPractitionerIds, setFilterPractitionerIds] = useState<string[]>(
    () => { const v = searchParams.get('practitionerIds'); return v ? v.split(',') : [] }
  )
  const [filterStatuses, setFilterStatuses] = useState<string[]>(
    () => { const v = searchParams.get('statuses'); return v ? v.split(',') : [] }
  )
  const [filterMotifIds, setFilterMotifIds] = useState<string[]>(
    () => { const v = searchParams.get('motifIds'); return v ? v.split(',') : [] }
  )
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [motifOptions, setMotifOptions] = useState<MotifItem[]>([])
  const [monthItemsByDate, setMonthItemsByDate] = useState<Map<string, CalendarDaySlots>>(new Map())

  useEffect(() => {
    api.get('users/doctors').then((res) => setDoctors(res.data || [])).catch(() => {})
    api.get('motifs').then((res) => setMotifOptions(res.data || [])).catch(() => {})
  }, [])

  const debouncedSearch = useDebouncedGlobalSearch()
  const searchLower = debouncedSearch.trim().toLowerCase()

  const applyFiltersToDay = useCallback(
    (day: (typeof items)[0]): CalendarDaySlots => {
      const hasFilter = filterPractitionerIds.length > 0 || filterStatuses.length > 0 || filterMotifIds.length > 0 || searchLower
      const filterPeriod = (schedules: typeof day.morning) =>
        schedules.filter((s) => {
          const a = s.appointment
          if (!a) return false
          if (!hasFilter && (a.status === 'CANCELLED' || a.status === 'COMPLETED')) return false
          if (filterPractitionerIds.length > 0 && !filterPractitionerIds.includes(a.practitionerId)) return false
          if (filterStatuses.length > 0 && !filterStatuses.includes(a.status)) return false
          if (filterMotifIds.length > 0 && !filterMotifIds.includes(a.motif?.id || '')) return false

          if (searchLower) {
            const patientName = a.patient
              ? `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase()
              : (a.name || '').toLowerCase()
            const motifName = (a.motif?.name || '').toLowerCase()
            const resourceName = (a.resource?.name || '').toLowerCase()
            const haystack = [patientName, motifName, resourceName].join(' ')
            if (!haystack.includes(searchLower)) return false
          }

          return true
        })

      return {
        morning: filterPeriod(day.morning),
        afternoon: filterPeriod(day.afternoon),
        evening: filterPeriod(day.evening),
      }
    },
    [filterMotifIds, filterPractitionerIds, filterStatuses, searchLower],
  )

  const filteredItems = useMemo(
    () => items.map((day) => applyFiltersToDay(day)),
    [items, applyFiltersToDay],
  )

  const displayItems = filteredItems

  useEffect(() => {
    setMobileDayIdx(activeDayIdx)
  }, [activeDayIdx])

  const { markOpened, isOpened } = useOpenedKeys()

  useEffect(() => {
    const date = getMondayOfWeek(filters.date)
    const force = Boolean(pendingCalendarOpen || openShowModal)
    void fetchItems(date, { force }).then(() => setFetchedDate(date))
  }, [])

  useEffect(() => {
    if (!location.pathname.includes('/calendar')) return
    const pending = pendingCalendarOpen ?? parsePendingCalendarOpen(searchParams)
    const date = pending?.date ?? filters.date
    const monday = getMondayOfWeek(date)
    if (pending) {
      setMobileDayIdx(getMobileDayIndexForDate(pending.date, monday))
    }
    if (openShowModal || pending) {
      void fetchItems(monday, { force: true })
    }
  }, [location.pathname, pendingCalendarOpen, openShowModal, filters.date, fetchItems, searchParams])

  useEffect(() => {
    const date = getMondayOfWeek(filters.date)
    if (fetchedDate !== date) {
      fetchItems(date)
      setFetchedDate(date)
    }
  }, [fetchItems, fetchedDate, filters.date, setFetchedDate])

  useEffect(() => {
    if (viewMode !== 'month') return
    const mondays = getMonthFetchMondays(filters.date)
    const map = new Map<string, CalendarDaySlots>()
    let cancelled = false

    mondays.forEach((m) => {
      api.get('schedule/' + m).then((r) => {
        if (cancelled) return
        const weekData = r.data as CalendarDaySlots[]
        const mondayDate = parseLocalDate(m)
        for (let i = 0; i < weekData.length && i < 6; i++) {
          const d = new Date(mondayDate)
          d.setDate(mondayDate.getDate() + i)
          const key = formatLocalDate(d)
          map.set(key, applyFiltersToDay(weekData[i]))
        }
        setMonthItemsByDate(new Map(map))
      }).catch(() => {})
    })

    return () => { cancelled = true }
  }, [viewMode, filters.date, applyFiltersToDay])

  useEffect(() => {
    const fromUrl = parsePendingCalendarOpen(searchParams)
    if (fromUrl) {
      setPendingOpen(fromUrl)
      if (filters.date !== fromUrl.date) {
        setFilters({ ...filters, date: fromUrl.date })
      }
      return
    }
    if (pendingCalendarOpen) {
      setPendingOpen(pendingCalendarOpen)
    } else {
      setPendingOpen(null)
    }
  }, [searchParams, pendingCalendarOpen, filters.date, setFilters])

  useEffect(() => {
    if (!effectivePending) {
      processedOpenRef.current = null
      return
    }
    processedOpenRef.current = null
    const stashed = readStashedAppointment()
    if (stashed?.id === effectivePending.appointmentId) {
      const preview = appointmentToScheduleLike(stashed)
      if (preview) openShowSchedule(preview as Parameters<typeof openShowSchedule>[0])
    }
  }, [effectivePending?.appointmentId, effectivePending?.date, openShowSchedule])

  useEffect(() => {
    if (!effectivePending) return
    const targetMonday = getWeekMondayForPending(effectivePending)
    if (fetchedDate !== targetMonday) {
      void fetchItems(targetMonday, { force: true })
      return
    }
    const token = `${effectivePending.appointmentId}|${effectivePending.date}`
    if (processedOpenRef.current === token) return
    void (async () => {
      const schedule = await resolveScheduleForOpen(items, effectivePending.appointmentId, effectivePending.scheduleKey)
      if (!schedule) return
      openShowSchedule(schedule as Parameters<typeof openShowSchedule>[0])
      setMobileDayIdx(getMobileDayIndexForDate(effectivePending.date, targetMonday))
      processedOpenRef.current = token
      setPendingOpen(null)
      clearPendingCalendarOpen()
      const next = new URLSearchParams(searchParams)
      next.delete('openAppointment')
      next.delete('openSchedule')
      next.delete('date')
      setSearchParams(next, { replace: true })
      clearStashedAppointment()
    })()
  }, [effectivePending, items, fetchedDate, fetchItems, openShowSchedule, searchParams, setSearchParams, clearPendingCalendarOpen])

  const practitionerOptions = useMemo(
    () => doctors.map((d) => ({ value: d.id, label: d.name })),
    [doctors],
  )

  const motifSelectOptions = useMemo(
    () => motifOptions.map((m) => ({ value: m.id, label: m.name })),
    [motifOptions],
  )

  const filterToolbar = (
    <div className='flex flex-col gap-1.5'>
      <div className='flex flex-wrap items-center gap-2'>
        <CalendarFilterSelect
          placeholder='Statut'
          color='mist'
          icon={Funnel}
          options={STATUS_OPTIONS}
          value={filterStatuses}
          onChange={setFilterStatuses}
          showSearch={false}
        />
        <CalendarFilterSelect
          placeholder='Praticien'
          color='sky'
          icon={User}
          options={practitionerOptions}
          value={filterPractitionerIds}
          onChange={setFilterPractitionerIds}
        />
        <CalendarFilterSelect
          placeholder='Traitement'
          color='sea'
          icon={Tag}
          options={motifSelectOptions}
          value={filterMotifIds}
          onChange={setFilterMotifIds}
        />
      </div>
    </div>
  )

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const current = next.get('view')
    if (current !== viewMode) {
      if (viewMode === 'day') next.delete('view')
      else next.set('view', viewMode)
      setSearchParams(next, { replace: true })
    }
  }, [viewMode])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const sync = (key: string, values: string[]) => {
      const joined = values.join(',')
      if (joined) next.set(key, joined)
      else next.delete(key)
    }
    sync('statuses', filterStatuses)
    sync('practitionerIds', filterPractitionerIds)
    sync('motifIds', filterMotifIds)
    setSearchParams(next, { replace: true })
  }, [filterStatuses, filterPractitionerIds, filterMotifIds])

  const openSchedule = (schedule: import('@/components/calendar/EventCard').EventCardSchedule) => {
    openShowSchedule(schedule as any)
    markOpened(schedule.id)
  }

  const handleDateChange = (date: string) => {
    setMobileDayIdx(getDayIndexInWeek(date))
    setFilters({ ...filters, date })
  }

  const handleNavigate = (direction: -1 | 1) => {
    handleDateChange(navigateCalendarDate(filters.date, viewMode, direction))
  }

  const handleToday = () => {
    handleDateChange(formatLocalDate(new Date()))
  }

  const mobileDayData = displayItems[viewMode === 'day' ? activeDayIdx : mobileDayIdx]
  const showMobileDayStrip = viewMode === 'week'
  const showMobileMonthView = viewMode === 'month'

  const [mobileMonthSelectedDate, setMobileMonthSelectedDate] = useState(filters.date)
  const [collapsedPeriods, setCollapsedPeriods] = useState<Set<string>>(new Set())

  function togglePeriod(period: string) {
    setCollapsedPeriods(prev => {
      const next = new Set(prev)
      if (next.has(period)) next.delete(period); else next.add(period)
      return next
    })
  }

  useEffect(() => {
    setMobileMonthSelectedDate(filters.date)
  }, [filters.date])

  const mobileMonthData = useMemo(() => {
    if (viewMode !== 'month') return null
    return monthItemsByDate.get(mobileMonthSelectedDate) || null
  }, [viewMode, mobileMonthSelectedDate, monthItemsByDate])

  function MobileEmptyState() {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center'>
        <CalendarBlank size={40} weight='duotone' className='text-primary/60' aria-hidden />
        <p className='text-sm font-medium text-secondary'>Aucune réservation</p>
        <p className='text-xs text-secondary/40'>Aucune réservation pour cette période</p>
      </div>
    )
  }

  function MobilePeriod({ period, label, schedules }: {
    period: string; label: string; schedules: import('@/components/calendar/EventCard').EventCardSchedule[]
  }) {
    const open = !collapsedPeriods.has(period)
    return (
      <div className='py-1'>
        <button
          type='button'
          onClick={() => togglePeriod(period)}
          className='flex w-full items-center gap-1.5 py-1'
        >
          <CaretDown size={13} className={`shrink-0 text-secondary/40 transition-transform ${open ? '' : '-rotate-90'}`} />
          <p className='text-[13px] font-semibold uppercase tracking-wider text-secondary/40'>{label}</p>
          <span className='text-[11px] text-secondary/25'>({schedules.length})</span>
        </button>
        {open && (
          <div className='space-y-1.5 pt-0.5'>
            {schedules.length === 0 ? (
              <p className='py-2 text-[13px] text-secondary/40 italic px-0.5'>Aucune réservation</p>
            ) : (
              schedules.map((schedule) => (
                <EventCard
                  key={schedule.id}
                  schedule={schedule}
                  formatTime={formatTimeOnly}
                  isUnread={!isOpened(schedule.id)}
                  variant='list'
                  onClick={() => openSchedule(schedule)}
                />
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <CalendarControlBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filterToolbar}
        showTodayButton={showTodayButton}
        onPrev={() => handleNavigate(-1)}
        onNext={() => handleNavigate(1)}
        onToday={handleToday}
        dateValue={filters.date}
        onDateChange={handleDateChange}
        compact={false}
        isAnalytics={pageView === 'analytics'}
        onToggleAnalytics={() => setPageView(pageView === 'calendar' ? 'analytics' : 'calendar')}
      >
      </CalendarControlBar>

      {pageView === 'calendar' && (
        <>
          {showMobileDayStrip && (
          <div className='flex gap-1 overflow-x-auto border-b border-border-subtle bg-background px-3 py-2 lg:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            {weekDates.map((date, idx) => {
              const isToday = formatLocalDate(date) === formatLocalDate(new Date())
              const isActive = idx === mobileDayIdx
              return (
                <button
                  key={idx}
                  onClick={() => setMobileDayIdx(idx)}
                  className='flex min-w-[44px] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors'
                >
                  <span className={clsx('text-[11px] font-semibold uppercase tracking-[0.1em]', isActive ? 'text-primary' : 'text-secondary/35')}>
                    {DAY_LABELS[idx].slice(0, 3)}
                  </span>
                  <div
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition',
                      isActive && 'bg-primary text-white shadow-sm',
                      !isActive && isToday && 'text-primary ring-1 ring-inset ring-primary/25',
                      !isActive && !isToday && 'text-secondary/45',
                    )}
                  >
                    {date.toLocaleDateString('fr-FR', { day: '2-digit' })}
                  </div>
                </button>
              )
            })}
          </div>
          )}

          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden'>
            {viewMode === 'day' && (
              mobileDayData ? (
                <div className='px-4 py-3'>
                  <MobilePeriod period='morning' label='Matin' schedules={mobileDayData.morning} />
                  <MobilePeriod period='afternoon' label='Après-midi' schedules={mobileDayData.afternoon} />
                  <MobilePeriod period='evening' label='Soir' schedules={mobileDayData.evening} />
                </div>
              ) : (
                <MobileEmptyState />
              )
            )}

            {viewMode === 'week' && (
              mobileDayData ? (
                <div className='px-4 py-3'>
                  <MobilePeriod period='morning' label='Matin' schedules={mobileDayData.morning} />
                  <MobilePeriod period='afternoon' label='Après-midi' schedules={mobileDayData.afternoon} />
                  <MobilePeriod period='evening' label='Soir' schedules={mobileDayData.evening} />
                </div>
              ) : (
                <MobileEmptyState />
              )
            )}

            {showMobileMonthView && (
              <div className='flex min-h-0 flex-1 flex-col px-3 py-2'>
                <MobileMonthGrid
                  anchorDate={filters.date}
                  selectedDate={mobileMonthSelectedDate}
                  onSelectDate={setMobileMonthSelectedDate}
                  itemsByDate={monthItemsByDate}
                />
                <div className='mt-3 flex flex-1 flex-col'>

                  {mobileMonthData ? (
                    <>
                      <MobilePeriod period='morning' label='Matin' schedules={mobileMonthData.morning} />
                      <MobilePeriod period='afternoon' label='Après-midi' schedules={mobileMonthData.afternoon} />
                      <MobilePeriod period='evening' label='Soir' schedules={mobileMonthData.evening} />
                    </>
                  ) : (
                    <MobileEmptyState />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='hidden min-h-0 flex-1 overflow-auto lg:block'>
            {viewMode === 'week' && (
              <CalendarWeekGrid
                weekDates={weekDates}
                dayLabels={DAY_LABELS}
                displayItems={displayItems}
                onOpenSchedule={openSchedule}
                isOpened={isOpened}
                formatTime={formatTimeOnly}
              />
            )}
            {viewMode === 'day' && displayItems[activeDayIdx] && (
              <CalendarDayGrid
                date={weekDates[activeDayIdx] ?? parseLocalDate(filters.date)}
                displayDay={displayItems[activeDayIdx]}
                onOpenSchedule={openSchedule}
                isOpened={isOpened}
                formatTime={formatTimeOnly}
              />
            )}
            {viewMode === 'month' && (
              <CalendarMonthGrid
                anchorDate={filters.date}
                itemsByDate={monthItemsByDate}
                onOpenSchedule={openSchedule}
                isOpened={isOpened}
                formatTime={formatTimeOnly}
              />
            )}
          </div>
        </>
      )}

      {pageView === 'analytics' && (
        <div className='flex-1 overflow-auto'>
          <div className='bo-page-inner bo-section-stack'>
            <Card className='bo-table-card'>
              <PractitionerAnalytics 
                practitioners={doctors} 
                viewMode={viewMode}
                displayItems={displayItems}
                monthItemsByDate={monthItemsByDate}
                activeDayIdx={activeDayIdx}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileMonthGrid({
  anchorDate,
  selectedDate,
  onSelectDate,
  itemsByDate,
}: {
  anchorDate: string
  selectedDate: string
  onSelectDate: (date: string) => void
  itemsByDate: Map<string, { morning: any[]; afternoon: any[]; evening: any[] }>
}) {
  const gridDates = useMemo(() => getMonthGridDates(anchorDate), [anchorDate])
  const today = formatLocalDate(new Date())
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div>
      <div className='grid grid-cols-7 border-b border-border-subtle'>
        {dayLabels.map((label, i) => (
          <div key={i} className='py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-secondary/40'>
            {label}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7'>
        {gridDates.map((date, idx) => {
          const dateKey = formatLocalDate(date)
          const inMonth = isSameMonth(date, anchorDate)
          const isToday = dateKey === today
          const isSelected = dateKey === selectedDate
          const dayData = itemsByDate.get(dateKey)
          const count = dayData
            ? dayData.morning.length + dayData.afternoon.length + dayData.evening.length
            : 0

          return (
            <button
              key={idx}
              type='button'
              onClick={() => onSelectDate(dateKey)}
              className={clsx(
                'flex min-h-[52px] flex-col items-center justify-center gap-1 transition-colors',
                !inMonth && 'opacity-30',
                isSelected && !isToday && 'bg-primary/10',
              )}
            >
              <span
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium transition',
                  isSelected && 'bg-primary text-white shadow-sm',
                  !isSelected && isToday && 'ring-1 ring-inset ring-primary',
                  !isSelected && !isToday && 'text-secondary/70',
                )}
              >
                {date.getDate()}
              </span>
              {count > 0 && (
                <div className='flex h-1 gap-0.5'>
                  {dayData!.morning.length > 0 && <span className='h-1.5 w-1.5 rounded-full bg-primary' />}
                  {dayData!.afternoon.length > 0 && <span className='h-1.5 w-1.5 rounded-full bg-amber-400' />}
                  {dayData!.evening.length > 0 && <span className='h-1.5 w-1.5 rounded-full bg-purple-400' />}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
