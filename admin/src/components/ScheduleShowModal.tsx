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
  Door,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

function fmtDate(v?: string) {
  if (!v) return 'Date non définie'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return 'Date non définie'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtTime(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function periodFromHour(h: number) {
  if (h < 12) return 'Matin'
  if (h < 16) return 'Après-midi'
  return 'Soir'
}

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmée', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  COMPLETED: { label: 'Terminée', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  EXPIRED: { label: 'Expirée', bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function InfoCard({ icon: Icon, label, children, color }: { icon: React.ElementType; label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className='relative overflow-hidden rounded-surface bg-card shadow-bo-card'>
      <div className='px-4 py-3'>
        <div className='mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
          <Icon size={11} />
          {label}
        </div>
        <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
          {children}
          {color && <span className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ backgroundColor: color }} />}
        </div>
      </div>
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
  const period = periodFromHour(itemHour)

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
  const duration = apt?.motif?.duration || item.session?.duration

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
        className='max-h-[85vh] overflow-hidden p-0 shadow-xl shadow-black/[0.06] sm:max-w-md rounded-2xl'
      >
        {/* Header */}
        <div className='flex items-start justify-between px-5 pt-5 pb-3'>
          <div className='flex items-start gap-3'>
            <div
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white'
              style={{ backgroundColor: color }}
            >
              {initials(name)}
            </div>
            <div className='min-w-0 pt-0.5'>
              <h2 className='text-base font-semibold leading-5 text-foreground'>{name}</h2>
              <div className='mt-1.5 flex items-center gap-2'>
                <StatusBadge status={status} />
              </div>
              <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60'>
                <CalendarBlank size={11} />
                {fmtDate(item.datetime)}
                {fmtTime(item.datetime) && <><span className='text-muted-foreground/30'>·</span>{fmtTime(item.datetime)}</>}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-1'>
            <div className='inline-flex items-center rounded-lg bg-muted/40 px-0.5 py-0.5'>
              <button onClick={() => nav('prev')} className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-background hover:text-foreground' aria-label='Précédent'>
                <CaretLeft size={13} />
              </button>
              <span className='flex h-7 min-w-[1.5rem] select-none items-center justify-center px-1 text-xs font-medium tabular-nums text-muted-foreground/60'>
                {curIdx >= 0 ? curIdx + 1 : 1}/{schedulesForDay.length}
              </span>
              <button onClick={() => nav('next')} className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-background hover:text-foreground' aria-label='Suivant'>
                <CaretRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className='mx-5 h-px bg-border-subtle/40' />

        {/* Info cards grid */}
        <div className='grid grid-cols-2 gap-2.5 px-5 py-4'>
          <InfoCard icon={Tag} label='Motif' color={color}>{motif?.name || '-'}</InfoCard>
          <InfoCard icon={Clock} label='Durée'>{duration ? `${duration} min` : '-'}</InfoCard>
          <InfoCard icon={CalendarBlank} label='Séance'>{item.session?.session ? `Séance ${item.session.session}` : '-'}</InfoCard>
          <InfoCard icon={User} label='Praticien'>{apt?.practitioner?.name || 'Non assigné'}</InfoCard>
        </div>

        <div className='mx-5 h-px bg-border-subtle/40' />

        {/* Salle full width */}
        <div className='px-5 py-3'>
          <InfoCard icon={Door} label='Salle'>{apt?.resource?.name || 'Non assignée'}</InfoCard>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-border-subtle/40 px-5 py-3.5'>
          <span className='text-xs font-medium text-muted-foreground/40'>
            {period}{curIdx >= 0 && <span className='ml-1 text-muted-foreground/25'>· {curIdx + 1}{curIdx === 0 ? 'er' : 'e'} du jour</span>}
          </span>
          {apt?.id && (
            <Button onClick={goDetails} variant='ghost' size='sm' className='gap-1.5 text-xs font-medium h-8 text-primary/80 hover:text-primary hover:bg-primary/[0.06]'>
              Voir le patient <ArrowRight size={12} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
