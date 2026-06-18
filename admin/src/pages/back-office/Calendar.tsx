import { useSchedulesStore } from '@/stores/schedulesStore'
import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'
import {
  getDayIndexInWeek,
  getMonthFetchMondays,
  getMonthGridDates,
  getWeekDates,
  navigateCalendarDate,
  shouldShowTodayButton,
  type CalendarViewMode,
} from '@/lib/calendarView'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import clsx from 'clsx'
import { Button } from '@/components/ui'
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
import CalendarDatePicker from '@/components/calendar/CalendarDatePicker'
import EventCard from '@/components/calendar/EventCard'
import {
  CalendarDayGrid,
  CalendarMonthGrid,
  CalendarWeekGrid,
  type CalendarDaySlots,
} from '@/components/calendar/views/CalendarGridCells'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'
import { DataTableFilterPills, type FilterPillOption } from '@/components/data-table'
import type { FilterPillColor } from '@/components/data-table/filter-pills'

const CALENDAR_STATUS_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Tous', color: 'mist' },
  { value: 'PENDING', label: 'En attente', color: 'sand' },
  { value: 'CONFIRMED', label: 'Confirmé', color: 'sea' },
  { value: 'COMPLETED', label: 'Terminé', color: 'sage' },
  { value: 'CANCELLED', label: 'Annulé', color: 'coral' },
]

