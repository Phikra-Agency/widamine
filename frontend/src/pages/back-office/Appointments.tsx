import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { Eye, PencilSimple as Pen, CalendarBlank, EnvelopeSimple, Phone, User, Stethoscope, Door, MagnifyingGlass, CaretDown } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useDebounce } from 'use-debounce'
import Pagination from '@/components/Pagination'
import api from '@/lib/api'

export default function Appointments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner bo-page-stack p-3 sm:p-4 lg:p-6'>
        {/* Ambient background */}
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/4 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/3 blur-3xl' />
        <div className='bo-section-stack flex-shrink-0'>
          <Heading />
          <Filters />
        </div>
        <div className='bo-surface mt-0 flex-1 min-h-0 flex flex-col'>
          <Table />
        </div>
      </div>
      <ShowModal />
    </motion.div>
  )
}

function Heading() {
  return (
    <div>
      <h3 className='bo-title'>Gestion Des Rendez-vous</h3>
      <p className='bo-subtitle'>Gérez les rendez-vous et leurs statuts</p>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useAppointmentsStore()

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
      <div className='relative w-full flex-1 sm:min-w-[200px] sm:max-w-md'>
        <MagnifyingGlass size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/30' />
        <input
          type='text'
          placeholder='Rechercher par nom, email ou téléphone...'
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className='bo-input pl-10'
        />
      </div>
      <div className='relative w-full sm:min-w-[150px] sm:w-auto'>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className='bo-select'
        >
          <option value=''>Tous les statuts</option>
          <option value='PENDING'>En attente</option>
          <option value='CONFIRMED'>Confirmé</option>
          <option value='COMPLETED'>Terminé</option>
          <option value='CANCELLED'>Annulé</option>
          <option value='EXPIRED'>Expiré</option>
          <option value='NO_SHOW'>Absent</option>
        </select>
        <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
      </div>
    </div>
  )
}

const PAGE_SIZE = 10

