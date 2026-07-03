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
  type Icon,
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
  PENDING: { label: 'En attente', bg: 'bg-secondary/[0.08]', text: 'text-secondary', dot: 'bg-secondary' },
  CONFIRMED: { label: 'Confirmée', bg: 'bg-primary/[0.08]', text: 'text-primary', dot: 'bg-primary' },
  CANCELLED: { label: 'Annulée', bg: 'bg-accent/[0.08]', text: 'text-accent', dot: 'bg-accent' },
  COMPLETED: { label: 'Terminée', bg: 'bg-primary/[0.08]', text: 'text-primary', dot: 'bg-primary' },
  EXPIRED: { label: 'Expirée', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
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

function InfoRow({ icon: Icon, label, children }: { icon: Icon; label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-2.5'>
      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]'>
        <Icon size={12} className='text-primary' />
      </div>
      <div>
        <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>{label}</p>
        <p className='text-sm text-foreground'>{children}</p>
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
        className='max-lg:left-[15px] max-lg:right-[15px] max-lg:top-1/2 max-lg:-translate-y-1/2 max-h-[85vh] overflow-hidden shadow-xl shadow-black/[0.06] sm:max-w-md rounded-2xl'
      >
        {/* Header */}
        <div className='flex items-start justify-between pb-3'>
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
            <button onClick={() => toggleOpenShowModal()} className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground transition-colors' aria-label='Fermer'>
              <X size={13} />
            </button>
          </div>
        </div>

        <div className='h-px bg-border-subtle/40' />

        {/* Info rows */}
        <div className='grid grid-cols-2 gap-x-6 gap-y-4 py-4'>
          <InfoRow icon={Tag} label='Traitement'>{motif?.name || '-'}</InfoRow>
          <InfoRow icon={Clock} label='Durée'>{duration ? `${duration} min` : '-'}</InfoRow>
          <InfoRow icon={CalendarBlank} label='Séance'>{item.session?.session ? `Séance ${item.session.session}` : '-'}</InfoRow>
          <InfoRow icon={User} label='Praticien'>{apt?.practitioner?.name || 'Non assigné'}</InfoRow>
          <InfoRow icon={Door} label='Salle'>{apt?.resource?.name || 'Non assignée'}</InfoRow>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-border-subtle/40 py-3.5'>
          <span className='text-xs font-medium text-muted-foreground/40'>
            {period}{curIdx >= 0 && <span className='ml-1 text-muted-foreground/25'>· {curIdx + 1}</span>}
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