const DYNAMIC_PILL_COLORS: FilterPillColor[] = ['sky', 'sea', 'aqua', 'sage']

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
  bookingType?: string
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
    toggleOpenShowModal,
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
  const monthDates = useMemo(() => getMonthGridDates(filters.date), [filters.date])
  const activeDayIdx = useMemo(() => getDayIndexInWeek(filters.date), [filters.date])
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [monthItemsByDate, setMonthItemsByDate] = useState<Map<string, CalendarDaySlots>>(new Map())
  const showTodayButton = useMemo(
    () => shouldShowTodayButton(viewMode, filters.date),
    [viewMode, filters.date],
  )
  const [mobileDayIdx, setMobileDayIdx] = useState(0)
  const [filterPractitionerId, setFilterPractitionerId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMotifId, setFilterMotifId] = useState('')
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [motifOptions, setMotifOptions] = useState<MotifItem[]>([])

  useEffect(() => {
    api.get('users/doctors').then((res) => setDoctors(res.data || [])).catch(() => {})
    api.get('motifs').then((res) => setMotifOptions(res.data || [])).catch(() => {})
  }, [])

  const debouncedSearch = useDebouncedGlobalSearch()
  const searchLower = debouncedSearch.trim().toLowerCase()

  const applyFiltersToDay = useCallback(
    (day: (typeof items)[0]): CalendarDaySlots => {
      const hasFilter = filterPractitionerId || filterStatus || filterMotifId || searchLower
      const filterPeriod = (schedules: typeof day.morning) =>
        schedules.filter((s) => {
          const a = s.appointment
          if (!a) return false
          if (!hasFilter && (a.status === 'CANCELLED' || a.status === 'COMPLETED')) return false
          if (filterPractitionerId && a.practitionerId !== filterPractitionerId) return false
          if (filterStatus && a.status !== filterStatus) return false
          if (filterMotifId && a.motif?.id !== filterMotifId) return false

          if (searchLower) {
            const patientName = a.patient
              ? `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase()
              : (a.name || '').toLowerCase()
            const motifName = (a.motif?.name || '').toLowerCase()
            const resourceName = (a.resource?.name || '').toLowerCase()
            const serviceName = (s.session?.service?.name || '').toLowerCase()
            const haystack = [patientName, motifName, resourceName, serviceName].join(' ')
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
    [filterMotifId, filterPractitionerId, filterStatus, searchLower],
  )

  const filteredItems = useMemo(
    () => items.map((day) => applyFiltersToDay(day)),
    [items, applyFiltersToDay],
  )

  const displayItems = filteredItems

  useEffect(() => {
    setMobileDayIdx(activeDayIdx)
  }, [activeDayIdx])

  useEffect(() => {
    if (viewMode !== 'month') return

    let cancelled = false
    void (async () => {
      const mondays = getMonthFetchMondays(filters.date)
      const map = new Map<string, CalendarDaySlots>()

      await Promise.all(
        mondays.map(async (monday) => {
          const res = await api.get(`schedule/${monday}`)
          const weekStart = parseLocalDate(monday)
          ;(res.data as typeof items).forEach((day, idx) => {
            const cellDate = new Date(weekStart)
            cellDate.setDate(weekStart.getDate() + idx)
            map.set(formatLocalDate(cellDate), applyFiltersToDay(day))
          })
        }),
      )

      if (!cancelled) setMonthItemsByDate(map)
    })()

    return () => {
      cancelled = true
    }
  }, [viewMode, filters.date, applyFiltersToDay, items.length])

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

  const practitionerPills = useMemo<FilterPillOption[]>(
    () => [
      { value: 'all', label: 'Tous praticiens', color: 'mist' },
      ...doctors.map((doctor, index) => ({
        value: doctor.id,
        label: doctor.name,
        color: DYNAMIC_PILL_COLORS[index % DYNAMIC_PILL_COLORS.length],
      })),
    ],
    [doctors],
  )

  const motifPills = useMemo<FilterPillOption[]>(
    () => [
      { value: 'all', label: 'Tous motifs', color: 'mist' },
      ...motifOptions.map((motif, index) => ({
        value: motif.id,
        label: motif.name,
        color: DYNAMIC_PILL_COLORS[index % DYNAMIC_PILL_COLORS.length],
      })),
    ],
    [motifOptions],
  )

  const filterToolbar = (
    <>
      <DataTableFilterPills
        options={CALENDAR_STATUS_PILLS}
        value={filterStatus || 'all'}
        onChange={(value) => setFilterStatus(value === 'all' ? '' : value)}
      />
      {doctors.length > 0 && (
        <DataTableFilterPills
          options={practitionerPills}
          value={filterPractitionerId || 'all'}
          onChange={(value) => setFilterPractitionerId(value === 'all' ? '' : value)}
        />
      )}
      {motifOptions.length > 0 && (
        <DataTableFilterPills
          options={motifPills}
          value={filterMotifId || 'all'}
          onChange={(value) => setFilterMotifId(value === 'all' ? '' : value)}
        />
      )}
    </>
  )

  const openSchedule = (schedule: (typeof items)[0]['morning'][0]) => {
    setItem(schedule)
    toggleOpenShowModal()
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

  const handleMonthSelect = (date: string) => {
    setFilters({ ...filters, date })
    setViewMode('day')
  }

  const mobileDayData = displayItems[viewMode === 'day' ? activeDayIdx : mobileDayIdx]
  const showMobileDayStrip = viewMode === 'week'

  const renderMobileEvents = (schedules: (typeof items)[0]['morning']) => {
    if (schedules.length === 0) return null
    return (
      <div className='space-y-1.5'>
        {schedules.map((schedule) => (
          <EventCard
            key={schedule.id}
            schedule={schedule}
            formatTime={formatTimeOnly}
            isUnread={!isOpened(schedule.id)}
            variant='list'
            onClick={() => openSchedule(schedule)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
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
      />

      {showMobileDayStrip && (
      <div className='flex gap-1 overflow-x-auto border-b border-border-subtle bg-transparent px-4 py-2 lg:hidden'>
        {weekDates.map((date, idx) => {
          const isToday = formatLocalDate(date) === formatLocalDate(new Date())
          const isActive = idx === mobileDayIdx
          return (
            <button
              key={idx}
              onClick={() => setMobileDayIdx(idx)}
              className='flex min-w-[38px] shrink-0 cursor-pointer flex-col items-center gap-0.5 py-1'
            >
              <span className={clsx('text-[9px] font-semibold uppercase tracking-[0.1em]', isActive ? 'text-primary' : 'text-secondary/35')}>
                {DAY_LABELS[idx].slice(0, 3)}
              </span>
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition',
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
        <div className='ml-auto flex items-center'>
          <CalendarDatePicker
            compact
            value={filters.date}
            label={filters.date}
            onChange={(date) => {
              handleDateChange(date)
            }}
          />
        </div>
      </div>
      )}

      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden'>
        {viewMode === 'month' && (
          <CalendarMonthGrid
            monthDates={monthDates}
            anchorDate={filters.date}
            itemsByDate={monthItemsByDate}
            onOpenSchedule={openSchedule}
            onSelectDate={handleMonthSelect}
            formatTime={formatTimeOnly}
          />
        )}

        {viewMode === 'day' && mobileDayData && (
          <div className='divide-y divide-border-subtle/70 px-4 py-3'>
            {renderMobileEvents(mobileDayData.morning)}
            {renderMobileEvents(mobileDayData.afternoon)}
            {renderMobileEvents(mobileDayData.evening)}
          </div>
        )}

        {viewMode === 'week' && mobileDayData && (
          <div className='divide-y divide-border-subtle/70 px-4 py-3'>
            {renderMobileEvents(mobileDayData.morning)}
            {renderMobileEvents(mobileDayData.afternoon)}
            {renderMobileEvents(mobileDayData.evening)}
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
            monthDates={monthDates}
            anchorDate={filters.date}
            itemsByDate={monthItemsByDate}
            onOpenSchedule={openSchedule}
            onSelectDate={handleMonthSelect}
            formatTime={formatTimeOnly}
          />
        )}
      </div>
    </>
  )
}
