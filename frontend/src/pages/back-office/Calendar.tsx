import { useSchedulesStore } from '@/stores/schedulesStore'
import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'
import { CalendarBlank, CaretLeft, CaretRight, Clock, X } from '@phosphor-icons/react'
import { useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const PERIOD_LABELS = [
  { key: 'morning', label: 'Matinée', hours: '09:00 - 13:00', accent: 'bg-[#eef8fd]' },
  { key: 'afternoon', label: 'Après-midi', hours: '14:00 - 16:00', accent: 'bg-[#fff5ee]' },
  { key: 'evening', label: 'Soirée', hours: '16:00 - 18:00', accent: 'bg-[#f5f3fb]' },
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

function formatDateTimeLabel(value?: string) {
  if (!value) return 'Date non définie'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date non définie'

  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeOnly(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'

  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Calendar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className='h-full'
    >
      <div className='flex h-full flex-col gap-2 overflow-hidden text-secondary'>
        <Planner />
        <ShowModal />
      </div>
    </motion.div>
  )
}

function Planner() {
  const { items, filters, fetchItems, setFetchedDate, fetchedDate, setItem, toggleOpenShowModal, setFilters } =
    useSchedulesStore()
  const weekDates = useMemo(() => getWeekDates(filters.date), [filters.date])
  const total = useMemo(
    () => items.reduce((sum, day) => sum + day.morning.length + day.afternoon.length + day.evening.length, 0),
    [items],
  )

  useEffect(() => {
    const date = getMondayOfWeek(filters.date)
    fetchItems(date)
    setFetchedDate(date)
  }, [])

  useEffect(() => {
    const date = getMondayOfWeek(filters.date)
    if (fetchedDate !== date) {
      fetchItems(date)
      setFetchedDate(date)
    }
  }, [fetchItems, fetchedDate, filters.date, setFetchedDate])

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className='flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-[#e7d7cf] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f2_100%)] shadow-[0_24px_60px_rgba(10,31,47,0.07)]'
    >
      <div className='shrink-0 border-b border-[#26445a]/22 bg-[linear-gradient(135deg,#0d2234_0%,#16344e_58%,#1b4964_100%)] px-5 py-2.5 text-white'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between'>
          <div className='space-y-1'>
            <p className='text-[11px] uppercase tracking-[0.32em] text-white/48'>Calendrier clinique</p>
            <h1 className='text-[1.18rem] leading-tight text-white'>Planning hebdomadaire</h1>
            <p className='max-w-xl text-[12px] leading-5 text-white/62'>
              Une lecture claire des rendez-vous, pensée pour gérer la semaine sans bruit visuel.
            </p>
          </div>

          <div className='flex flex-col gap-1.5 xl:min-w-[27rem] xl:items-end'>
            <div className='flex flex-col gap-3 rounded-[1.1rem] border border-white/10 bg-white/7 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between xl:min-w-[27rem]'>
              <div>
                <p className='text-[10px] uppercase tracking-[0.26em] text-white/42'>Semaine active</p>
                <p className='mt-1 text-[13px] text-white'>{formatWeekLabel(filters.date)}</p>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <MiniMetric label='Créneaux' value={total} />
                <MiniMetric label='Jours' value={6} />
              </div>
            </div>

            <div className='inline-flex flex-wrap items-center justify-end gap-1.5'>
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
                <CalendarBlank size={16} className='text-[#8bd8ff]' />
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

      <div className='min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2'>
          <div className='grid h-full min-w-[980px] grid-cols-[7rem_repeat(6,minmax(0,1fr))] grid-rows-[4.9rem_repeat(3,minmax(0,1fr))] overflow-hidden rounded-[1.5rem] border border-[#ece1da] bg-[#fdf9f5]'>
            <div className='sticky left-0 z-20 border-b border-r border-[#ece1da] bg-[#fcfaf8] px-3.5 py-3'>
              <p className='text-[11px] uppercase tracking-[0.26em] text-[#90a0ae]'>Périodes</p>
              <p className='mt-1.5 text-sm text-[#10293f]'>Jour / heure</p>
            </div>

            {DAY_LABELS.map((dayLabel, dayIdx) => {
              const date = weekDates[dayIdx]
              const isToday = formatLocalDate(date) === formatLocalDate(new Date())
              return (
                <div
                  key={dayLabel}
                  className={`sticky top-0 z-10 border-b border-r border-[#ece1da] px-3.5 py-3 last:border-r-0 ${
                    isToday ? 'bg-[linear-gradient(180deg,rgba(88,177,224,0.14)_0%,rgba(255,255,255,1)_100%)]' : 'bg-white/95'
                  }`}
                >
                  <p className='text-[11px] uppercase tracking-[0.24em] text-[#90a0ae]'>
                    {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </p>
                  <div className='mt-1.5 flex items-center justify-between gap-3'>
                    <p className='text-sm text-[#10293f]'>{dayLabel}</p>
                    {isToday ? (
                      <span className='rounded-full bg-primary/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary'>
                        Aujourd’hui
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}

            {PERIOD_LABELS.map((period) => (
              <div key={period.key} className='contents'>
                <div className='sticky left-0 z-10 flex h-full flex-col justify-between border-r border-t border-[#ece1da] bg-[#fcfaf8] px-3.5 py-3.5'>
                  <p className='text-sm text-[#10293f]'>{period.label}</p>
                  <div className='inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white px-3 py-1.5 text-xs text-slate-500'>
                    <Clock size={14} className='text-primary' />
                    {period.hours}
                  </div>
                </div>

                {DAY_LABELS.map((dayLabel, dayIdx) => {
                  const day = items[dayIdx]
                  const schedules = day?.[period.key] || []

                  return (
                    <div
                      key={`${dayLabel}-${period.key}`}
                      className='h-full min-h-0 border-r border-t border-[#ece1da] bg-white/70 p-2 last:border-r-0'
                    >
                      <div
                        className={clsx(
                          'flex h-full min-h-0 flex-col gap-2 rounded-[1.15rem] border p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
                          period.accent,
                          'border-white/80',
                        )}
                      >
                        {schedules.length === 0 ? (
                          <div className='flex h-full items-center justify-center rounded-[0.95rem] border border-dashed border-[#ddcec5] bg-white/78 px-3 text-center text-xs uppercase tracking-[0.22em] text-slate-400'>
                            Libre
                          </div>
                        ) : (
                          schedules.map((schedule) => (
                            <button
                              key={`${schedule.session.id}-${schedule.datetime}`}
                              type='button'
                              onClick={() => {
                                setItem(schedule)
                                toggleOpenShowModal()
                              }}
                              className='h-full rounded-[1rem] border border-[#dce9f2] bg-[linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)] px-3 py-3 text-left shadow-[0_12px_24px_rgba(10,31,47,0.06)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_30px_rgba(10,31,47,0.08)]'
                            >
                              <div className='flex h-full flex-col justify-between gap-3'>
                                <div className='flex items-center justify-between gap-2'>
                                  <div className='rounded-full border border-primary/10 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary'>
                                    {formatTimeOnly(schedule.datetime)}
                                  </div>
                                  <div className='h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_6px_rgba(88,177,224,0.12)]' />
                                </div>
                                <div className='min-w-0'>
                                  <p className='line-clamp-3 text-sm leading-5 text-[#17324a]'>{schedule.session.service.name}</p>
                                  <p className='mt-2 text-xs uppercase tracking-[0.18em] text-slate-500'>Séance {schedule.session.session}</p>
                                </div>
                              </div>
                            </button>
                          ))
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

function ShowModal() {
  const { openShowModal, toggleOpenShowModal, item } = useSchedulesStore()

  return (
    <div
      onClick={toggleOpenShowModal}
      className={clsx(
        'absolute inset-0 z-20 flex items-center justify-center bg-black/32 p-4 backdrop-blur-sm transition duration-300',
        openShowModal ? '' : 'pointer-events-none opacity-0',
      )}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            'w-full max-w-xl rounded-[1.8rem] border border-[#e7d7cf] bg-white p-6 shadow-[0_24px_60px_rgba(10,31,47,0.14)] transition duration-300',
            openShowModal ? 'opacity-100' : 'translate-y-10 opacity-0 pointer-events-none',
        )}
      >
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs uppercase tracking-[0.28em] text-[#90a0ae]'>Détail séance</p>
            <h1 className='mt-2 text-2xl text-[#10293f]'>Créneau sélectionné</h1>
            <p className='mt-2 text-sm leading-6 text-slate-500'>Lecture rapide de la séance planifiée et de son horaire.</p>
          </div>
          <button
            onClick={toggleOpenShowModal}
            type='button'
            className='flex h-11 w-11 items-center justify-center rounded-full border border-secondary/10 bg-[#fcfaf8] text-secondary transition hover:border-primary/18 hover:text-primary'
          >
            <X size={18} />
          </button>
        </div>

        <div className='mt-6 grid gap-3 sm:grid-cols-2'>
          <Info label='Service' value={item.session?.service?.name || '-'} />
          <Info label='Session' value={item.session?.session ? `Séance ${item.session.session}` : '-'} />
          <Info label='Durée' value={item.session?.duration ? `${item.session.duration} min` : '-'} />
          <Info label='Date & Heure' value={formatDateTimeLabel(item.datetime)} />
        </div>
      </div>
    </div>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-[1.2rem] border border-[#ece1da] bg-[#fcfaf8] p-4'>
      <div className='mb-1 text-[11px] uppercase tracking-[0.24em] text-slate-400'>{label}</div>
      <div className='text-sm leading-6 text-[#17324a]'>{value}</div>
    </div>
  )
}
