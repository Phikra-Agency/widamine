import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { ArrowRight, CalendarDots as CalendarClock, Clock, Users } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

function parseSchedule(datetime?: string): Date | null {
  if (!datetime) return null
  const date = new Date(datetime)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { items, fetchItems } = useAppointmentsStore()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  // Process appointments with parsed dates
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      scheduleDate: parseSchedule(item.schedules?.[0]?.datetime)
    })).sort((a, b) => {
      if (!a.scheduleDate) return 1
      if (!b.scheduleDate) return -1
      return a.scheduleDate.getTime() - b.scheduleDate.getTime()
    })
  }, [items])

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return processedItems.filter(item => {
      if (!item.scheduleDate) return false
      return item.scheduleDate >= todayStart && item.scheduleDate <= todayEnd
    })
  }, [processedItems])

  // Current appointment (happening now or next upcoming)
  const currentAppointment = useMemo(() => {
    const happeningNow = todayAppointments.find(item => {
      if (!item.scheduleDate) return false
      const apptEnd = new Date(item.scheduleDate.getTime() + 30 * 60000) // Assume 30min duration
      return item.scheduleDate <= now && apptEnd >= now
    })
    
    if (happeningNow) return { type: 'current' as const, item: happeningNow }
    
    const next = todayAppointments.find(item => item.scheduleDate && item.scheduleDate > now)
    if (next) return { type: 'next' as const, item: next }
    
    return null
  }, [todayAppointments, now])

  // Next appointment after current
  const nextAppointment = useMemo(() => {
    if (!currentAppointment) return null
    const currentTime = currentAppointment.item.scheduleDate?.getTime() || 0
    return todayAppointments.find(item => 
      item.scheduleDate && item.scheduleDate.getTime() > currentTime
    )
  }, [todayAppointments, currentAppointment])

  // Stats
  const totalAppointments = items.length
  const completedToday = todayAppointments.filter(a => a.status === 'COMPLETED').length
  const pendingToday = todayAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length

  return (
    <div className='h-full overflow-auto'>
      {/* Bento Grid Layout */}
      <div className='grid grid-cols-12 gap-4'>

        {/* Current/Next Appointment - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='col-span-12 lg:col-span-5 rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-5'
        >
          {currentAppointment ? (
            <>
              <div className='flex items-center gap-2 mb-4'>
                <div className={`h-2 w-2 rounded-full ${currentAppointment.type === 'current' ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                <span className='text-xs uppercase tracking-wider text-primary'>
                  {currentAppointment.type === 'current' ? 'En cours' : 'Prochain rendez-vous'}
                </span>
              </div>
              <div className='space-y-1'>
                <h3 className='text-xl font-medium text-secondary'>{currentAppointment.item.name}</h3>
                <p className='text-sm text-secondary/60'>{currentAppointment.item.service?.name}</p>
              </div>
              <div className='mt-4 flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1.5 text-secondary/70'>
                  <Clock size={14} className='text-primary' />
                  {currentAppointment.item.scheduleDate && formatTime(currentAppointment.item.scheduleDate)}
                </div>
                {currentAppointment.item.practitioner && (
                  <div className='flex items-center gap-1.5 text-secondary/70'>
                    <Users size={14} className='text-primary' />
                    {currentAppointment.item.practitioner.name}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='h-full flex flex-col justify-center items-center text-secondary/40 py-8'>
              <CalendarClock size={32} className='text-secondary/20 mb-3' />
              <p className='text-sm'>Aucun rendez-vous aujourd'hui</p>
            </div>
          )}
        </motion.div>

        {/* Next Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className='col-span-12 lg:col-span-4 rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-5'
        >
          <span className='text-xs uppercase tracking-wider text-secondary/50'>Suivant</span>
          {nextAppointment ? (
            <div className='mt-3 space-y-1'>
              <h4 className='text-lg text-secondary'>{nextAppointment.name}</h4>
              <p className='text-sm text-secondary/60'>{nextAppointment.service?.name}</p>
              <p className='text-sm text-primary mt-2'>
                {nextAppointment.scheduleDate && formatTime(nextAppointment.scheduleDate)}
              </p>
            </div>
          ) : (
            <p className='mt-3 text-sm text-secondary/40'>Pas d'autre rendez-vous prévu</p>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='col-span-12 lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3'
        >
          <div className='rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-4 flex flex-col justify-center'>
            <span className='text-2xl font-medium text-secondary'>{todayAppointments.length}</span>
            <span className='text-xs text-secondary/50 mt-1'>Aujourd'hui</span>
          </div>
          <div className='rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-4 flex flex-col justify-center'>
            <span className='text-2xl font-medium text-emerald-500'>{completedToday}</span>
            <span className='text-xs text-secondary/50 mt-1'>Terminés</span>
          </div>
          <div className='rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-4 flex flex-col justify-center'>
            <span className='text-2xl font-medium text-amber-500'>{pendingToday}</span>
            <span className='text-xs text-secondary/50 mt-1'>En attente</span>
          </div>
          <div className='rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-4 flex flex-col justify-center'>
            <span className='text-2xl font-medium text-secondary'>{totalAppointments}</span>
            <span className='text-xs text-secondary/50 mt-1'>Total</span>
          </div>
        </motion.div>

        {/* Today's List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className='col-span-12 lg:col-span-8 rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] overflow-hidden'
        >
          <div className='flex items-center justify-between px-5 py-4 border-b border-secondary/10'>
            <h4 className='text-sm font-medium text-secondary'>Rendez-vous du jour</h4>
            <Link to='/back-office/appointments' className='text-xs text-primary hover:text-primary/80 flex items-center gap-1'>
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className='divide-y divide-secondary/5'>
            {todayAppointments.length === 0 ? (
              <div className='px-5 py-8 text-center text-sm text-secondary/40'>
                Aucun rendez-vous aujourd'hui
              </div>
            ) : (
              todayAppointments.slice(0, 5).map((item, i) => (
                <div key={item.id} className='flex items-center gap-4 px-5 py-3 hover:bg-secondary/5 transition-colors'>
                  <div className='w-12 text-center'>
                    <span className='text-sm font-medium text-secondary/70'>
                      {item.scheduleDate && formatTime(item.scheduleDate)}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-secondary truncate'>{item.name}</p>
                    <p className='text-xs text-secondary/50'>{item.service?.name}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='col-span-12 lg:col-span-4 rounded-2xl bg-white border border-secondary/10 shadow-[0_4px_20px_rgba(26,54,70,0.08)] p-5'
        >
          <h4 className='text-sm font-medium text-secondary mb-4'>Accès rapide</h4>
          <div className='space-y-2'>
            <QuickAction to='/back-office/appointments' label='Rendez-vous' />
            <QuickAction to='/back-office/calendar' label='Calendrier' />
            <QuickAction to='/back-office/patients' label='Patients' />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-600 border border-amber-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
    COMPLETED: 'bg-primary/10 text-primary border border-primary/20',
    CANCELLED: 'bg-red-100 text-red-600 border border-red-200',
  }
  const labels = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles] || 'bg-secondary/10 text-secondary/50 border border-secondary/20'}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className='flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-colors text-sm text-secondary/80 hover:text-secondary'
    >
      {label}
      <ArrowRight size={14} className='text-primary' />
    </Link>
  )
}
