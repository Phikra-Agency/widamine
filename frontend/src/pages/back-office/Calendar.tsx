import { useSchedulesStore } from '@/stores/schedulesStore'
import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'
import { CaretLeft, CaretRight, CaretDown, Clock, CalendarBlank, Funnel } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import clsx from 'clsx'
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

const OPENED_STORAGE_KEY = 'calendar-opened-keys'

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
  { key: 'morning', label: 'Matinée', hours: '09:00 - 13:00', color: '#2e90c0' },
  { key: 'afternoon', label: 'Après-midi', hours: '14:00 - 16:00', color: '#e8944a' },
  { key: 'evening', label: 'Soirée', hours: '16:00 - 18:00', color: '#8b6ec4' },
] as const

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner flex h-full flex-col text-secondary p-0 lg:p-6'>
        <Planner />
      </div>
    </motion.div>
  )
}

interface MotifItem {
  id: string
  name: string
  color: string
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
  const label = value ? options.find(o => o.value === value)?.label ?? placeholder : placeholder
  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => onOpen(id)}
        className='flex w-full items-center justify-between gap-1.5 rounded-lg border border-white/10 bg-white/8 px-2.5 py-2 text-[12px] font-medium text-white/80 outline-none transition focus:border-primary/40 focus:ring-1 focus:ring-primary/30'
      >
        <span className={value ? 'text-white/90' : 'text-white/40'}>{label}</span>
        <CaretDown
          size={10}
          className={`shrink-0 text-white/40 transition-transform ${open === id ? 'rotate-180' : ''}`}
        />
      </button>
      {open === id && (
        <motion.div
          initial={{ opacity: 0, y: -2, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.1 }}
          className='absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] backdrop-blur-xl shadow-xl'
        >
          <button
            type='button'
            onClick={() => { onChange(''); onOpen('') }}
            className={`flex w-full items-center px-3 py-2 text-left text-[12px] transition hover:bg-white/8 ${
              !value ? 'text-white' : 'text-white/50'
            }`}
          >
            {placeholder}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              type='button'
              onClick={() => { onChange(opt.value); onOpen('') }}
              className={`flex w-full items-center px-3 py-2 text-left text-[12px] transition hover:bg-white/8 ${
                value === opt.value ? 'text-white' : 'text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function MotifLegend() {
  const [motifs, setMotifs] = useState<MotifItem[]>([])

  useEffect(() => {
    api.get('motifs').then(res => {
      const data = res.data as MotifItem[]
      setMotifs(data.filter((m) => m.name && m.color))
    }).catch(() => {})
  }, [])

  if (motifs.length === 0) {
    return <p className='text-[12px] text-white/40'>Chargement des motifs...</p>
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {motifs.map(m => (
        <div
          key={m.id}
          className='flex items-center gap-1.5 rounded-md border px-2.5 py-1 shadow-sm'
          style={{
            backgroundColor: `${m.color}25`,
            borderColor: `${m.color}40`,
            color: 'white'
          }}
        >
          <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: m.color }} />
          <span className='text-[11px] font-semibold'>{m.name}</span>
        </div>
      ))}
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
  const [pickerOffset, setPickerOffset] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [filterPractitionerId, setFilterPractitionerId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMotifId, setFilterMotifId] = useState('')
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])
  const [motifOptions, setMotifOptions] = useState<MotifItem[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    api.get('users/doctors').then(res => setDoctors(res.data || [])).catch(() => {})
    api.get('motifs').then(res => setMotifOptions(res.data || [])).catch(() => {})
  }, [])

  const filteredItems = useMemo(() => {
    const hasFilter = filterPractitionerId || filterStatus || filterMotifId
    return items.map(day => {
      const filterPeriod = (schedules: typeof day.morning) =>
        schedules.filter(s => {
          const a = s.appointment
          if (!a) return false
          if (!hasFilter && (a.status === 'CANCELLED' || a.status === 'COMPLETED')) return false
          if (filterPractitionerId && a.practitionerId !== filterPractitionerId) return false
          if (filterStatus && a.status !== filterStatus) return false
          if (filterMotifId && a.motif?.id !== filterMotifId) return false
          return true
        })
      return {
        morning: filterPeriod(day.morning),
        afternoon: filterPeriod(day.afternoon),
        evening: filterPeriod(day.evening),
      }
    })
  }, [items, filterPractitionerId, filterStatus, filterMotifId])

  const displayItems = filteredItems
  const displayTotal = useMemo(
    () => displayItems.reduce((sum, day) => sum + day.morning.length + day.afternoon.length + day.evening.length, 0),
    [displayItems],
  )

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
      const schedule = await resolveScheduleForOpen(
        items,
        effectivePending.appointmentId,
        effectivePending.scheduleKey,
      )
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
  }, [
    effectivePending,
    items,
    fetchedDate,
    fetchItems,
    openShowSchedule,
    searchParams,
    setSearchParams,
    clearPendingCalendarOpen,
  ])

  useEffect(() => {
    if (!showDatePicker) return
    setPickerOffset(0)
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDatePicker])

  const pickerDate = parseLocalDate(filters.date)

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className='bo-surface flex h-full min-h-0 flex-1 flex-col rounded-none lg:rounded-2xl border-0 lg:border'
    >
      <div className='shrink-0 border-b border-[#26445a]/22 bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] text-white'>
        <div className='lg:hidden'>
          <div className='flex items-center justify-between px-5 pt-2.5 pb-1 mt-[30px]'>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={() => {
                  const nextDate = parseLocalDate(filters.date)
                  nextDate.setDate(nextDate.getDate() - 7)
                  setFilters({ ...filters, date: formatLocalDate(nextDate) })
                }}
                className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/60 backdrop-blur-sm transition hover:bg-white/[0.14] hover:text-white active:scale-90'
              >
                <CaretLeft size={8} />
              </button>
              <span className='text-[12px] font-semibold text-white/70 tracking-tight'>
                {weekDates[0].toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                }).replace('.', '')}
              </span>
              <button
                type='button'
                onClick={() => {
                  const nextDate = parseLocalDate(filters.date)
                  nextDate.setDate(nextDate.getDate() + 7)
                  setFilters({ ...filters, date: formatLocalDate(nextDate) })
                }}
                className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/60 backdrop-blur-sm transition hover:bg-white/[0.14] hover:text-white active:scale-90'
              >
                <CaretRight size={8} />
              </button>
            </div>
              <div className='flex items-center gap-2'>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setShowFilters(prev => !prev)}
                  className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/50 backdrop-blur-sm transition hover:bg-white/[0.14] hover:text-white'
                >
                  <Funnel size={11} />
                  {(filterPractitionerId || filterStatus || filterMotifId) && (
                    <span className='absolute -right-0.5 -top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-white'>
                      {[filterPractitionerId, filterStatus, filterMotifId].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <>
                    <div className='fixed inset-0 z-40' onClick={() => { setShowFilters(false); setOpenDropdown(null) }} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 top-full z-50 mt-2 flex w-[280px] flex-col gap-2 rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] px-3 py-2.5 backdrop-blur-xl shadow-xl'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-[10px] uppercase tracking-[0.2em] text-white/40'>Filtrer par</span>
                        {(filterPractitionerId || filterStatus || filterMotifId) && (
                          <button
                            type='button'
                            onClick={() => { setFilterPractitionerId(''); setFilterStatus(''); setFilterMotifId('') }}
                            className='text-[10px] font-medium text-white/40 underline transition hover:text-white/70'
                          >
                            Réinitialiser
                          </button>
                        )}
                      </div>

                      <DropdownSelect
                        value={filterPractitionerId}
                        onChange={setFilterPractitionerId}
                        placeholder='Tous les praticiens'
                        options={doctors.map(d => ({ value: d.id, label: d.name }))}
                        open={openDropdown}
                        onOpen={(v) => setOpenDropdown(openDropdown === 'practitioner' ? null : 'practitioner')}
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
                        onOpen={(v) => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                        id='status'
                      />

                      <DropdownSelect
                        value={filterMotifId}
                        onChange={setFilterMotifId}
                        placeholder='Tous les motifs'
                        options={motifOptions.map(m => ({ value: m.id, label: m.name }))}
                        open={openDropdown}
                        onOpen={(v) => setOpenDropdown(openDropdown === 'motif' ? null : 'motif')}
                        id='motif'
                      />
                    </motion.div>
                  </>
                )}
              </div>

              <button
                type='button'
                onClick={() => {
                  const today = new Date()
                  const dayOfWeek = today.getDay()
                  setMobileDayIdx(dayOfWeek === 0 ? 0 : dayOfWeek - 1)
                  setFilters({ ...filters, date: formatLocalDate(new Date()) })
                }}
                className='text-[10px] font-semibold text-white/50 transition hover:text-white/80'
              >
                Auj
              </button>
              <div className='relative' ref={pickerRef}>
                  <button
                    type='button'
                    onClick={() => setShowDatePicker(prev => !prev)}
                    className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/50 backdrop-blur-sm transition hover:bg-white/[0.14] hover:text-white'
                  >
                    <CalendarBlank size={11} />
                  </button>

                  {showDatePicker && (() => {
                    const viewDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + pickerOffset, 1)
                    const year = viewDate.getFullYear()
                    const month = viewDate.getMonth()
                    const daysInMonth = new Date(year, month + 1, 0).getDate()
                    const firstDay = new Date(year, month, 1).getDay()
                    const firstDayIdx = firstDay === 0 ? 6 : firstDay - 1
                    const today = new Date()
                    const blanks = Array.from({ length: firstDayIdx })
                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                    const isToday = (d: number) =>
                      year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
                    const isSelected = (d: number) =>
                      year === pickerDate.getFullYear() && month === pickerDate.getMonth() && d === pickerDate.getDate()

                    return (
                      <div className='absolute right-0 top-full mt-2 z-50 w-[260px] rounded-xl border border-white/10 bg-[#0d2234] p-3 shadow-2xl backdrop-blur-xl'>
                        <div className='mb-3 flex items-center justify-between'>
                          <button
                            type='button'
                            onClick={(e) => { e.stopPropagation(); setPickerOffset(prev => prev - 1) }}
                            className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/60 transition hover:bg-white/[0.14] hover:text-white'
                          >
                            <CaretLeft size={8} />
                          </button>
                          <span className='text-[11px] font-semibold text-white/80'>
                            {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            type='button'
                            onClick={(e) => { e.stopPropagation(); setPickerOffset(prev => prev + 1) }}
                            className='flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/60 transition hover:bg-white/[0.14] hover:text-white'
                          >
                            <CaretRight size={8} />
                          </button>
                        </div>

                        <div className='mb-1 grid grid-cols-7'>
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => (
                            <div key={d} className='py-1 text-center text-[9px] font-semibold uppercase text-white/35'>
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className='grid grid-cols-7'>
                          {blanks.map((_, i) => (
                            <div key={`b${i}`} />
                          ))}
                          {days.map((d) => (
                            <button
                              key={d}
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation()
                                const date = new Date(year, month, d)
                                const dayOfWeek = date.getDay()
                                setMobileDayIdx(dayOfWeek === 0 ? 0 : dayOfWeek - 1)
                                setFilters({ ...filters, date: formatLocalDate(date) })
                                setShowDatePicker(false)
                              }}
                              className={`rounded-full py-1 text-center text-[11px] font-semibold transition ${
                                isSelected(d)
                                  ? 'bg-primary text-white shadow-[0_2px_6px_rgba(46,144,192,0.3)]'
                                  : isToday(d)
                                    ? 'text-white/80 ring-1 ring-inset ring-white/20'
                                    : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
            </div>
          </div>

          <div className='flex gap-1 overflow-x-auto px-5 pb-2.5'>
            {weekDates.map((date, idx) => {
              const isToday = formatLocalDate(date) === formatLocalDate(new Date())
              const isActive = idx === mobileDayIdx
              return (
                <button
                  key={idx}
                  onClick={() => setMobileDayIdx(idx)}
                  className='flex shrink-0 flex-col items-center gap-0.5 py-1 transition-all duration-200 min-w-[38px]'
                >
                  <span className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${
                    isActive ? 'text-white/80' : 'text-white/35'
                  }`}>
                    {DAY_LABELS[idx].slice(0, 3)}
                  </span>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-[0_2px_8px_rgba(46,144,192,0.35)]'
                      : isToday
                        ? 'text-white/70 ring-1 ring-inset ring-white/20'
                        : 'text-white/45 hover:text-white/70'
                  }`}>
                    {date.toLocaleDateString('fr-FR', { day: '2-digit' })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className='hidden lg:block px-6 py-3.5'>
          <div className='flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between'>
            <div className='space-y-2'>
              <p className='text-[11px] uppercase tracking-[0.32em] text-white/48'>Légende des motifs</p>
              <MotifLegend />
            </div>

            <div className='flex flex-col gap-1.5 xl:min-w-[27rem] xl:items-end'>
              <div className='flex flex-col gap-3 rounded-[1.1rem] border border-white/10 bg-white/7 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between xl:min-w-[27rem]'>
                <div>
                  <p className='text-[10px] uppercase tracking-[0.26em] text-white/42'>Semaine active</p>
                  <p className='mt-1 text-[13px] text-white'>{formatWeekLabel(filters.date)}</p>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <MiniMetric label='Créneaux' value={displayTotal} />
                  <MiniMetric label='Jours' value={6} />
                </div>
              </div>

              <div className='inline-flex flex-wrap items-center justify-end gap-1.5'>
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setShowFilters(prev => !prev)}
                    className='inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 text-[11px] font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/14 hover:text-white'
                  >
                    <Funnel size={12} />
                    {(filterPractitionerId || filterStatus || filterMotifId) && (
                      <span className='grid h-[18px] w-[18px] place-items-center rounded-full bg-primary text-[10px] font-bold leading-none text-white'>
                        {[filterPractitionerId, filterStatus, filterMotifId].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  {showFilters && (
                    <>
                      <div className='fixed inset-0 z-40' onClick={() => { setShowFilters(false); setOpenDropdown(null) }} />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 top-full z-50 mt-2 flex flex-col gap-2 rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] px-3 py-2.5 backdrop-blur-xl shadow-xl min-w-[360px]'
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <span className='text-[10px] uppercase tracking-[0.2em] text-white/40'>Filtrer par</span>
                          {(filterPractitionerId || filterStatus || filterMotifId) && (
                            <button
                              type='button'
                              onClick={() => { setFilterPractitionerId(''); setFilterStatus(''); setFilterMotifId('') }}
                              className='text-[10px] font-medium text-white/40 underline transition hover:text-white/70'
                            >
                              Réinitialiser
                            </button>
                          )}
                        </div>

                        <DropdownSelect
                          value={filterPractitionerId}
                          onChange={setFilterPractitionerId}
                          placeholder='Tous les praticiens'
                          options={doctors.map(d => ({ value: d.id, label: d.name }))}
                          open={openDropdown}
                          onOpen={(v) => setOpenDropdown(openDropdown === 'practitioner' ? null : 'practitioner')}
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
                          onOpen={(v) => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                          id='status'
                        />

                        <DropdownSelect
                          value={filterMotifId}
                          onChange={setFilterMotifId}
                          placeholder='Tous les motifs'
                          options={motifOptions.map(m => ({ value: m.id, label: m.name }))}
                          open={openDropdown}
                          onOpen={(v) => setOpenDropdown(openDropdown === 'motif' ? null : 'motif')}
                          id='motif'
                        />
                      </motion.div>
                    </>
                  )}
                </div>

                <button
                  type='button'
                  onClick={() => {
                    const nextDate = parseLocalDate(filters.date)
                    nextDate.setDate(nextDate.getDate() - 7)
                    setFilters({ ...filters, date: formatLocalDate(nextDate) })
                  }}
                  className='flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/12'
                >
                  <CaretLeft size={16} />
                </button>
                <button
                  type='button'
                  onClick={() => {
                    const nextDate = parseLocalDate(filters.date)
                    nextDate.setDate(nextDate.getDate() + 7)
                    setFilters({ ...filters, date: formatLocalDate(nextDate) })
                  }}

                  className='flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/12'
                >
                  <CaretRight size={16} />
                </button>
                <label className='inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-sm text-white/80'>
                  <input
                    type='date'
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    value={filters.date}
                    className='bg-transparent text-sm text-white outline-none'
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='lg:hidden flex-1 overflow-y-auto'>
        {displayItems[mobileDayIdx] ? (
          <div className='divide-y divide-black/[0.04]'>
            {PERIOD_LABELS.map((period) => {
              const schedules = displayItems[mobileDayIdx]?.[period.key] || []
              return (
                <div key={period.key} className='px-5 py-3'>
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full' style={{ backgroundColor: period.color }} />
                    <span className='text-[11px] font-semibold text-secondary'>{period.label}</span>
                    <span className='text-[10px] text-secondary/40'>{period.hours}</span>
                    {schedules.length > 0 && (
                      <span className='ml-auto text-[10px] font-medium text-secondary/40'>
                        {schedules.length} créneau{schedules.length > 1 ? 'x' : ''}
                      </span>
                    )}
                  </div>
                  {schedules.length === 0 ? (
                    <p className='py-6 text-center text-[11px] uppercase tracking-[0.12em] text-secondary/30'>
                      Libre
                    </p>
                  ) : (
                    <div className='space-y-1.5'>
                      {schedules.map((schedule) => {
                        const color = schedule.appointment?.motif?.color || period.color
                        return (
                          <button
                            key={schedule.id}
                            type='button'
                            onClick={() => {
                              setItem(schedule)
                              toggleOpenShowModal()
                              markOpened(schedule.id)
                            }}
                            className='flex w-full items-center gap-3 rounded-lg border border-black/[0.04] bg-white px-3 py-2.5 text-left transition hover:border-primary/20'
                          >
                            <div
                              className='shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-white'
                              style={{ backgroundColor: color }}
                            >
                              {formatTimeOnly(schedule.datetime)}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-[12px] font-medium text-secondary'>
                                {schedule.appointment?.motif?.name || schedule.session.service.name}
                              </p>
                              <p className='text-[10px] text-secondary/40'>
                                {schedule.session.service.name} · S{schedule.session.session}
                              </p>
                            </div>
                            {!isOpened(schedule.id) && (
                              <div className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: color }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center text-[12px] uppercase tracking-[0.16em] text-secondary/30'>
            Aucun rendez-vous
          </div>
        )}
      </div>

      <div className='hidden lg:block min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2'>
          <div className='grid h-full min-w-[980px] grid-cols-[7rem_repeat(6,minmax(0,1fr))] grid-rows-[4.9rem_repeat(3,minmax(0,1fr))] overflow-hidden rounded-xl border border-black/[0.04] bg-secondary/[0.01]'>
            <div className='sticky left-0 z-20 border-b border-r border-black/[0.04] bg-white px-3.5 py-3'>
              <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>Périodes</p>
              <p className='mt-1.5 text-sm text-secondary'>Jour / heure</p>
            </div>

            {DAY_LABELS.map((dayLabel, dayIdx) => {
              const date = weekDates[dayIdx]
              const isToday = formatLocalDate(date) === formatLocalDate(new Date())
              return (
                <div
                  key={dayLabel}
                  className={`sticky top-0 z-10 border-b border-r border-black/[0.04] px-3.5 py-3 last:border-r-0 ${
                    isToday ? 'bg-[linear-gradient(180deg,rgba(88,177,224,0.08)_0%,rgba(255,255,255,1)_100%)]' : 'bg-white'
                  }`}
                >
                  <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>
                    {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </p>
                  <div className='mt-1.5 flex items-center justify-between gap-3'>
                    <p className='text-sm text-secondary'>{dayLabel}</p>
                    {isToday ? (
                      <span className='rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-primary font-medium'>
                        Aujourd'hui
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}

            {PERIOD_LABELS.map((period) => (
              <div key={period.key} className='contents'>
                <div className='sticky left-0 z-10 flex h-full flex-col justify-between border-r border-t border-black/[0.04] bg-white px-3.5 py-3.5'>
                  <p className='text-sm text-secondary'>{period.label}</p>
                  <div className='inline-flex h-[28px] w-fit items-center whitespace-nowrap gap-1 rounded-full border border-black/[0.04] bg-secondary/[0.02] px-2 py-0 text-[10px] leading-none text-secondary/50'>
                    <Clock size={11} className='text-primary' />
                    {period.hours}
                  </div>
                </div>

                {DAY_LABELS.map((dayLabel, dayIdx) => {
                  const day = displayItems[dayIdx]
                  const schedules = day?.[period.key] || []

                  return (
                    <div
                      key={`${dayLabel}-${period.key}`}
                      className='h-full min-h-0 border-r border-t border-black/[0.04] bg-white/50 p-2 last:border-r-0'
                    >
                        <div
                          className={clsx(
                            'flex h-full min-h-0 flex-col gap-3 rounded-lg border p-2',
                            'border-black/[0.03]',
                          )}
                        >
                        {schedules.length === 0 ? (
                          <div className='flex h-full items-center justify-center rounded-lg border border-dashed border-black/[0.08] bg-secondary/[0.01] px-3 text-center text-xs uppercase tracking-[0.16em] text-secondary/30'>
                            Libre
                          </div>
                        ) : (
                          <>
                                {schedules.slice(0, 2).map((schedule) => {
                                  const color = schedule.appointment?.motif?.color || '#2e90c0'
                                  const key = schedule.id
                                  return (
                                    <div key={key} className='relative group/sched'>
                                      <button
                                        type='button'
                                        onClick={() => {
                                          setItem(schedule)
                                          toggleOpenShowModal()
                                          markOpened(key)
                                        }}
                                        className='w-full shrink-0 rounded-lg border border-black/[0.04] bg-white text-left transition hover:border-primary/20'
                                      >
                                        <div className='flex items-center gap-2 px-2.5 py-2'>
                                          <div
                                            className='flex shrink-0 items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold text-white'
                                            style={{ backgroundColor: color }}
                                          >
                                            {formatTimeOnly(schedule.datetime)}
                                          </div>
                                          <div className='min-w-0 flex-1'>
                                            <p className='truncate text-[11px] font-medium leading-4 text-secondary'>{schedule.appointment?.motif?.name || schedule.session.service.name}</p>
                                            <p className='mt-0.5 text-[10px] text-secondary/40'>{schedule.session.service.name} · S{schedule.session.session}</p>
                                          </div>
                                          {!isOpened(key) && (
                                          <div
                                            className='h-1.5 w-1.5 shrink-0 rounded-full'
                                            style={{ backgroundColor: color }}
                                          />
                                          )}
                                        </div>
                                      </button>
                                  {/* Themed tooltip */}
                                  <div
                                    className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 opacity-0 group-hover/sched:opacity-100 transition-opacity duration-200'
                                  >
                                    <div
                                      className='rounded-lg px-3 py-2 text-white text-[11px] leading-snug shadow-lg whitespace-nowrap'
                                      style={{ backgroundColor: color }}
                                    >
                                      <p className='font-semibold'>{schedule.appointment?.motif?.name || schedule.session.service.name}</p>
                                      <p className='text-white/70 mt-0.5'>{formatTimeOnly(schedule.datetime)} · {schedule.session.service.name}</p>
                                      {schedule.appointment?.practitioner && (
                                        <p className='text-white/60 mt-0.5'>{schedule.appointment.practitioner.name}</p>
                                      )}
                                      {schedule.appointment?.resource && (
                                        <p className='text-white/60 mt-0.5'>{schedule.appointment.resource.name}</p>
                                      )}
                                    </div>
                                    <div
                                      className='mx-auto h-2 w-2 rotate-45 -mt-1'
                                      style={{ backgroundColor: color }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                            {schedules.length > 2 && (
                              <button
                                type='button'
                                onClick={() => {
                                  setItem(schedules[2])
                                  toggleOpenShowModal()
                                  markOpened(`${schedules[2].datetime}-${schedules[2].session.id}`)
                                }}
                                className='shrink-0 rounded-lg border border-dashed border-black/[0.08] bg-secondary/[0.02] px-3 py-1.5 text-center text-[11px] font-medium text-secondary/50 transition hover:border-primary/30 hover:text-primary'
                              >
                                +{schedules.length - 2} de plus
                              </button>
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
    </motion.section>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-[0.95rem] border border-white/10 bg-white/8 px-3 py-2.5'>
      <p className='text-[10px] uppercase tracking-[0.22em] text-white/40'>{label}</p>
      <p className='mt-1 text-lg text-white'>{value}</p>
    </div>
  )
}
