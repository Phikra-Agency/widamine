import { useSchedulesStore } from '@/stores/schedulesStore'
import { saveCalendarReturnContext } from '@/lib/scheduleNavigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  Clock,
  MapPin,
  Tag,
  X,
  ArrowRight,
  User,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

function fmt(v?: string) {
  if (!v) return 'Date non définie'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return 'Date non définie'
  return d.toLocaleString('fr-FR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function ord(n: number) {
  if (n <= 0) return '-'
  return n === 1 ? '1er' : `${n}e`
}

function periodFromHour(h: number): 'morning' | 'afternoon' | 'evening' {
  if (h < 12) return 'morning'
  if (h < 16) return 'afternoon'
  return 'evening'
}

function periodLabel(p: string) {
  return p === 'morning' ? 'Matin' : p === 'afternoon' ? 'Après-midi' : 'Soir'
}

const STATUS_DOT: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: '#d97706' },
  CONFIRMED: { label: 'Confirmée', color: '#059669' },
  CANCELLED: { label: 'Annulée', color: '#dc2626' },
  COMPLETED: { label: 'Terminée', color: '#0284c7' },
  EXPIRED: { label: 'Expirée', color: '#6b7280' },
}

function StatusDot({ status }: { status: string }) {
  const m = STATUS_DOT[status] || STATUS_DOT.PENDING
  return (
    <span className='inline-flex items-center gap-1.5 text-xs'>
      <span className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  )
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 py-2.5'>
      <div className='flex min-w-0 items-center gap-2'>
        <Icon size={13} className='shrink-0 text-muted-foreground/30' />
        <span className='truncate text-xs font-medium text-muted-foreground/60'>{label}</span>
      </div>
      <div className='truncate text-right text-sm text-foreground/85'>{value}</div>
    </div>
  )
}

export default function ScheduleShowModal() {
  const { openShowModal, toggleOpenShowModal, item, items } = useSchedulesStore()
  const navigate = useNavigate()

  if (!item?.datetime) return null

  const allWeek = items.flatMap(d => [...d.morning, ...d.afternoon, ...d.evening])

  const itemDate = new Date(item.datetime).toDateString()
  const itemHour = new Date(item.datetime).getHours()
  const itemPeriod = periodFromHour(itemHour)

  const schedulesForDay = allWeek
    .filter(s => s.datetime && new Date(s.datetime).toDateString() === itemDate)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  const curIdx = schedulesForDay.findIndex(s =>
    item.id ? s.id === item.id : new Date(s.datetime).getTime() === new Date(item.datetime).getTime()
  )

  const apt = item.appointment
  const name = apt?.patient ? `${apt.patient.firstName} ${apt.patient.lastName}`.trim() : apt?.name || 'Non renseigné'
  const motif = apt?.motif
  const status = apt?.status || 'PENDING'
  const color = motif?.color || '#009fd6'

  const nav = (dir: 'next' | 'prev') => {
    const n = schedulesForDay.length
    if (n === 0) return
    if (curIdx < 0) {
      useSchedulesStore.getState().setItem(schedulesForDay[dir === 'next' ? 0 : n - 1])
      return
    }
    const i = dir === 'next' ? (curIdx + 1) % n : (curIdx - 1 + n) % n
    useSchedulesStore.getState().setItem(schedulesForDay[i])
  }

  const goDetails = () => {
    if (item.datetime && apt?.id) saveCalendarReturnContext(item)
    toggleOpenShowModal()
    if (apt?.id && apt?.patient?.id) navigate(`/patients?patientId=${apt.patient.id}`)
  }

  return (
    <Dialog open={openShowModal} onOpenChange={(o) => { if (!o) toggleOpenShowModal() }}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[85vh] overflow-hidden p-0 shadow-xl shadow-black/[0.06] sm:max-w-md rounded-2xl ring-1 ring-black/[0.02]'
      >
        <div className='px-5 pt-4 pb-2'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <h2 className='text-lg font-semibold leading-6 tracking-tight text-foreground'>{name}</h2>
              <div className='mt-0.5 inline-flex items-center gap-x-2 whitespace-nowrap'>
                <StatusDot status={status} />
                <span className='text-muted-foreground/20'>·</span>
                <span className='inline-flex items-center gap-1 text-xs text-muted-foreground/45'>
                  <CalendarBlank size={10} />
                  {fmt(item.datetime)}
                </span>
              </div>
            </div>
            <div className='flex shrink-0 items-center gap-0.5'>
              <div className='inline-flex items-center rounded-lg border border-border-subtle/40 bg-muted/10 px-0.5 py-0.5'>
                  <button
                    onClick={() => nav('prev')}
                    className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted/20 hover:text-foreground'
                    aria-label='Précédent'
                  >
                    <CaretLeft size={13} />
                  </button>
                <span className='flex h-7 min-w-[1.5rem] select-none items-center justify-center px-1 text-xs font-medium tabular-nums text-muted-foreground/60'>
                  {curIdx >= 0 ? curIdx + 1 : 1}/{schedulesForDay.length}
                </span>
                  <button
                    onClick={() => nav('next')}
                    className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted/20 hover:text-foreground'
                    aria-label='Suivant'
                  >
                    <CaretRight size={13} />
                  </button>
              </div>
              <button
                onClick={toggleOpenShowModal}
                className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/30 transition-colors hover:bg-muted/20 hover:text-foreground'
                aria-label='Fermer'
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className='mx-5 border-b border-border-subtle' />

        <div className='px-5 py-1'>
          <Row icon={Tag} label='Motif' value={
            <span className='inline-flex items-center gap-2'>
              {motif?.name || '-'}
              <span className='h-2 w-2 rounded-full' style={{ backgroundColor: color }} />
            </span>
          } />
          <Row
            icon={Clock}
            label='Durée'
            value={apt?.motif?.duration ? `${apt.motif.duration} min` : item.session?.duration ? `${item.session.duration} min` : '-'}
          />
          <Row icon={CalendarBlank} label='Session' value={item.session?.session ? `Séance ${item.session.session}` : '-'} />
          <Row icon={CalendarBlank} label='Ordre du jour' value={curIdx >= 0 ? ord(curIdx + 1) : '-'} />
          <Row icon={User} label='Praticien' value={apt?.practitioner?.name || 'Non assigné'} />
          <Row icon={MapPin} label='Salle' value={apt?.resource?.name || 'Non assignée'} />
        </div>

        <div className='flex items-center justify-between border-t border-border-subtle px-5 py-3'>
          <span className='text-xs text-muted-foreground/40'>
            {periodLabel(itemPeriod)}
          </span>
          {apt?.id && (
            <Button onClick={goDetails} variant='ghost' size='sm' className='gap-1.5 text-xs font-medium h-8'>
              Détails patient <ArrowRight size={12} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
