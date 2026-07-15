import { useMemo } from 'react'
import { formatLocalDate } from '@/lib/date'
import { type CalendarDaySlots } from '@/components/calendar/views/CalendarGridCells'
import { type EventCardSchedule } from '@/components/calendar/EventCard'

interface FlatRow {
  id: string
  dateKey: string
  dayLabel: string
  time: string
  patient: string
  motif: string
  motifColor?: string
  practitioner: string
  resource: string
  status: string
}

interface CalendarTableGridProps {
  weekDates: Date[]
  displayItems: CalendarDaySlots[]
  onOpenSchedule: (schedule: any) => void
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Absent',
  EXPIRED: 'Expiré',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  COMPLETED: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
  NO_SHOW: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  EXPIRED: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' },
}

function statusPill(status: string) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function formatTimeOnly(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function flattenToRows(items: CalendarDaySlots[], weekDates: Date[]): FlatRow[] {
  const rows: FlatRow[] = []
  items.forEach((day, dayIdx) => {
    const date = dayIdx < weekDates.length ? weekDates[dayIdx] : null
    const dateKey = date ? formatLocalDate(date) : ''
    const dayLabel = date
      ? date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
      : ''
    const addSchedules = (schedules: EventCardSchedule[]) => {
      schedules.forEach((s) => {
        const a = s.appointment
        rows.push({
          id: s.id,
          dateKey,
          dayLabel,
          time: formatTimeOnly(s.datetime),
          patient: a?.patient ? `${a.patient.firstName} ${a.patient.lastName}` : (a?.name || '—'),
          motif: a?.motif?.name || s.session.motif.name,
          motifColor: a?.motif?.color,
          practitioner: a?.practitioner?.name || '—',
          resource: a?.resource?.name || '—',
          status: a?.status || 'PENDING',
        })
      })
    }
    addSchedules(day.morning)
    addSchedules(day.afternoon)
    addSchedules(day.evening)
  })
  return rows.sort((a, b) => `${a.dateKey}T${a.time}`.localeCompare(`${b.dateKey}T${b.time}`))
}

export default function CalendarTableGrid({ weekDates, displayItems, onOpenSchedule }: CalendarTableGridProps) {
  const rows = useMemo(() => flattenToRows(displayItems, weekDates), [displayItems, weekDates])

  if (rows.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-16 text-center'>
        <p className='text-sm font-medium text-secondary'>Aucune réservation</p>
        <p className='text-xs text-secondary/40'>Aucune réservation pour cette période</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/50'>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Jour</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Horaire</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Patient</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Traitement</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Praticien</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Ressource</th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60'>Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onOpenSchedule({ id: row.id, datetime: '', session: { id: 0, session: 0, duration: 0, motif: { id: '', name: row.motif } }, appointment: { motif: { id: '', name: row.motif }, patient: { firstName: row.patient.split(' ')[0] || '', lastName: row.patient.split(' ').slice(1).join(' ') || '' }, practitioner: { name: row.practitioner }, resource: { name: row.resource }, status: row.status } } as any)}
              className='cursor-pointer border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/30'
            >
              <td className='px-4 py-3 text-[13px] font-medium text-foreground whitespace-nowrap'>{row.dayLabel}</td>
              <td className='px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap'>{row.time}</td>
              <td className='px-4 py-3 text-[13px] font-medium text-foreground'>{row.patient}</td>
              <td className='px-4 py-3'>
                <span className='inline-flex items-center gap-1.5 text-[13px] text-foreground'>
                  {row.motifColor && <span className='h-2 w-2 rounded-full' style={{ backgroundColor: row.motifColor }} />}
                  {row.motif}
                </span>
              </td>
              <td className='px-4 py-3 text-[13px] text-muted-foreground'>{row.practitioner}</td>
              <td className='px-4 py-3 text-[13px] text-muted-foreground'>{row.resource}</td>
              <td className='px-4 py-3'>{statusPill(row.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
