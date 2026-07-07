import { useMemo, useState, useEffect } from 'react'
import type { CalendarViewMode } from '@/lib/calendarView'
import { cn } from '@/lib/utils'
import { createPractitionerColumns, type PractitionerStatsRow } from '@/pages/back-office/columns/practitionerAnalyticsColumns'
import { TanStackDataTable, useDataTable, DataTable } from '@/components/data-table'
import { EmptyUsersIllustration } from '@/components/illustrations'
import { UserCircle } from '@phosphor-icons/react'

const EmptyPractitionerIllustration = EmptyUsersIllustration

/* ─── Types ────────────────────────────────────────────────────── */

interface ScheduleAppointment {
  id: string
  status: string
  practitionerId?: string
  practitioner?: { id: string; name: string }
  motif?: { id: string; name: string }
}

interface ScheduleSlot {
  appointment?: ScheduleAppointment
}

interface CalendarDaySlots {
  morning: ScheduleSlot[]
  afternoon: ScheduleSlot[]
  evening: ScheduleSlot[]
}

interface PractitionerAnalyticsProps {
  practitioners: { id: string; name: string }[]
  viewMode: CalendarViewMode
  displayItems: CalendarDaySlots[]
  monthItemsByDate: Map<string, CalendarDaySlots>
  activeDayIdx: number
}

/* ─── Card view (1-2 practitioners) ───────────────────────────── */

function DetailedCardView({ stats }: { stats: PractitionerStatsRow[] }) {
  return (
    <div className='flex gap-6 w-full'>
      {stats.map((prac) => (
        <div
          key={prac.id}
          className='flex-1 rounded-control border border-border bg-card shadow-sm flex flex-col gap-5 p-6 transition-shadow hover:shadow-md'
        >
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary/5'>
                <UserCircle size={22} className='text-secondary/40' />
              </div>
              <div>
                <h3 className='text-[15px] font-semibold tracking-tight text-foreground leading-snug'>
                  {prac.name}
                </h3>
                <span className='mt-0.5 inline-flex items-center rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary/70'>
                  {prac.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='inline-flex h-6 min-w-[24px] items-center justify-center rounded-element border border-border-subtle bg-secondary/5 px-1.5 text-xs font-bold text-secondary/60'>
                {prac.count}
              </span>
              <span className='text-[10px] font-medium uppercase tracking-wider text-secondary/30'>RDV</span>
            </div>
          </div>

          {/* Motif breakdown */}
          <div className='flex flex-col gap-2'>
            <span className='text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/50 pb-1.5'>
              Répartition par Motif
            </span>
            {Object.keys(prac.motifCounts).length > 0 ? (
              Object.entries(prac.motifCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([motif, count]) => (
                  <div key={motif} className='flex items-center justify-between text-sm'>
                    <span className='text-secondary/70'>{motif}</span>
                    <span className='font-semibold text-foreground'>{count}</span>
                  </div>
                ))
            ) : (
              <p className='py-3 text-center text-xs italic text-muted-foreground'>Aucune réservation</p>
            )}
          </div>

          {/* Progress */}
          <div className='mt-auto pt-3 border-t border-border/50'>
            <div className='mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground'>
              <span>Charge de travail</span>
              <span className='font-semibold'>{prac.percentage.toFixed(1)}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full rounded-full bg-primary transition-all duration-700'
                style={{ width: `${Math.min(prac.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────── */

export default function PractitionerAnalytics({
  practitioners,
  viewMode,
  displayItems,
  monthItemsByDate,
  activeDayIdx,
}: PractitionerAnalyticsProps) {
  const [error, setError] = useState<string | null>(null)

  // Reset error when props change
  useEffect(() => { setError(null) }, [viewMode, displayItems, monthItemsByDate, activeDayIdx])

  // Extract appointments from current calendar view
  const appointments = useMemo(() => {
    try {
      let days: CalendarDaySlots[] = []

      if (viewMode === 'day') {
        if (displayItems[activeDayIdx]) days = [displayItems[activeDayIdx]]
      } else if (viewMode === 'week') {
        days = displayItems.filter(Boolean)
      } else if (viewMode === 'month') {
        days = Array.from(monthItemsByDate.values())
      }

      const appts: ScheduleAppointment[] = []
      days.forEach((day) => {
        if (!day) return
        ;[...day.morning, ...day.afternoon, ...day.evening].forEach((slot) => {
          if (slot?.appointment) appts.push(slot.appointment)
        })
      })

      return appts
    } catch (err) {
      setError('Erreur lors du chargement des données.')
      return []
    }
  }, [viewMode, displayItems, monthItemsByDate, activeDayIdx])

  // Aggregate per practitioner
  const stats = useMemo(() => {
    try {
      const total = appointments.length

      const rows: PractitionerStatsRow[] = practitioners.map((p) => {
        const practitionerAppts = appointments.filter((a) => a.practitionerId === p.id)
        const count = practitionerAppts.length
        const percentage = total > 0 ? (count / total) * 100 : 0
        const motifCounts = practitionerAppts.reduce((acc, a) => {
          const name = a.motif?.name || 'Inconnu'
          acc[name] = (acc[name] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return { ...p, count, percentage, motifCounts }
      })

      // Only show practitioners who have at least 1 reservation (respects filter upstream)
      // If total is 0, show everyone (unfiltered / empty state)
      const active = rows.filter((p) => p.count > 0 || total === 0)
      return active.sort((a, b) => b.count - a.count)
    } catch (err) {
      setError('Erreur lors du calcul des statistiques.')
      return []
    }
  }, [appointments, practitioners])

  const totalReservations = appointments.length
  const showCards = stats.length > 0 && stats.length <= 2

  // Hooks must always be called — even if we won't use the table in card mode
  const columns = useMemo(() => createPractitionerColumns(), [])
  const table = useDataTable({ data: stats, columns })

  /* Error state */
  if (error) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-3 p-8 text-center'>
        <p className='text-sm font-medium text-foreground'>Une erreur est survenue</p>
        <p className='text-xs text-muted-foreground'>{error}</p>
      </div>
    )
  }

  /* Card view — 1 or 2 practitioners */
  if (showCards) {
    return (
      <div className='flex h-full flex-col w-full'>
        <div className='flex flex-col gap-0.5 px-6 py-4 border-b border-border-subtle'>
          <h2 className='text-[15px] font-semibold tracking-tight text-foreground'>Analyse des Praticiens</h2>
          <p className='text-xs text-muted-foreground'>
            {totalReservations} réservation{totalReservations !== 1 ? 's' : ''} dans la période
          </p>
        </div>
        <div className='p-6'>
          <DetailedCardView stats={stats} />
        </div>
      </div>
    )
  }

  /* Table view — 3+ practitioners */
  return (
    <DataTable.Root>
      <div className='flex items-center justify-between px-4 py-3 border-b border-border-subtle'>
        <div className='flex flex-col gap-0.5'>
          <h2 className='text-[15px] font-semibold tracking-tight text-foreground'>Analyse des Praticiens</h2>
          <p className='text-xs text-muted-foreground'>
            {totalReservations} réservation{totalReservations !== 1 ? 's' : ''} dans la période
          </p>
        </div>
      </div>
      <TanStackDataTable
        table={table}
        emptyIllustration={EmptyPractitionerIllustration}
        emptyTitle='Aucun praticien trouvé'
        emptyDescription='Aucune réservation pour la période sélectionnée.'
      />
    </DataTable.Root>
  )
}
