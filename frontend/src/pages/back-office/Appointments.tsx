import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { Eye, PencilSimple as Pen, CalendarBlank, EnvelopeSimple, Phone, User, Stethoscope, Door } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useDebounce } from 'use-debounce'

export default function Appointments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className='h-full'
    >
      <div className='space-y-5 relative'>
        <Heading />
        <Filters />
        <div className='relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-white/60 shadow-[0_20px_60px_rgba(10,31,47,0.08)] backdrop-blur-xl'>
          <Table />
        </div>
      </div>
    </motion.div>
  )
}

function Heading() {
  return (
    <div>
      <h3 className='font-semibold text-2xl text-secondary tracking-tight'>Gestion Des Rendez-vous</h3>
      <p className='text-sm text-secondary/60 mt-1'>Gérez les rendez-vous et leurs statuts</p>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useAppointmentsStore()

  return (
    <div className='flex gap-4'>
      <div className='relative flex-1 max-w-md'>
        <input 
          type='text' 
          placeholder='Rechercher par nom, email ou téléphone...' 
          value={filters.term} 
          onChange={(e) => setFilters({ ...filters, term: e.target.value })} 
          className='w-full bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm transition-all' 
        />
      </div>
    </div>
  )
}

function Table() {
  const { items, filters, fetchItems, setItem, toggleOpenShowModal } = useAppointmentsStore()
  const [filtered, setFiltered] = useState(items)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setFiltered(items.filter((i) => i.name.includes(debouncedFilters.term) || i.email.includes(debouncedFilters.term) || i.phone.includes(debouncedFilters.term)))
  }, [items, debouncedFilters])

  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-secondary/10'>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Patient</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Contact</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Motif</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Statut</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Praticien</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} className='px-6 py-12 text-center'>
              <div className='flex flex-col items-center gap-3 text-secondary/50'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center'>
                  <CalendarBlank size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucun rendez-vous trouvé</p>
                <p className='text-xs'>Les rendez-vous apparaîtront ici</p>
              </div>
            </td>
          </tr>
        )}
        {filtered.map((item) => (
          <tr className='border-b border-secondary/5 hover:bg-white/40 transition-colors' key={item.id}>
            <td className='px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <User size={20} className='text-primary' />
                </div>
                <div className='font-medium text-secondary'>{item.name}</div>
              </div>
            </td>
            <td className='px-6 py-4'>
              <div className='space-y-0.5 text-sm text-secondary/70'>
                <div className='flex items-center gap-1.5'>
                  <EnvelopeSimple size={12} className='text-secondary/40' />
                  <span className='text-xs'>{item.email}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Phone size={12} className='text-secondary/40' />
                  <span className='text-xs'>{item.phone}</span>
                </div>
              </div>
            </td>
            <td className='px-6 py-4 text-secondary/70'>
              {item.motif?.name || item.service?.name}
            </td>
            <td className='px-6 py-4'>
              <StatusBadge status={item.status || 'PENDING'} />
            </td>
            <td className='px-6 py-4'>
              <div className='flex items-center gap-1.5 text-secondary/70'>
                <Stethoscope size={14} className='text-secondary/40' />
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
                  className='p-2 rounded-lg text-secondary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200'
                >
                  <Eye size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
    COMPLETED: 'bg-sky-50 text-sky-700 border-sky-100',
    EXPIRED: 'bg-slate-50 text-slate-700 border-slate-100',
    NO_SHOW: 'bg-violet-50 text-violet-700 border-violet-100',
    SENT: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-100',
    SKIPPED: 'bg-slate-50 text-slate-700 border-slate-100',
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'CONFIRMED' ? 'bg-emerald-500' : status === 'PENDING' ? 'bg-amber-500' : status === 'CANCELLED' ? 'bg-rose-500' : 'bg-slate-400'}`} />
      {labels[status] || status}
    </span>
  )
}

function ShowModal() {
  const { openShowModal, toggleOpenShowModal, item, fetchItem, loadingItem, saveScheduleDate, savingScheduleSessionId } = useAppointmentsStore()
  const [sessionDates, setSessionDates] = useState<Record<number, string>>({})
  const [editingSessions, setEditingSessions] = useState<Record<number, boolean>>({})

  function openSessionEditor(sessionId: number) {
    const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === sessionId)?.datetime
    setSessionDates({ ...sessionDates, [sessionId]: toDateTimeLocal(currentDate) })
    setEditingSessions({ [sessionId]: true })
  }

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

  function toDateTimeLabel(value?: string) {
    if (!value) return 'Date non définie'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Date non définie'

    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', openShowModal ? '' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300' onClick={toggleOpenShowModal} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={openShowModal ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.32 }} className={clsx('relative w-full max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', openShowModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className='sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>Détails du rendez-vous</h2>
          <p className='text-sm text-secondary/60 mt-0.5'>{item.name} · {item.motif?.name || item.service?.name}</p>
        </div>

        {loadingItem ? (
          <div className='p-6 flex items-center justify-center text-secondary/60'>
            <div className='animate-spin mr-2 h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full' />
            Chargement...
          </div>
        ) : (
          <div className='p-6'>
            <div className='flex items-center gap-4 mb-6 pb-6 border-b border-secondary/10'>
              <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <User size={28} className='text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-secondary'>{item.name}</h3>
                <p className='text-sm text-secondary/60'>{item.motif?.name || item.service?.name}</p>
              </div>
              <div className='ml-auto'>
                <StatusBadge status={item.status || 'PENDING'} />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-5'>
                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Nom complet</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <User size={16} className='text-secondary/40' />
                    {item.name}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Email</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <EnvelopeSimple size={16} className='text-secondary/40' />
                    {item.email}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Téléphone</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <Phone size={16} className='text-secondary/40' />
                    {item.phone}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Service</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <CalendarBlank size={16} className='text-secondary/40' />
                    {item.service?.name || '—'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Motif</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <Stethoscope size={16} className='text-secondary/40' />
                    {item.motif?.name || 'Service direct'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Praticien</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <Stethoscope size={16} className='text-secondary/40' />
                    {item.practitioner?.name || 'Affectation automatique'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Ressource</label>
                  <div className='flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary'>
                    <Door size={16} className='text-secondary/40' />
                    {item.resource?.name || 'Aucune ressource dédiée'}
                  </div>
                </div>

                {item.context && (
                  <div className='space-y-2'>
                    <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Message</label>
                    <div className='rounded-xl border border-secondary/10 bg-white/80 px-4 py-3 text-sm text-secondary/80 max-h-32 overflow-y-auto'>
                      {item.context}
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-secondary/50'>Notifications</label>
                  <div className='rounded-xl border border-secondary/10 bg-white/80 p-3 space-y-2 max-h-32 overflow-y-auto'>
                    {(item.notifications || []).length === 0 ? (
                      <p className='text-sm text-secondary/50'>Aucune notification</p>
                    ) : (
                      (item.notifications || []).map((notification) => (
                        <div key={notification.id} className='flex items-center justify-between gap-3 pb-2 border-b border-secondary/5 last:border-0 last:pb-0'>
                          <span className='text-sm text-secondary/70'>{notification.channel} · {notification.recipientType}</span>
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
                    <div className='rounded-xl border border-secondary/10 bg-white/80 p-4 text-sm text-secondary/50 text-center'>
                      Aucune séance trouvée
                    </div>
                  )}

                {(item.service?.sessions || []).map((session) => (
                  <div key={session.id} className='rounded-2xl border border-secondary/10 bg-white/80 p-4 space-y-3 backdrop-blur-md'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>{session.session}</div>
                        <span className='text-sm font-medium text-secondary'>{session.duration} min</span>
                      </div>
                    </div>

                    {editingSessions[session.id] ? (
                      <div className='space-y-3'>
                        <input 
                          type='datetime-local' 
                          value={sessionDates[session.id] || ''} 
                          onChange={(e) => setSessionDates({ ...sessionDates, [session.id]: e.target.value })} 
                          className='w-full rounded-2xl border border-secondary/10 bg-white px-3 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30' 
                        />
                        <div className='flex gap-2 justify-end'>
                          <button
                            onClick={() => {
                              setEditingSessions({})
                              const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                              setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                            }}
                            type='button'
                            className='px-3 py-2 rounded-lg text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'
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
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-secondary/70'>
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
                        <button
                          onClick={() => {
                            setEditingSessions({ [session.id]: true })
                            const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                            setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                          }}
                          type='button'
                          className='p-2 rounded-lg text-secondary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200'
                        >
                          <Pen size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                </div>
              </div>
            </div>
          </div>
        )}
        <div className='sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex justify-end'>
          <button onClick={toggleOpenShowModal} type='button' className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  )
}


