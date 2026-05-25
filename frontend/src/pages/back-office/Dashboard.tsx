import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useStatsStore } from '@/stores/statsStore'
import {
  ArrowRight,
  CalendarDots as CalendarClock,
  Timer,
  CheckCircle,
  Check,
  Warning,
  CaretDown,
  CaretLeft,
  CaretRight,
  X,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

function parseSchedule(datetime?: string): Date | null {
  if (!datetime) return null
  const date = new Date(datetime)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const EMPTY_STATS: DashboardStats = {
  todayTotal: 0,
  todayConfirmed: 0,
  todayPending: 0,
  todayCompleted: 0,
  todayCancelled: 0,
  totalPatients: 0,
  currentlyRunning: [],
  nextHour: [],
  confirmedToday: [],
  pendingConfirmations: [],
  tomorrowPreview: [],
}

interface ApptItem {
  id: string
  name: string
  status: string
  patient?: { firstName: string; lastName: string; phone: string }
  service?: { name: string }
  practitioner?: { name: string }
  motif?: { name: string; color: string }
  resource?: { name: string }
  schedules?: { datetime: string }[]
}

interface DashboardStats {
  todayTotal: number
  todayConfirmed: number
  todayPending: number
  todayCompleted: number
  todayCancelled: number
  totalPatients: number
  currentlyRunning: ApptItem[]
  nextHour: ApptItem[]
  confirmedToday: ApptItem[]
  pendingConfirmations: ApptItem[]
  tomorrowPreview: ApptItem[]
}

interface AppointmentDetails {
  id: string
  name: string
  email?: string
  phone?: string
  context?: string
  status: string
  serviceId?: string
  motifId?: string
  practitionerId?: string
  resourceId?: string
  service?: { id: string; name: string }
  motif?: { id: string; name: string; color: string }
  practitioner?: { id: string; name: string }
  resource?: { id: string; name: string }
  patient?: { id: string; firstName: string; lastName: string; phone?: string; email?: string }
  schedules?: { id: string; datetime: string }[]
}

type OptionItem = { id: string; name: string }

function SelectField({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className='relative'>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className='w-full text-sm rounded-lg border border-black/[0.06] px-3 py-2 pr-10 bg-white text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none disabled:opacity-50'
      >
        {children}
      </select>
      <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
    </div>
  )
}

function enrichAppts(items: ApptItem[]) {
  return items
    .map((item) => ({ ...item, scheduleDate: parseSchedule(item.schedules?.[0]?.datetime) }))
    .sort((a, b) => {
      if (!a.scheduleDate) return 1
      if (!b.scheduleDate) return -1
      return a.scheduleDate.getTime() - b.scheduleDate.getTime()
    })
}

function groupBySlot(items: ReturnType<typeof enrichAppts>) {
  const groups = new Map<string, ReturnType<typeof enrichAppts>>()
  for (const item of items) {
    const key = item.scheduleDate ? formatTime(item.scheduleDate) : '—'
    const list = groups.get(key) || []
    list.push(item)
    groups.set(key, list)
  }
  return groups
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { stats: sharedStats, fetchStats: fetchSharedStats } = useStatsStore()
  const isAdminOrReceptionist = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST'
  const [stats, setStats] = useState<DashboardStats>(sharedStats || EMPTY_STATS)
  const [confirming, setConfirming] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [details, setDetails] = useState<AppointmentDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsSaving, setDetailsSaving] = useState(false)

  const [motifs, setMotifs] = useState<OptionItem[]>([])
  const [resources, setResources] = useState<OptionItem[]>([])
  const [practitioners, setPractitioners] = useState<OptionItem[]>([])

  const fetchStats = useCallback((options?: { force?: boolean }) => {
    return fetchSharedStats(options).then(() => {
      const next = useStatsStore.getState().stats
      if (next) setStats(next)
    })
  }, [fetchSharedStats])

  useEffect(() => {
    if (sharedStats) {
      setStats(sharedStats)
    }
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (sharedStats) {
      setStats(sharedStats)
    }
  }, [sharedStats])

  const now = new Date()

  const running = useMemo(() => enrichAppts(stats?.currentlyRunning || []), [stats?.currentlyRunning])
  const upcoming = useMemo(() => enrichAppts(stats?.nextHour || []), [stats?.nextHour])
  const confirmed = useMemo(() => groupBySlot(enrichAppts(stats?.confirmedToday || [])), [stats?.confirmedToday])
  const pending = useMemo(() => enrichAppts(stats?.pendingConfirmations || []), [stats?.pendingConfirmations])
  const tomorrow = useMemo(() => enrichAppts(stats?.tomorrowPreview || []), [stats?.tomorrowPreview])

  const handleConfirm = async (id: string, status: string) => {
    setConfirming(id)
    try {
      await api.put(`appointments/${id}`, { status })
      await fetchStats({ force: true })
      if (selectedId === id) {
        api.get(`appointments/${id}`).then((res) => setDetails(res.data))
      }
    } finally {
      setConfirming(null)
    }
  }

  const openDrawer = useCallback((id: string) => {
    setSelectedId(id)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedId(null)
    setDetails(null)
  }, [])

  const drawerMotion = {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18 },
    },
    panel: {
      initial: { x: 24, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 24, opacity: 0 },
      transition: { type: 'spring' as const, damping: 28, stiffness: 360 },
    },
  }

  useEffect(() => {
    if (!drawerOpen || !selectedId) return
    let active = true
    setDetailsLoading(true)
    api
      .get(`appointments/${selectedId}`)
      .then((res) => {
        if (!active) return
        setDetails(res.data)
      })
      .finally(() => {
        if (!active) return
        setDetailsLoading(false)
      })
    return () => {
      active = false
    }
  }, [drawerOpen, selectedId])

  useEffect(() => {
    if (!drawerOpen || !isAdminOrReceptionist) return
    let active = true
    Promise.all([api.get('motifs'), api.get('resources'), api.get('users/doctors')])
      .then(([motifsRes, resourcesRes, doctorsRes]) => {
        if (!active) return
        setMotifs(motifsRes.data || [])
        setResources(resourcesRes.data || [])
        setPractitioners(doctorsRes.data || [])
      })
      .catch(() => {
        if (!active) return
        setMotifs([])
        setResources([])
        setPractitioners([])
      })
    return () => {
      active = false
    }
  }, [drawerOpen, isAdminOrReceptionist])

  const saveDetails = async (patch: Partial<AppointmentDetails>) => {
    if (!selectedId) return
    setDetailsSaving(true)
    try {
      await api.put(`appointments/${selectedId}`, patch)
      await fetchStats({ force: true })
      const refreshed = await api.get(`appointments/${selectedId}`)
      setDetails(refreshed.data)
    } finally {
      setDetailsSaving(false)
    }
  }

  const sectionShellClass = 'rounded-2xl border border-black/[0.06] bg-white overflow-hidden flex min-h-0 flex-col shadow-sm'
  const sectionHeaderClass = 'shrink-0 flex items-center justify-between px-5 py-3 border-b border-black/[0.04]'
  const sectionBodyClass = 'flex-1 min-h-0 overflow-auto px-4 py-3'

  return (
    <motion.div
      className='bo-page flex h-screen flex-col'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <motion.div variants={itemVariants} className='shrink-0 px-4 py-4 sm:px-6 sm:py-4'>
        <div className='bo-surface flex flex-col gap-2 px-6 py-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
          <p className='text-[11px] uppercase tracking-[0.28em] text-secondary/40 mb-0.5'>{formatDate(now)}</p>
          <h2 className='font-amoria text-xl text-secondary tracking-tight'>Tableau de bord</h2>
          </div>
          <div className='flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end'>
            <CountPill value={stats.todayTotal} label='Total' color='secondary' />
            <CountPill value={stats.todayConfirmed} label='Confirmés' color='emerald' />
            <CountPill value={stats.todayPending} label='En attente' color='amber' />
          </div>
        </div>
      </motion.div>

      <div className='flex-1 min-h-0 overflow-hidden px-4 pb-4 sm:px-6'>
        {/* Desktop grid */}
        <div className='hidden h-full min-h-0 grid-cols-12 gap-3 lg:grid'>
        <motion.div variants={itemVariants} className='col-span-12 2xl:col-span-7 flex min-h-0 flex-col gap-3'>
          <div className={`${sectionShellClass} min-h-[19rem]`}>
            <div className={sectionHeaderClass}>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>En cours</h4>
                <span className='text-[10px] text-secondary/40'>({running.length})</span>
              </div>
            </div>
            <div className={sectionBodyClass}>
              {running.length === 0 ? (
                <div className='h-full flex flex-col items-center justify-center py-8 text-center'>
                  <p className='text-sm text-secondary/30 font-medium'>Aucun rendez-vous en cours</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {running.map(item => (
                    <ApptCard key={item.id} item={item} showElapsed now={now} onDetails={() => openDrawer(item.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={sectionShellClass}>
            <div className={sectionHeaderClass}>
              <div className='flex items-center gap-2'>
                <Timer size={14} className='text-primary' />
                <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>À venir</h4>
                <span className='text-[10px] text-secondary/40'>({upcoming.length})</span>
              </div>
            </div>
            <div className={sectionBodyClass}>
              {upcoming.length === 0 ? (
                <div className='h-full flex flex-col items-center justify-center py-8 text-center'>
                  <p className='text-sm text-secondary/30 font-medium'>Aucun rendez-vous à venir aujourd'hui</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {upcoming.map(item => (
                    <ApptCard key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className='col-span-12 2xl:col-span-5 flex min-h-0 flex-col gap-3'>
          {pending.length > 0 && (
            <div className={`${sectionShellClass} flex-[1.05]`}>
              <div className={`${sectionHeaderClass} bg-amber-50/20`}>
                <div className='flex items-center gap-2'>
                  <Warning size={14} className='text-amber-500' />
                  <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>En attente</h4>
                  <span className='text-[10px] text-secondary/40'>({pending.length})</span>
                </div>
              </div>
              <div className={sectionBodyClass}>
                <div className='grid grid-cols-1 gap-2'>
                  {pending.map(item => (
                    <ApptActionCard
                      key={item.id}
                      item={item}
                      confirming={confirming === item.id}
                      onConfirm={(status) => handleConfirm(item.id, status)}
                      onDetails={() => openDrawer(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`${sectionShellClass} flex-1`}>
            <div className={sectionHeaderClass}>
              <div className='flex items-center gap-2'>
                <CheckCircle size={14} className='text-emerald-500' />
                <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>Confirmés</h4>
                <span className='text-[10px] text-secondary/40'>({stats.todayConfirmed})</span>
              </div>
            </div>
            <div className={sectionBodyClass}>
              {confirmed.size === 0 ? (
                <div className='h-full flex flex-col items-center justify-center py-4 text-center'>
                  <p className='text-sm text-secondary/30 font-medium'>Aucun rendez-vous confirmé</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {Array.from(confirmed.entries()).map(([slot, items]) => (
                    <div key={slot} className='rounded-xl border border-black/[0.04] bg-white px-2 py-1.5'>
                      <div className='flex-1 space-y-1'>
                        {items.map(item => (
                          <ApptRow key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-sm'>
            <div className={sectionHeaderClass}>
              <div className='flex items-center gap-2'>
                <CalendarClock size={14} className='text-secondary/40' />
                <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>Demain</h4>
                <span className='text-[10px] text-secondary/40'>({tomorrow.length})</span>
              </div>
            </div>
            <div className='overflow-auto px-4 py-3'>
              <div className='space-y-4'>
                {tomorrow.map(item => (
                  <TomorrowRow key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

        {/* Mobile carousel */}
        <div className='flex h-full min-h-0 flex-col lg:hidden'>
          <div className='flex-1 min-h-0 overflow-hidden'>
            <MobileCarouselSection
              sections={[
                {
                  id: 'running',
                  label: 'En cours',
                  icon: <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />,
                  count: running.length,
                  headerLink: <Link to='/back-office/calendar' className='text-[10px] text-primary hover:underline font-medium'>Calendrier</Link>,
                  emptyText: 'Aucun rendez-vous en cours',
                  content: running.length > 0 ? (
                    <div className='rounded-xl border border-black/[0.04] bg-white overflow-hidden'>
                      {running.map(item => (
                        <ApptCard key={item.id} item={item} showElapsed now={now} onDetails={() => openDrawer(item.id)} />
                      ))}
                    </div>
                  ) : null,
                },
                {
                  id: 'upcoming',
                  label: 'À venir',
                  icon: <Timer size={14} className='text-primary' />,
                  count: upcoming.length,
                  emptyText: 'Aucun rendez-vous à venir aujourd\'hui',
                  content: upcoming.length > 0 ? (
                    <div className='rounded-xl border border-black/[0.04] bg-white overflow-hidden'>
                      {upcoming.map(item => (
                        <ApptCard key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                      ))}
                    </div>
                  ) : null,
                },
                ...(pending.length > 0 ? [{
                  id: 'pending',
                  label: 'En attente',
                  icon: <Warning size={14} className='text-amber-500' />,
                  count: pending.length,
                  bgColor: 'bg-amber-50/30',
                  emptyText: '',
                  content: (
                    <div className='grid grid-cols-1 gap-3'>
                      {pending.map(item => (
                        <ApptActionCard
                          key={item.id}
                          item={item}
                          confirming={confirming === item.id}
                          onConfirm={(status) => handleConfirm(item.id, status)}
                          onDetails={() => openDrawer(item.id)}
                        />
                      ))}
                    </div>
                  ),
                }] : []),
                {
                  id: 'confirmed',
                  label: 'Confirmés',
                  icon: <CheckCircle size={14} className='text-emerald-500' />,
                  count: stats.todayConfirmed,
                  headerLink: <Link to='/back-office/calendar' className='text-[10px] text-primary hover:underline font-medium'>Voir tout</Link>,
                  emptyText: 'Aucun rendez-vous confirmé',
                  content: confirmed.size > 0 ? (
                    <div className='space-y-2'>
                      {Array.from(confirmed.entries()).map(([slot, items]) => (
                        <div key={slot} className='rounded-xl border border-black/[0.04] bg-white px-2 py-1.5'>
                          <div className='flex-1 space-y-1'>
                            {items.map(item => (
                              <ApptRow key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null,
                },
                {
                  id: 'tomorrow',
                  label: 'Demain',
                  icon: <CalendarClock size={14} className='text-secondary/40' />,
                  count: 0,
                  emptyText: '',
                  content: tomorrow.length > 0 ? (
                    <div className='space-y-4'>
                      {tomorrow.map(item => (
                        <TomorrowRow key={item.id} item={item} onDetails={() => openDrawer(item.id)} />
                      ))}
                    </div>
                  ) : <p className='text-sm text-secondary/30 text-center py-4'>Aucun rendez-vous demain</p>,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <div className='fixed inset-0 z-50'>
            <motion.div {...drawerMotion.overlay} className='absolute inset-0 bg-black/25' onClick={closeDrawer} />

            <motion.div
              {...drawerMotion.panel}
              className='absolute right-0 top-0 h-full w-full max-w-[520px] bg-white border-l border-black/[0.06] flex flex-col'
            >
              <div className='shrink-0 px-4 py-4 sm:px-5 border-b border-black/[0.06] flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-secondary/40'>Détails</p>
                  <p className='text-base font-medium text-secondary truncate'>{details?.name || '—'}</p>
                  <p className='text-xs text-secondary/50 mt-0.5'>
                    {details?.schedules?.[0]?.datetime ? formatTime(new Date(details.schedules[0].datetime)) : '—'}
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className='shrink-0 w-9 h-9 rounded-lg border border-black/[0.06] flex items-center justify-center hover:bg-secondary/[0.02] transition-colors'
                >
                  <X size={16} className='text-secondary/60' />
                </button>
              </div>

              <div className='flex-1 min-h-0 overflow-auto px-4 py-4 sm:px-5 space-y-4'>
                {detailsLoading ? (
                  <div className='text-sm text-secondary/40'>Chargement...</div>
                ) : !details ? (
                  <div className='text-sm text-secondary/40'>Aucun détail.</div>
                ) : (
                  <>
                    <div className='rounded-xl border border-black/[0.06] p-4 space-y-2'>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='text-xs text-secondary/40'>Patient</span>
                        <span className='text-xs text-secondary/60'>
                          {details.patient ? `${details.patient.firstName} ${details.patient.lastName}` : '—'}
                        </span>
                      </div>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='text-xs text-secondary/40'>Téléphone</span>
                        <span className='text-xs text-secondary/60'>{details.phone || details.patient?.phone || '—'}</span>
                      </div>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='text-xs text-secondary/40'>Email</span>
                        <span className='text-xs text-secondary/60'>{details.email || details.patient?.email || '—'}</span>
                      </div>
                    </div>

                    <div className='rounded-xl border border-black/[0.06] p-4 space-y-3'>
                      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='text-xs text-secondary/40'>Statut</span>
                        <div className='w-full sm:w-[220px]'>
                          <SelectField
                            value={details.status}
                            disabled={detailsSaving}
                            onChange={(value) => saveDetails({ status: value })}
                          >
                            <option value='PENDING'>En attente</option>
                            <option value='CONFIRMED'>Confirmé</option>
                            <option value='COMPLETED'>Terminé</option>
                            <option value='CANCELLED'>Annulé</option>
                          </SelectField>
                        </div>
                      </div>

                      {isAdminOrReceptionist && (
                        <>
                          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <span className='text-xs text-secondary/40'>Praticien</span>
                            <div className='w-full sm:w-[220px]'>
                              <SelectField
                                value={details.practitionerId || ''}
                                disabled={detailsSaving}
                                onChange={(value) => saveDetails({ practitionerId: value || undefined })}
                              >
                                <option value=''>—</option>
                                {practitioners.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </SelectField>
                            </div>
                          </div>

                          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <span className='text-xs text-secondary/40'>Salle</span>
                            <div className='w-full sm:w-[220px]'>
                              <SelectField
                                value={details.resourceId || ''}
                                disabled={detailsSaving}
                                onChange={(value) => saveDetails({ resourceId: value || undefined })}
                              >
                                <option value=''>—</option>
                                {resources.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </SelectField>
                            </div>
                          </div>

                          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <span className='text-xs text-secondary/40'>Motif</span>
                            <div className='w-full sm:w-[220px]'>
                              <SelectField
                                value={details.motifId || ''}
                                disabled={detailsSaving}
                                onChange={(value) => saveDetails({ motifId: value || undefined })}
                              >
                                <option value=''>—</option>
                                {motifs.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </SelectField>
                            </div>
                          </div>
                        </>
                      )}

                      <div className='pt-2'>
                        <Link
                          to='/back-office/calendar'
                          className='inline-flex items-center gap-1 text-sm text-primary hover:text-primary/70 font-medium transition-colors'
                        >
                          Ouvrir calendrier <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Sub-components ─── */

function ApptCard({
  item,
  showElapsed,
  now,
  onDetails,
}: {
  item: ReturnType<typeof enrichAppts>[0]
  showElapsed?: boolean
  now?: Date
  onDetails?: () => void
}) {
  const elapsed = showElapsed && now && item.scheduleDate ? Math.floor((now.getTime() - item.scheduleDate.getTime()) / 60000) : null
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onDetails}
      onKeyDown={(e) => { if (!onDetails) return; if (e.key === 'Enter' || e.key === ' ') onDetails() }}
      className='group flex flex-col gap-2 rounded-xl border border-black/[0.04] bg-white px-3.5 py-3 hover:bg-secondary/[0.02] transition-all duration-200 cursor-pointer md:grid md:grid-cols-[3.1rem_minmax(0,1fr)] md:items-center md:gap-3'
    >
      <div className='flex items-start gap-3 md:block md:min-w-[46px] md:text-right'>
        {item.scheduleDate && <span className='shrink-0 text-[11px] font-bold text-secondary/50'>{formatTime(item.scheduleDate)}</span>}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-secondary truncate leading-tight'>{item.name}</p>
        </div>
        <div className='mt-1 flex items-center gap-2 flex-wrap'>
          {item.motif && <MotifPill name={item.motif.name} color={item.motif.color} />}
          {item.practitioner && (
            <span className='text-[10px] text-secondary/40'>
              {item.practitioner.name}
            </span>
          )}
          {item.resource && (
            <span className='text-[10px] text-secondary/40'>
              {item.resource.name}
            </span>
          )}
          {elapsed !== null && (
            <span className='text-[10px] text-emerald-600 font-medium'>
              {elapsed} min
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ApptActionCard({
  item,
  confirming,
  onConfirm,
  onDetails,
}: {
  item: ReturnType<typeof enrichAppts>[0]
  confirming: boolean
  onConfirm: (status: string) => void
  onDetails: () => void
}) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onDetails}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDetails()}
      className='group flex flex-col gap-2 rounded-xl border border-black/[0.04] bg-white px-3.5 py-3 hover:bg-amber-50/20 transition-all duration-200 cursor-pointer md:grid md:grid-cols-[3.1rem_minmax(0,1fr)_auto] md:items-center md:gap-3'
    >
      <div className='flex items-start gap-3 md:block md:min-w-[46px] md:text-right'>
        <p className='shrink-0 text-[11px] font-bold text-secondary/50'>{item.scheduleDate ? formatTime(item.scheduleDate) : '—'}</p>
        <div className='min-w-0 flex-1 md:hidden'>
          <p className='text-sm font-semibold text-secondary truncate leading-tight'>{item.name}</p>
          <div className='mt-1 flex items-center gap-2 flex-wrap'>
            {item.motif && <MotifPill name={item.motif.name} color={item.motif.color} />}
            {item.practitioner && (
              <span className='text-[10px] text-secondary/40'>{item.practitioner.name}</span>
            )}
          </div>
        </div>
      </div>

      <div className='hidden min-w-0 md:block'>
        <p className='text-sm font-semibold text-secondary truncate leading-tight'>{item.name}</p>
        <div className='mt-1 flex items-center gap-2 flex-wrap'>
          {item.motif && <MotifPill name={item.motif.name} color={item.motif.color} />}
          {item.practitioner && (
            <span className='text-[10px] text-secondary/40'>{item.practitioner.name}</span>
          )}
        </div>
      </div>

      <div
        className='flex w-full shrink-0 items-center justify-end gap-2 md:w-auto md:justify-self-end'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onConfirm('CONFIRMED')
          }}
          disabled={confirming}
          className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50'
          aria-label='Confirmer'
        >
          <Check size={16} weight='bold' />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onConfirm('CANCELLED')
          }}
          disabled={confirming}
          className='flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 disabled:opacity-50'
          aria-label='Refuser'
        >
          <X size={16} weight='bold' />
        </button>
      </div>
    </div>
  )
}

function ApptRow({ item, onDetails }: { item: ReturnType<typeof enrichAppts>[0]; onDetails: () => void }) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onDetails}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDetails()}
      className='group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-secondary/[0.02] transition-all cursor-pointer'
    >
      {/* Time */}
      <div className='min-w-[42px] text-right shrink-0 pt-0.5'>
        <p className='text-[11px] font-bold text-secondary/50'>{item.scheduleDate ? formatTime(item.scheduleDate) : '—'}</p>
      </div>

      {/* Name + badge */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors'>{item.name}</p>
        <div className='flex items-center gap-2 mt-0.5'>
          {item.motif && <MotifPill name={item.motif.name} color={item.motif.color} />}
        </div>
      </div>

      {/* Status */}
      <div className='shrink-0 pt-0.5'>
        <StatusBadge status={item.status} />
      </div>
    </div>
  )
}

function TomorrowRow({ item, onDetails }: { item: ReturnType<typeof enrichAppts>[0]; onDetails?: () => void }) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onDetails}
      onKeyDown={(e) => { if (!onDetails) return; if (e.key === 'Enter' || e.key === ' ') onDetails() }}
      className='group flex items-start gap-3 rounded-lg px-2 py-1.5 transition-all hover:bg-secondary/[0.02] cursor-pointer sm:items-center'
    >
      <div className='min-w-[42px] text-right pt-0.5 sm:pt-0'>
        <p className='text-[10px] font-bold text-primary'>{item.scheduleDate ? formatTime(item.scheduleDate) : '—'}</p>
      </div>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
        <p className='text-xs font-medium text-secondary/80 truncate'>{item.name}</p>
        {item.motif && <MotifPill name={item.motif.name} color={item.motif.color} />}
      </div>
    </div>
  )
}

function MotifPill({ name, color }: { name: string; color: string }) {
  const safeColor = normalizeMotifColor(color) || '#2E90C0'
  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none tracking-tight'
      style={{
        backgroundColor: `${safeColor}14`,
        color: safeColor,
      }}
    >
      <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: safeColor }} />
      {name}
    </span>
  )
}

function MobileCarouselSection({ sections }: {
  sections: Array<{
    id: string
    label: string
    icon: React.ReactNode
    count: number
    headerLink?: React.ReactNode
    bgColor?: string
    emptyText: string
    content: React.ReactNode | null
  }>
}) {
  const [idx, setIdx] = useState(0)
  const section = sections[idx]
  if (!section) return null

  return (
    <div className='flex h-full flex-col'>
      {/* Nav header */}
      <div className='flex items-center justify-between gap-2 px-4 py-2 border-b border-black/[0.04] bg-white shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5'>
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx ? 'w-6 bg-primary' : 'w-1.5 bg-secondary/15'
                }`}
              />
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[11px] text-secondary/40 font-medium'>
            {section.label} · {section.count}
          </span>
          <div className='flex gap-1'>
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className='w-7 h-7 rounded-lg border border-black/[0.06] flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-secondary/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all'
            >
              <CaretLeft size={14} />
            </button>
            <button
              onClick={() => setIdx(i => Math.min(sections.length - 1, i + 1))}
              disabled={idx === sections.length - 1}
              className='w-7 h-7 rounded-lg border border-black/[0.06] flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-secondary/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all'
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 min-h-0 overflow-auto p-4'>
        <div className='rounded-2xl border border-black/[0.04] bg-white overflow-hidden flex min-h-0 flex-col shadow-sm'>
          <div className={`shrink-0 flex items-center justify-between px-5 py-3 border-b border-black/[0.04] ${section.bgColor || ''}`}>
            <div className='flex items-center gap-2'>
              {section.icon}
              <h4 className='text-xs font-semibold text-secondary uppercase tracking-wider'>{section.label}</h4>
              <span className='text-[10px] text-secondary/40'>({section.count})</span>
            </div>
            {section.headerLink}
          </div>
          <div className='flex-1 min-h-0 overflow-auto p-4'>
            {section.content || (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <p className='text-sm text-secondary/30 font-medium'>{section.emptyText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CountPill({ value, label, color }: { value: number; label: string; color: 'secondary' | 'emerald' | 'amber' }) {
  const colors = {
    secondary: 'text-secondary/70',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-2 text-sm ${colors[color]}`}>
      <strong className='font-semibold'>{value}</strong>
      <span className='text-secondary/40 text-xs uppercase tracking-[0.16em]'>{label}</span>
    </span>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    CONFIRMED: 'bg-emerald-50 text-emerald-600',
    COMPLETED: 'bg-sky-50 text-sky-600',
    CANCELLED: 'bg-rose-50 text-rose-600',
    EXPIRED: 'bg-secondary/[0.04] text-secondary/40',
  }
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
    EXPIRED: 'Expiré',
  }
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status || ''] || 'bg-secondary/5 text-secondary/50'}`}
    >
      {labels[status || ''] || status}
    </span>
  )
}

function normalizeMotifColor(value?: string) {
  if (!value) return null
  const trimmed = value.trim()
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return /^#[0-9A-Fa-f]{6}$/.test(prefixed) ? prefixed.toUpperCase() : null
}
