import { useSchedulesStore } from '@/stores/schedulesStore'
import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'
import { CaretDown, Clock, CalendarBlank, Funnel } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import clsx from 'clsx'
import { Badge, Button, Card, Input } from '@/components/ui'
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
import MotifLegend from '@/components/calendar/MotifLegend'
import EventCard, { CalendarEmptyState } from '@/components/calendar/EventCard'
import { getFamilyKey, type MotifFamilyKey } from '@/lib/motifFamilies'

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
const PERIOD_LABELS = [
  { key: 'morning' as const, label: 'Matinée', hours: '09:00 - 13:00', color: '#4a8fb8' },
  { key: 'afternoon' as const, label: 'Après-midi', hours: '14:00 - 16:00', color: '#c4925a' },
  { key: 'evening' as const, label: 'Soirée', hours: '16:00 - 18:00', color: '#7a8a96' },
]

interface MotifItem {
  id: string
  name: string
  color: string
  bookingType?: string
}

function getWeekDates(date: string) {
  const monday = parseLocalDate(getMondayOfWeek(date))
  return Array.from({ length: 6 }, (_, index) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + index)
    return next
  })
}

function formatWeekLabel(date: string) {
  const monday = parseLocalDate(getMondayOfWeek(date))
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)
  return `${monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} → ${saturday.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })}`
}

