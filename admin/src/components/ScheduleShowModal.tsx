import { useEffect, useRef, useState } from 'react'
import { useSchedulesStore } from '@/stores/schedulesStore'
import { useAuthStore } from '@/stores/authStore'
import { saveCalendarReturnContext } from '@/lib/scheduleNavigation'
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CalendarBlank,
  Clock,
  Tag,
  X,
  ArrowRight,
  User,
  Door,
  FadersHorizontal,
  Sun,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
  EXPIRED: 'Expirée',
  NO_SHOW: 'Absent',
}

const STATUS_THEME: Record<string, { hex: string }> = {
  PENDING:   { hex: '#F59E0B' },
  CONFIRMED: { hex: '#009FD6' },
  CANCELLED: { hex: '#F43F5E' },
  COMPLETED: { hex: '#1A3646' },
  EXPIRED:   { hex: '#64748B' },
  NO_SHOW:   { hex: '#8B5CF6' },
}

const hexAlpha = (hex: string, alpha: string) => `${hex}${alpha}`

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start gap-2.5'>
      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06] text-primary'>
        {icon}
      </div>
      <div className='min-w-0'>
        <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60'>{label}</p>
        <div className='mt-0.5 text-[13px] text-foreground'>{children}</div>
      </div>
    </div>
  )
}

function StatusDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = STATUS_THEME[value] || STATUS_THEME.PENDING

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className='inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-60'
        style={{
          color: current.hex,
          backgroundColor: hexAlpha(current.hex, '1A'),
          borderColor: hexAlpha(current.hex, '4D'),
        }}
      >
        <span className='h-1.5 w-1.5 shrink-0 rounded-full' style={{ backgroundColor: current.hex }} />
        {STATUS_LABELS[value] || STATUS_LABELS.PENDING}
        <CaretDown size={10} weight='duotone' className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        role='listbox'
        className={`absolute right-0 top-full z-20 mt-1.5 w-40 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg shadow-black/[0.08] transition duration-150 ease-out ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const s = STATUS_THEME[key] || STATUS_THEME.PENDING
          const selected = key === value
          return (
            <button
              key={key}
              type='button'
              role='option'
              aria-selected={selected}
              disabled={disabled}
              onClick={() => { onChange(key); setOpen(false) }}
              className='flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-primary/[0.06]'
              style={selected ? { color: s.hex, backgroundColor: hexAlpha(s.hex, '1A') } : undefined}
            >
              <span className='h-1.5 w-1.5 shrink-0 rounded-full' style={{ backgroundColor: s.hex }} />
              <span className={selected ? 'font-semibold' : ''}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ScheduleShowModal() {
  const { openShowModal, toggleOpenShowModal, item, items, filters, fetchItems } = useSchedulesStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (openShowModal) {
      // Reset animation on re-open
      setEntered(false)
      requestAnimationFrame(() => setEntered(true))
    }
  }, [openShowModal])

  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const allowedLabels = isPractitioner
    ? { CONFIRMED: STATUS_LABELS.CONFIRMED, COMPLETED: STATUS_LABELS.COMPLETED, NO_SHOW: STATUS_LABELS.NO_SHOW }
    : STATUS_LABELS

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

  async function handleStatusChange(next: string) {
    if (next === status || !apt?.id) return
    // Optimistic update
    setSaving(true)
    // Optimistic update
    if (item.appointment) {
      useSchedulesStore.getState().setItem({
        ...item,
        appointment: { ...item.appointment, status: next },
      })
    }
    try {
      await api.put(`appointments/${apt.id}`, { status: next })
      if (filters.date) fetchItems(filters.date, { force: true })
    } catch {
      // Rollback
      if (item.appointment) {
        useSchedulesStore.getState().setItem({
          ...item,
          appointment: { ...item.appointment, status },
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (!openShowModal) return null

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-40 bg-secondary/40 backdrop-blur-[2px] transition-opacity duration-200 ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => toggleOpenShowModal()}
      />

      {/* Modal */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label={`Réservation de ${name}`}
        className={`fixed inset-x-2 top-[5%] z-50 w-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-0 shadow-xl shadow-black/10 transition-all duration-200 ease-out sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className='flex items-start gap-3 px-4 pt-4 pb-3'>
          <span
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm shadow-black/20'
            style={{ backgroundColor: color }}
          >
            {initials(name)}
          </span>
          <div className='min-w-0 flex-1'>
            <h2 className='truncate text-sm font-semibold text-foreground'>{name}</h2>
            <p className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground/60'>
              <CalendarBlank size={11} weight='duotone' className='text-primary' />
              {fmtDate(item.datetime)}
              {fmtTime(item.datetime) && <><span className='text-muted-foreground/30'>·</span>{fmtTime(item.datetime)}</>}
            </p>
          </div>

          {/* Nav pill + close */}
          <div className='flex items-center gap-1.5'>
            <div className='flex items-center rounded-full border border-border bg-cream/60 px-1 py-0.5'>
              <button
                type='button'
                onClick={() => nav('prev')}
                aria-label='Précédent'
                className='rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
              >
                <CaretLeft size={12} weight='bold' />
              </button>
              <span className='px-1 text-[11px] font-medium tabular-nums text-foreground'>
                {curIdx >= 0 ? curIdx + 1 : 1}/{schedulesForDay.length}
              </span>
              <button
                type='button'
                onClick={() => nav('next')}
                aria-label='Suivant'
                className='rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
              >
                <CaretRight size={12} weight='bold' />
              </button>
            </div>
            <button
              type='button'
              onClick={() => toggleOpenShowModal()}
              aria-label='Fermer'
              className='rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground'
            >
              <X size={12} weight='bold' />
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className='grid grid-cols-1 gap-x-4 gap-y-4 border-t border-border px-4 py-4 sm:grid-cols-2'>
          <InfoRow icon={<Tag size={12} weight='duotone' />} label='Traitement'>{motif?.name || '-'}</InfoRow>
          <InfoRow icon={<Clock size={12} weight='duotone' />} label='Durée'>{duration ? `${duration} min` : '-'}</InfoRow>
          <InfoRow icon={<CalendarBlank size={12} weight='duotone' />} label='Séance'>{item.session?.session ? `Séance ${item.session.session}` : '-'}</InfoRow>
          <InfoRow icon={<User size={12} weight='duotone' />} label='Praticien'>{apt?.practitioner?.name || 'Non assigné'}</InfoRow>
          <InfoRow icon={<Door size={12} weight='duotone' />} label='Salle'>{apt?.resource?.name || 'Non assignée'}</InfoRow>
          <InfoRow icon={<FadersHorizontal size={12} weight='duotone' />} label='Statut'>
            <StatusDropdown value={status} onChange={handleStatusChange} disabled={saving} />
          </InfoRow>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-border px-4 py-3'>
          <span className='flex items-center gap-1.5 text-xs text-muted-foreground/60'>
            <Sun size={11} weight='duotone' className='text-primary' />
            {period}{curIdx >= 0 && <><span className='text-muted-foreground/30'>·</span> {curIdx + 1}</>}
          </span>
          {apt?.id && (
            <button
              type='button'
              onClick={goDetails}
              className='inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary'
            >
              Voir le patient
              <ArrowRight size={11} weight='bold' />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
