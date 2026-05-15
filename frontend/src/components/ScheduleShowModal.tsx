import { useSchedulesStore } from '@/stores/schedulesStore'
import { useAuthStore } from '@/stores/authStore'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

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
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatReservationOrder(value: number) {
  if (value <= 0) return '-'
  if (value === 1) return '1ère'
  return `${value}e`
}

function getPeriodFromHour(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 16) return 'afternoon'
  return 'evening'
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-black/[0.04] bg-secondary/[0.01] p-4'>
      <div className='mb-1 text-[10px] uppercase tracking-[0.16em] text-secondary/40'>{label}</div>
      <div className='text-sm leading-6 text-secondary'>{value}</div>
    </div>
  )
}

export default function ScheduleShowModal() {
  const { openShowModal, toggleOpenShowModal, item, items } = useSchedulesStore()
  const navigate = useNavigate()

  const allWeekSchedules = items.flatMap(day => [...day.morning, ...day.afternoon, ...day.evening])

  const itemDate = item.datetime ? new Date(item.datetime).toDateString() : ''
  const itemHour = item.datetime ? new Date(item.datetime).getHours() : 0
  const itemPeriod = getPeriodFromHour(itemHour)

  const periodSchedules = allWeekSchedules.filter(s => {
    if (!s.datetime) return false
    const sDate = new Date(s.datetime).toDateString()
    const sHour = new Date(s.datetime).getHours()
    const sPeriod = getPeriodFromHour(sHour)
    return sDate === itemDate && sPeriod === itemPeriod
  }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  const daySchedules = allWeekSchedules
    .filter((s) => s.datetime && new Date(s.datetime).toDateString() === itemDate)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  const currentIndex = periodSchedules.findIndex(s => s.datetime === item.datetime && s.session.id === item.session.id)
  const dayIndex = daySchedules.findIndex(s => s.datetime === item.datetime && s.session.id === item.session.id)
  const hasNext = currentIndex < periodSchedules.length - 1
  const hasPrev = currentIndex > 0
  const patientName = item.appointment?.patient
    ? `${item.appointment.patient.firstName} ${item.appointment.patient.lastName}`.trim()
    : item.appointment?.name || 'Non renseigné'

  const navigateTo = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < periodSchedules.length) {
      const { setItem } = useSchedulesStore.getState()
      setItem(periodSchedules[newIndex])
    }
  }

  const goToDetails = () => {
    toggleOpenShowModal()
    if (!item.appointment?.id) return
    const { user } = useAuthStore.getState()
    const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
    if (isPractitioner && item.appointment?.patient?.id) {
      navigate(`/back-office/patients?patientId=${item.appointment.patient.id}`)
    } else {
      navigate(`/back-office/appointments?id=${item.appointment.id}`)
    }
  }

  return (
    <div
      onClick={toggleOpenShowModal}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm transition duration-300',
        openShowModal ? '' : 'pointer-events-none opacity-0',
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'bo-surface w-full max-w-xl p-6 transition duration-300',
          openShowModal ? 'opacity-100' : 'translate-y-10 opacity-0 pointer-events-none',
        )}
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>Détail séance</p>
            <h1 className='mt-2 text-xl text-secondary font-medium'>Créneau sélectionné</h1>
            <p className='mt-2 text-sm leading-6 text-secondary/50'>Lecture rapide de la séance planifiée et de son horaire.</p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => navigateTo('prev')}
              disabled={!hasPrev}
              type='button'
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white text-secondary transition',
                hasPrev ? 'hover:border-primary/20 hover:text-primary' : 'opacity-30 cursor-not-allowed'
              )}
            >
              <CaretLeft size={16} />
            </button>
            <button
              onClick={() => navigateTo('next')}
              disabled={!hasNext}
              type='button'
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white text-secondary transition',
                hasNext ? 'hover:border-primary/20 hover:text-primary' : 'opacity-30 cursor-not-allowed'
              )}
            >
              <CaretRight size={16} />
            </button>
            <button
              onClick={toggleOpenShowModal}
              type='button'
              className='flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.06] bg-white text-secondary transition hover:border-primary/20 hover:text-primary'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className='mt-6 grid gap-3 sm:grid-cols-2'>
          <Info label='Patient' value={patientName} />
          <Info label='Service' value={item.session?.service?.name || '-'} />
          <Info
            label='N° réservation (jour)'
            value={dayIndex >= 0 ? `${formatReservationOrder(dayIndex + 1)} réservation` : '-'}
          />
          <Info label='Session' value={item.session?.session ? `Séance ${item.session.session}` : '-'} />
          <Info
            label='Durée'
            value={
              item.appointment?.motif?.duration
                ? `${item.appointment.motif.duration} min`
                : item.session?.duration
                  ? `${item.session.duration} min`
                  : '-'
            }
          />
          <Info label='Date & Heure' value={formatDateTimeLabel(item.datetime)} />
          <Info label='Praticien' value={item.appointment?.practitioner?.name || 'Non assigné'} />
          <Info label='Salle' value={item.appointment?.resource?.name || 'Non assignée'} />
          <Info label='Statut' value={item.appointment?.status || '-'} />
          <Info label='Motif' value={item.appointment?.motif?.name || '-'} />
        </div>

        <div className='mt-6 flex items-center justify-between gap-4'>
          <div className='text-sm text-secondary/40'>
            {currentIndex >= 0 ? currentIndex + 1 : '-'} / {periodSchedules.length}
          </div>
          {item.appointment?.id && (
            <button
              onClick={goToDetails}
              type='button'
              className='flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90'
            >
              <span>Voir détails</span>
              <CaretRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}