function formatTimeOnly(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function Calendar() {
  return (
    <div
      className='bo-page'
    >
      <div className='bo-page-inner flex h-full flex-col p-0 text-secondary lg:p-4'>
        <Planner />
      </div>
    </div>
  )
}

function DropdownSelect({
  value,
  onChange,
  placeholder,
  options,
  open,
  onOpen,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  open: string | null
  onOpen: (v: string) => void
  id: string
}) {
  const label = value ? (options.find((o) => o.value === value)?.label ?? placeholder) : placeholder
  return (
    <div className='relative'>
      <Button
        type='button'
        variant='outline'
        onClick={() => onOpen(id)}
        className='h-auto w-full justify-between gap-1.5 px-2.5 py-2 text-[12px] font-medium'
      >
        <span className={value ? 'text-secondary' : 'text-secondary/40'}>{label}</span>
        <CaretDown size={10} className={clsx('shrink-0 text-secondary/40', open === id && 'rotate-180')} />
      </Button>
      {open === id && (
        <div
          className='absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-bo-elevated'
        >
          <button
            type='button'
            onClick={() => {
              onChange('')
              onOpen('')
            }}
            className={clsx('flex w-full items-center px-3 py-2 text-left text-[12px] transition hover:bg-secondary/[0.03]', !value ? 'text-primary' : 'text-secondary/60')}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type='button'
              onClick={() => {
                onChange(opt.value)
                onOpen('')
              }}
              className={clsx('flex w-full items-center px-3 py-2 text-left text-[12px] transition hover:bg-secondary/[0.03]', value === opt.value ? 'text-primary' : 'text-secondary/75')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
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
  const [mobileDayIdx, setMobileDayIdx] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [filterPractitionerId, setFilterPractitionerId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMotifId, setFilterMotifId] = useState('')
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [motifOptions, setMotifOptions] = useState<MotifItem[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(true)
  const [activeFamilies, setActiveFamilies] = useState<Set<MotifFamilyKey>>(new Set())
  const [hiddenFamilies, setHiddenFamilies] = useState<Set<MotifFamilyKey>>(new Set())
  const [expandedFamily, setExpandedFamily] = useState<MotifFamilyKey | null>(null)

  const motifById = useMemo(() => new Map(motifOptions.map((m) => [m.id, m])), [motifOptions])

  useEffect(() => {
    api.get('users/doctors').then((res) => setDoctors(res.data || [])).catch(() => {})
    api.get('motifs').then((res) => setMotifOptions(res.data || [])).catch(() => {})
  }, [])

  const searchLower = filters.term.trim().toLowerCase()

  const filteredItems = useMemo(() => {
    const hasFilter = filterPractitionerId || filterStatus || filterMotifId || activeFamilies.size > 0 || searchLower
    return items.map((day) => {
      const filterPeriod = (schedules: typeof day.morning) =>
        schedules.filter((s) => {
          const a = s.appointment
          if (!a) return false
          if (!hasFilter && (a.status === 'CANCELLED' || a.status === 'COMPLETED')) return false
          if (filterPractitionerId && a.practitionerId !== filterPractitionerId) return false
          if (filterStatus && a.status !== filterStatus) return false
          if (filterMotifId && a.motif?.id !== filterMotifId) return false

          const motifMeta = a.motif?.id ? motifById.get(a.motif.id) : undefined
          const familyKey = getFamilyKey(motifMeta?.bookingType)
          if (hiddenFamilies.has(familyKey)) return false
          if (activeFamilies.size > 0 && !activeFamilies.has(familyKey)) return false

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
    })
  }, [items, filterPractitionerId, filterStatus, filterMotifId, activeFamilies, hiddenFamilies, searchLower, motifById])

  const displayItems = filteredItems
  const displayTotal = useMemo(
    () => displayItems.reduce((sum, day) => sum + day.morning.length + day.afternoon.length + day.evening.length, 0),
    [displayItems],
  )

  const { markOpened, isOpened } = useOpenedKeys()

  const toggleFamilyFilter = (key: MotifFamilyKey) => {
    setActiveFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleHiddenFamily = (key: MotifFamilyKey) => {
    setHiddenFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

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

  useEffect(() => {
    if (!showDatePicker) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDatePicker])

  const activeFilterCount = [filterPractitionerId, filterStatus, filterMotifId].filter(Boolean).length

  const filterPanel = showFilters && (
    <>
      <div className='fixed inset-0 z-40' onClick={() => { setShowFilters(false); setOpenDropdown(null) }} />
      <div
        className='absolute right-0 top-full z-50 mt-2 flex min-w-[280px] flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-bo-elevated'
      >
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>Filtrer par</span>
          {activeFilterCount > 0 && (
            <Button
              type='button'
              variant='link'
              onClick={() => {
                setFilterPractitionerId('')
                setFilterStatus('')
                setFilterMotifId('')
              }}
              className='h-auto p-0 text-[10px] font-medium'
            >
              Réinitialiser
            </Button>
          )}
        </div>
        <DropdownSelect
          value={filterPractitionerId}
          onChange={setFilterPractitionerId}
          placeholder='Tous les praticiens'
          options={doctors.map((d) => ({ value: d.id, label: d.name }))}
          open={openDropdown}
          onOpen={(v) => setOpenDropdown(openDropdown === v ? null : v)}
          id='practitioner'
        />
        <DropdownSelect
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder='Tous les statuts'
          options={[
            { value: 'PENDING', label: 'En attente' },
            { value: 'CONFIRMED', label: 'Confirmé' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'CANCELLED', label: 'Annulé' },
          ]}
          open={openDropdown}
          onOpen={(v) => setOpenDropdown(openDropdown === v ? null : v)}
          id='status'
        />
        <DropdownSelect
          value={filterMotifId}
          onChange={setFilterMotifId}
          placeholder='Tous les motifs'
          options={motifOptions.map((m) => ({ value: m.id, label: m.name }))}
          open={openDropdown}
          onOpen={(v) => setOpenDropdown(openDropdown === v ? null : v)}
          id='motif'
        />
      </div>
    </>
  )

  const openSchedule = (schedule: (typeof items)[0]['morning'][0]) => {
    setItem(schedule)
    toggleOpenShowModal()
    markOpened(schedule.id)
  }

  return (
    <Card
      className='flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-none py-0 lg:rounded-2xl'
    >
      <CalendarControlBar
        weekLabel={formatWeekLabel(filters.date)}
        slotCount={displayTotal}
        searchTerm={filters.term}
        onSearchChange={(term) => setFilters({ ...filters, term })}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend((v) => !v)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        activeFilterCount={activeFilterCount}
        onPrevWeek={() => {
          const nextDate = parseLocalDate(filters.date)
          nextDate.setDate(nextDate.getDate() - 7)
          setFilters({ ...filters, date: formatLocalDate(nextDate) })
        }}
        onNextWeek={() => {
          const nextDate = parseLocalDate(filters.date)
          nextDate.setDate(nextDate.getDate() + 7)
          setFilters({ ...filters, date: formatLocalDate(nextDate) })
        }}
        onToday={() => {
          const today = new Date()
          const dayOfWeek = today.getDay()
          setMobileDayIdx(dayOfWeek === 0 ? 0 : dayOfWeek - 1)
          setFilters({ ...filters, date: formatLocalDate(new Date()) })
        }}
        dateValue={filters.date}
        onDateChange={(date) => setFilters({ ...filters, date })}
        compact={false}
      >
        {filterPanel}
      </CalendarControlBar>

      {showLegend && (
        <div className='border-b border-border bg-secondary/[0.015] px-4 py-3 sm:px-5 lg:px-6'>
          <p className='mb-2 text-[10px] uppercase tracking-[0.16em] text-secondary/40'>Familles</p>
          <MotifLegend
            expanded={showLegend}
            activeFamilies={activeFamilies}
            hiddenFamilies={hiddenFamilies}
            slotCount={displayTotal}
            onToggleFamily={toggleFamilyFilter}
            onToggleHidden={toggleHiddenFamily}
            onExpandFamily={setExpandedFamily}
            expandedFamily={expandedFamily}
          />
        </div>
      )}

      {/* Mobile day strip */}
      <div className='flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden'>
        {weekDates.map((date, idx) => {
          const isToday = formatLocalDate(date) === formatLocalDate(new Date())
          const isActive = idx === mobileDayIdx
          return (
            <button
              key={idx}
              onClick={() => setMobileDayIdx(idx)}
              className='flex min-w-[38px] shrink-0 flex-col items-center gap-0.5 py-1'
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
        <div className='ml-auto flex items-center gap-1'>
          <Button type='button' variant='ghost' size='icon-sm' onClick={() => setShowFilters((v) => !v)} className='text-secondary/50'>
            <Funnel size={14} />
          </Button>
          <div className='relative' ref={pickerRef}>
            <Button type='button' variant='ghost' size='icon-sm' onClick={() => setShowDatePicker((v) => !v)} className='text-secondary/50'>
              <CalendarBlank size={14} />
            </Button>
            {showDatePicker && (
              <div className='absolute right-0 top-full z-50 mt-1 w-[260px] rounded-xl border border-border bg-card p-3 shadow-bo-elevated'>
                <Input
                  type='date'
                  value={filters.date}
                  onChange={(e) => {
                    const date = parseLocalDate(e.target.value)
                    const dayOfWeek = date.getDay()
                    setMobileDayIdx(dayOfWeek === 0 ? 0 : dayOfWeek - 1)
                    setFilters({ ...filters, date: e.target.value })
                    setShowDatePicker(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {displayTotal === 0 ? (
        <CalendarEmptyState message='Aucun rendez-vous ne correspond aux familles sélectionnées' />
      ) : (
        <>
          <div className='flex-1 overflow-y-auto lg:hidden'>
            {displayItems[mobileDayIdx] ? (
              <div className='divide-y divide-black/[0.04]'>
                {PERIOD_LABELS.map((period) => {
                  const schedules = displayItems[mobileDayIdx]?.[period.key] || []
                  return (
                    <div key={period.key} className='px-4 py-3'>
                      <div className='mb-3 flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full' style={{ backgroundColor: period.color }} />
                        <span className='text-[11px] font-semibold text-secondary'>{period.label}</span>
                        <span className='text-[10px] text-secondary/40'>{period.hours}</span>
                      </div>
                      {schedules.length === 0 ? (
                        <p className='py-4 text-center text-[11px] uppercase tracking-[0.12em] text-secondary/30'>Libre</p>
                      ) : (
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
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className='hidden min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2 lg:block'>
            <div className='grid h-full min-w-[980px] grid-cols-[7rem_repeat(6,minmax(0,1fr))] grid-rows-[4.9rem_repeat(3,minmax(0,1fr))] overflow-hidden rounded-xl border border-border-subtle bg-secondary/[0.01]'>
              <div className='sticky left-0 z-20 border-b border-r border-border-subtle bg-card px-3.5 py-3'>
                <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>Périodes</p>
                <p className='mt-1.5 text-sm text-secondary'>Jour / heure</p>
              </div>

              {DAY_LABELS.map((dayLabel, dayIdx) => {
                const date = weekDates[dayIdx]
                const isToday = formatLocalDate(date) === formatLocalDate(new Date())
                return (
                  <div
                    key={dayLabel}
                    className={clsx(
                      'sticky top-0 z-10 border-b border-r border-border-subtle px-3.5 py-3 last:border-r-0',
                      isToday ? 'bg-primary/[0.04]' : 'bg-card',
                    )}
                  >
                    <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>
                      {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <div className='mt-1.5 flex items-center justify-between gap-3'>
                      <p className='text-sm text-secondary'>{dayLabel}</p>
                      {isToday && (
                        <Badge variant='outline' className='rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary'>
                          Aujourd&apos;hui
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}

              {PERIOD_LABELS.map((period) => (
                <div key={period.key} className='contents'>
                  <div className='sticky left-0 z-10 flex h-full flex-col justify-between border-r border-t border-border-subtle bg-card px-3.5 py-3.5'>
                    <p className='text-sm text-secondary'>{period.label}</p>
                    <div className='inline-flex h-[28px] w-fit items-center gap-1 rounded-full border border-border-subtle bg-secondary/[0.02] px-2 text-[10px] text-secondary/50'>
                      <Clock size={11} className='text-primary' />
                      {period.hours}
                    </div>
                  </div>

                  {DAY_LABELS.map((dayLabel, dayIdx) => {
                    const day = displayItems[dayIdx]
                    const schedules = day?.[period.key] || []
                    return (
                      <div key={`${dayLabel}-${period.key}`} className='h-full min-h-0 border-r border-t border-border-subtle bg-card/60 p-2 last:border-r-0'>
                        <div className='flex h-full min-h-0 flex-col gap-2 rounded-lg border border-border-subtle p-2'>
                          {schedules.length === 0 ? (
                            <div className='flex h-full items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-xs uppercase tracking-[0.16em] text-secondary/30'>
                              Libre
                            </div>
                          ) : (
                            <>
                              {schedules.slice(0, 2).map((schedule) => (
                                <EventCard
                                  key={schedule.id}
                                  schedule={schedule}
                                  formatTime={formatTimeOnly}
                                  isUnread={!isOpened(schedule.id)}
                                  variant='grid'
                                  onClick={() => openSchedule(schedule)}
                                />
                              ))}
                              {schedules.length > 2 && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  onClick={() => openSchedule(schedules[2])}
                                  className='h-auto shrink-0 border-dashed bg-secondary/[0.02] px-3 py-1.5 text-center text-[11px] font-medium text-secondary/50 hover:border-primary/30 hover:text-primary'
                                >
                                  +{schedules.length - 2} de plus
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
