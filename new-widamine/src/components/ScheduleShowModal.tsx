import { useSchedulesStore } from '@/stores/schedulesStore'
import { saveCalendarReturnContext } from '@/lib/scheduleNavigation'
import { getFamilyForMotif } from '@/lib/motifFamilies'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

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
    <div className='rounded-lg border border-border-subtle bg-secondary/[0.01] p-4'>
      <div className='mb-1 text-[10px] uppercase tracking-[0.16em] text-secondary/40'>{label}</div>
      <div className='text-sm leading-6 text-secondary'>{value}</div>
    </div>
  )
}

export default function ScheduleShowModal() {
  const { openShowModal, toggleOpenShowModal, item, items } = useSchedulesStore()
  const navigate = useNavigate()

  if (!item?.datetime) return null

  const allWeekSchedules = items.flatMap(day => [...day.morning, ...day.afternoon, ...day.evening])

  const itemDate = new Date(item.datetime).toDateString()
  const itemHour = new Date(item.datetime).getHours()
  const itemPeriod = getPeriodFromHour(itemHour)
  const itemSessionId = item.session?.id ?? 0

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

  const currentIndex = periodSchedules.findIndex(
    s => s.datetime === item.datetime && (s.session?.id ?? 0) === itemSessionId,
  )
  const dayIndex = daySchedules.findIndex(
    s => s.datetime === item.datetime && (s.session?.id ?? 0) === itemSessionId,
  )
  const hasNext = currentIndex < periodSchedules.length - 1
  const hasPrev = currentIndex > 0
  const patientName = item.appointment?.patient
    ? `${item.appointment.patient.firstName} ${item.appointment.patient.lastName}`.trim()
    : item.appointment?.name || 'Non renseigné'

  const motif = item.appointment?.motif
  const motifMeta = motif ? { bookingType: (motif as { bookingType?: string }).bookingType } : null
  const family = getFamilyForMotif(motifMeta)

  const navigateTo = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < periodSchedules.length) {
      const { setItem } = useSchedulesStore.getState()
      setItem(periodSchedules[newIndex])
    }
  }

  const goToDetails = () => {
    if (item.datetime && item.appointment?.id) {
      saveCalendarReturnContext(item)
    }
    toggleOpenShowModal()
    if (!item.appointment?.id) return
    if (item.appointment?.patient?.id) {
      navigate(`/back-office/patients?patientId=${item.appointment.patient.id}`)
    }
  }

  const title = motif?.name || item.session?.service?.name || 'Créneau sélectionné'

  return (
    <Dialog
      open={openShowModal}
      onOpenChange={(open) => {
        if (!open) toggleOpenShowModal()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className='max-h-[85vh] overflow-y-auto p-4 sm:p-6'
      >
        <DialogHeader className='gap-0 text-left'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className='h-2 w-2 rounded-full'
                  style={{ backgroundColor: family.hue }}
                />
                <p className='text-[10px] uppercase tracking-[0.2em] text-secondary/40'>{family.label}</p>
              </div>
              <DialogTitle className='mt-2 text-xl font-medium text-secondary'>{title}</DialogTitle>
              <DialogDescription className='mt-1 text-sm leading-6 text-secondary/50'>
                {formatDateTimeLabel(item.datetime)}
              </DialogDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                onClick={() => navigateTo('prev')}
                disabled={!hasPrev}
                type='button'
                variant='outline'
                size='icon'
                className='rounded-full'
              >
                <CaretLeft size={16} />
              </Button>
              <Button
                onClick={() => navigateTo('next')}
                disabled={!hasNext}
                type='button'
                variant='outline'
                size='icon'
                className='rounded-full'
              >
                <CaretRight size={16} />
              </Button>
              <Button
                onClick={toggleOpenShowModal}
                type='button'
                variant='outline'
                size='icon'
                className='rounded-full'
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

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
          <Info label='Famille' value={family.label} />
        </div>

        <div className='mt-6 flex items-center justify-between gap-4'>
          <div className='text-sm text-secondary/40'>
            {currentIndex >= 0 ? currentIndex + 1 : '-'} / {periodSchedules.length}
          </div>
          {item.appointment?.id && (
            <Button onClick={goToDetails} type='button' className='rounded-full'>
              <span>Voir détails</span>
              <CaretRight size={14} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