function Table() {
  const { items, filters, fetchItems, setItem, toggleOpenShowModal, setOpenShowModal } = useAppointmentsStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedFilters] = useDebounce(filters, 300)
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)

  useEffect(() => {
    fetchItems()
  }, [])

  // Auto-open popup if id is in query params (only once)
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && !hasOpenedFromUrl.current) {
      hasOpenedFromUrl.current = true
      const checkAndOpen = () => {
        const appointment = items.find(item => String(item.id) === id)
        if (appointment) {
          setItem(appointment)
          setOpenShowModal(true)
        }
      }
      if (items.length > 0) {
        checkAndOpen()
      } else {
        const timer = setTimeout(checkAndOpen, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [items, searchParams, setItem, setOpenShowModal])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const term = debouncedFilters.term.toLowerCase()
      const matchesTerm = !term ||
        i.name.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.phone.toLowerCase().includes(term)
      const matchesStatus = !debouncedFilters.status || i.status === debouncedFilters.status
      return matchesTerm && matchesStatus
    })
  }, [items, debouncedFilters])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedFilters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className='flex flex-col h-full'>
      <div className='hidden flex-1 min-h-0 overflow-auto lg:block'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-black/[0.04]'>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Patient</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Contact</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motif</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Statut</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Praticien</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className='px-6 py-12 text-center'>
                  <div className='flex flex-col items-center gap-3 text-secondary/40'>
                    <p className='text-sm font-medium'>Aucun rendez-vous trouvé</p>
                    <p className='text-xs'>Les rendez-vous apparaîtront ici</p>
                  </div>
                </td>
              </tr>
            )}
            {paged.map((item) => (
              <tr className='border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors' key={item.id}>
                <td className='px-6 py-3'>
                  <div className='font-medium text-secondary'>{item.name}</div>
                </td>
                <td className='px-6 py-4'>
                  <div className='space-y-0.5 text-sm text-secondary/60'>
                    <div className='flex items-center gap-1.5'>
                      <EnvelopeSimple size={12} className='text-secondary/30' />
                      <span className='text-xs'>{item.email}</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <Phone size={12} className='text-secondary/30' />
                      <span className='text-xs'>{item.phone}</span>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 text-secondary/60'>
                  {item.motif?.name || item.service?.name}
                </td>
                <td className='px-6 py-4'>
                  <StatusSelect appointmentId={item.id!} status={item.status || 'PENDING'} />
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-1.5 text-secondary/60'>
                    <Stethoscope size={14} className='text-secondary/30' />
                    <span className='text-sm'>{item.practitioner?.name || 'Auto'}</span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center justify-end'>
                    <button
                      onClick={() => {
                        setItem(item)
                        toggleOpenShowModal()
                      }}
                      className='p-2 rounded-lg text-secondary/40 hover:text-primary hover:bg-primary/10 transition-all duration-200'
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex-1 min-h-0 overflow-auto lg:hidden'>
        <div className='space-y-3 p-3'>
          {paged.length === 0 ? (
            <div className='rounded-2xl border border-black/[0.06] bg-white px-4 py-10 text-center text-secondary/40'>
              <p className='text-sm font-medium'>Aucun rendez-vous trouvé</p>
              <p className='mt-1 text-xs'>Les rendez-vous apparaîtront ici</p>
            </div>
          ) : (
            paged.map((item) => (
              <button
                key={item.id}
                type='button'
                onClick={() => {
                  setItem(item)
                  toggleOpenShowModal()
                }}
                className='w-full rounded-2xl border border-black/[0.06] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-secondary'>{item.name}</p>
                    <p className='mt-1 text-xs text-secondary/50'>{item.motif?.name || item.service?.name}</p>
                  </div>
                  <StatusBadge status={item.status || 'PENDING'} />
                </div>

                <div className='mt-3 space-y-2 text-sm text-secondary/65'>
                  <div className='flex items-center gap-2'>
                    <EnvelopeSimple size={14} className='text-secondary/30' />
                    <span className='min-w-0 truncate'>{item.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone size={14} className='text-secondary/30' />
                    <span>{item.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Stethoscope size={14} className='text-secondary/30' />
                    <span>{item.practitioner?.name || 'Auto'}</span>
                  </div>
                </div>

                <div className='mt-4 flex items-center justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='text-[10px] uppercase tracking-[0.16em] text-secondary/35'>Statut</p>
                    <div className='mt-1'>
                      <StatusSelect appointmentId={item.id!} status={item.status || 'PENDING'} />
                    </div>
                  </div>
                  <span className='inline-flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary'>
                    <Eye size={14} />
                    Voir
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className='shrink-0 border-t border-black/[0.04] px-4 py-3 bg-white/80 backdrop-blur-sm'>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    CONFIRMED: 'bg-emerald-50 text-emerald-600',
    CANCELLED: 'bg-red-50 text-red-600',
    COMPLETED: 'bg-sky-50 text-sky-600',
    EXPIRED: 'bg-gray-50 text-gray-600',
    NO_SHOW: 'bg-violet-50 text-violet-600',
    SENT: 'bg-emerald-50 text-emerald-600',
    FAILED: 'bg-red-50 text-red-600',
    SKIPPED: 'bg-gray-50 text-gray-600',
  }

  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    EXPIRED: 'Expiré',
    NO_SHOW: 'Absent',
    SENT: 'Envoyé',
    FAILED: 'Échoué',
    SKIPPED: 'Ignoré',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[status] || styles.PENDING}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'CONFIRMED' ? 'bg-emerald-500' : status === 'PENDING' ? 'bg-amber-500' : status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {labels[status] || status}
    </span>
  )
}

function StatusSelect({ appointmentId, status }: { appointmentId: number; status: string }) {
  const { fetchItems } = useAppointmentsStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const [current, setCurrent] = useState(status)
  const [saving, setSaving] = useState(false)

  const allLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    EXPIRED: 'Expiré',
    NO_SHOW: 'Absent',
  }

  // Practitioners can only confirm, complete, or mark no-show
  const labels = isPractitioner
    ? { CONFIRMED: allLabels.CONFIRMED, COMPLETED: allLabels.COMPLETED, NO_SHOW: allLabels.NO_SHOW }
    : allLabels

  async function handleChange(newStatus: string) {
    if (newStatus === current) return
    setSaving(true)
    try {
      await api.put(`appointments/${appointmentId}`, { status: newStatus })
      setCurrent(newStatus)
      fetchItems()
    } catch {
      setCurrent(current)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className={clsx(
        'inline-flex items-center pl-5 pr-2 py-1 rounded-lg text-xs font-medium border cursor-pointer appearance-none bg-no-repeat focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60',
        current === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
        current === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
        current === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
        current === 'COMPLETED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
        current === 'EXPIRED' ? 'bg-slate-50 text-slate-700 border-slate-100' :
        current === 'NO_SHOW' ? 'bg-violet-50 text-violet-700 border-violet-100' :
        'bg-secondary/5 text-secondary/70 border-secondary/20'
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%231a3646' opacity='0.4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundSize: '10px', paddingLeft: '22px' }}
    >
      {Object.entries(labels).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  )
}

function ShowModal() {
  const { openShowModal, toggleOpenShowModal, item, fetchItem, loadingItem, saveScheduleDate, savingScheduleSessionId } = useAppointmentsStore()
  const [sessionDates, setSessionDates] = useState<Record<number, string>>({})
  const [editingSessions, setEditingSessions] = useState<Record<number, boolean>>({})

  function toDateTimeLocal(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  useEffect(() => {
    if (!openShowModal || !item.id) return
    fetchItem(item.id)
  }, [openShowModal])

  useEffect(() => {
    const dates = (item.service?.sessions || []).reduce((acc: Record<number, string>, session) => {
      const schedule = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)
      acc[session.id] = toDateTimeLocal(schedule?.datetime)
      return acc
    }, {} as Record<number, string>)

    setSessionDates(dates)
    setEditingSessions({})
  }, [item])

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', openShowModal ? '' : 'pointer-events-none')}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={openShowModal ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className='absolute inset-0 bg-secondary/30 backdrop-blur-sm'
        onClick={toggleOpenShowModal}
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={openShowModal ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={clsx('relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:max-h-[calc(100vh-4rem)]', openShowModal ? '' : 'pointer-events-none')}
      >
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-4 py-4 sm:px-6'>
          <h2 className='text-lg font-semibold text-secondary'>Détails du rendez-vous</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{item.name} · {item.motif?.name || item.service?.name}</p>
        </div>

        {loadingItem ? (
          <div className='p-6 flex items-center justify-center text-secondary/60'>
            <div className='animate-spin mr-2 h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full' />
            Chargement...
          </div>
        ) : (
          <div className='p-4 sm:p-6'>
            <div className='mb-6 flex flex-col gap-4 border-b border-black/[0.04] pb-6 sm:flex-row sm:items-center'>
              <div className='w-14 h-14 rounded-2xl bg-secondary/[0.04] flex items-center justify-center flex-shrink-0'>
                <User size={26} className='text-secondary/50' />
              </div>
              <div className='min-w-0'>
                <h3 className='text-lg font-semibold text-secondary'>{item.name}</h3>
                <p className='text-sm text-secondary/50'>{item.motif?.name || item.service?.name}</p>
              </div>
              <div className='sm:ml-auto'>
                <StatusBadge status={item.status || 'PENDING'} />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom complet</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <User size={15} className='text-secondary/30' />
                    {item.name}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <EnvelopeSimple size={15} className='text-secondary/30' />
                    {item.email}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Téléphone</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <Phone size={15} className='text-secondary/30' />
                    {item.phone}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Service</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <CalendarBlank size={15} className='text-secondary/30' />
                    {item.service?.name || '—'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motif</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <Stethoscope size={15} className='text-secondary/30' />
                    {item.motif?.name || 'Service direct'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Praticien</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <Stethoscope size={15} className='text-secondary/30' />
                    {item.practitioner?.name || 'Affectation automatique'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Ressource</label>
                  <div className='flex items-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary'>
                    <Door size={15} className='text-secondary/30' />
                    {item.resource?.name || 'Aucune ressource dédiée'}
                  </div>
                </div>

                {item.context && (
                  <div className='space-y-2'>
                    <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Message</label>
                    <div className='rounded-lg border border-black/[0.06] bg-white px-4 py-3 text-sm text-secondary/70 max-h-32 overflow-y-auto'>
                      {item.context}
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Notifications</label>
                  <div className='rounded-lg border border-black/[0.06] bg-white p-3 space-y-2 max-h-32 overflow-y-auto'>
                    {(item.notifications || []).length === 0 ? (
                      <p className='text-sm text-secondary/40'>Aucune notification</p>
                    ) : (
                      (item.notifications || []).map((notification) => (
                        <div key={notification.id} className='flex items-center justify-between gap-3 pb-2 border-b border-black/[0.04] last:border-0 last:pb-0'>
                          <span className='text-sm text-secondary/60'>{notification.channel} · {notification.recipientType}</span>
                          <StatusBadge status={notification.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-medium text-secondary'>Séances du service</h3>
                <div className='space-y-3'>
                  {(item.service?.sessions || []).length === 0 && (
                    <div className='rounded-lg border border-black/[0.06] bg-white p-4 text-sm text-secondary/40 text-center'>
                      Aucune séance trouvée
                    </div>
                  )}

                {(item.service?.sessions || []).map((session) => (
                  <div key={session.id} className='rounded-lg border border-black/[0.06] bg-white p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-full bg-secondary/[0.04] text-secondary flex items-center justify-center text-sm font-medium'>{session.session}</div>
                        <span className='text-sm font-medium text-secondary'>{session.duration} min</span>
                      </div>
                    </div>

                    {editingSessions[session.id] ? (
                      <div className='space-y-3'>
                        <input
                          type='datetime-local'
                          value={sessionDates[session.id] || ''}
                          onChange={(e) => setSessionDates({ ...sessionDates, [session.id]: e.target.value })}
                          className='w-full rounded-lg border border-black/[0.06] bg-white px-3 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30'
                        />
                        <div className='flex gap-2 justify-end'>
                          <button
                            onClick={() => {
                              setEditingSessions({})
                              const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                              setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                            }}
                            type='button'
                            className='px-3 py-2 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'
                          >
                            Annuler
                          </button>
                          <button
                            onClick={async () => {
                              const value = sessionDates[session.id]
                              if (!value) return
                              await saveScheduleDate({ sessionId: session.id, datetime: new Date(value).toISOString() })
                              setEditingSessions({})
                            }}
                            type='button'
                            disabled={!sessionDates[session.id] || savingScheduleSessionId === session.id}
                            className='px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                          >
                            {savingScheduleSessionId === session.id ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <span className='text-sm text-secondary/60'>
                          {(() => {
                            const schedule = item.schedules?.find((s) => s.sessionId === session.id)
                            if (schedule?.datetime) {
                              return new Date(schedule.datetime).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            }
                            return 'Date non programmée'
                          })()}
                        </span>
                        <div className='flex justify-end sm:block'>
                          <button
                            onClick={() => {
                              setEditingSessions({ [session.id]: true })
                              const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                              setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                            }}
                            type='button'
                            className='p-2 rounded-lg text-secondary/40 hover:text-primary hover:bg-primary/10 transition-all duration-200'
                          >
                            <Pen size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                </div>
              </div>
            </div>
          </div>
        )}
        <div className='sticky bottom-0 flex justify-end border-t border-black/[0.04] bg-white px-4 py-4 sm:px-6'>
          <button onClick={toggleOpenShowModal} type='button' className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  )
}

