import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import type { CalendarViewMode } from '@/lib/calendarView'
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

/* ─── Main component ──────────────────────────────────────────── */

export default function PractitionerAnalytics({
  practitioners,
  viewMode,
  displayItems,
  monthItemsByDate,
  activeDayIdx,
}: PractitionerAnalyticsProps) {
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<{ p: PractitionerStatsRow; style: React.CSSProperties } | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>()

  const onHover = useCallback((p: PractitionerStatsRow, rect: DOMRect) => {
    clearTimeout(leaveTimer.current)
    setHovered({
      p,
      style: {
        position: 'fixed',
        left: `${rect.right + 12}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translateY(-50%)',
        zIndex: 9999,
      },
    })
  }, [])

  const onLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(null), 200)
  }, [])

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

        return { ...p, count, percentage, motifCounts, isTop: false }
      })

      const sorted = rows.sort((a, b) => b.count - a.count)
      if (sorted.length > 0) {
        sorted[0].isTop = true
      }
      return sorted
    } catch (err) {
      setError('Erreur lors du calcul des statistiques.')
      return []
    }
  }, [appointments, practitioners])

  const columns = useMemo(() => createPractitionerColumns({ onHover, onLeave }), [onHover, onLeave])
  const table = useDataTable({
    data: stats,
    columns,
    enablePagination: true,
    pageSize: 10,
  })

  /* Error state */
  if (error) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-3 p-8 text-center'>
        <p className='text-sm font-medium text-foreground'>Une erreur est survenue</p>
        <p className='text-xs text-muted-foreground'>{error}</p>
      </div>
    )
  }

  const rows = table.getRowModel().rows

  /* Table view */
  return (
    <DataTable.Root>
      <DataTable.Desktop>
        <TanStackDataTable
          table={table}
          emptyIllustration={EmptyPractitionerIllustration}
          emptyTitle='Aucun praticien trouvé'
          emptyDescription='Aucune réservation pour la période sélectionnée.'
          className='lg:overflow-visible'
        />
      </DataTable.Desktop>

      <DataTable.Mobile>
        <DataTable.MobileList>
          {rows.length === 0 && (
            <DataTable.Empty
              illustration={EmptyPractitionerIllustration}
              title='Aucun praticien trouvé'
              description='Aucune réservation pour la période sélectionnée.'
            />
          )}
          {rows.map((row) => {
            const p = row.original
            return (
              <DataTable.MobileCard key={p.id}>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-element bg-secondary/5'>
                    <UserCircle size={14} className='text-secondary/40' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-semibold'>{p.name}</p>
                    <p className='mt-0.5 text-xs text-secondary/50'>
                      {p.count} RDV · {p.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </DataTable.MobileCard>
            )
          })}
        </DataTable.MobileList>
      </DataTable.Mobile>

      {hovered && (
        <div
          style={hovered.style}
          onMouseEnter={() => clearTimeout(leaveTimer.current)}
          onMouseLeave={() => { leaveTimer.current = setTimeout(() => setHovered(null), 200) }}
          className='min-w-56 rounded-surface bg-popover p-3 shadow-bo-elevated ring-1 ring-border outline-none'
        >
          <div className='mb-2 flex items-center justify-between border-b border-border/50 pb-2'>
            <span className='text-[12px] font-semibold text-foreground'>
              Détails ({hovered.p.percentage.toFixed(1)}%)
            </span>
            <span className='text-[11px] text-muted-foreground'>{hovered.p.count} rés.</span>
          </div>

          {Object.keys(hovered.p.motifCounts).length > 0 ? (
            <div className='flex flex-col gap-1'>
              <span className='mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60'>
                Répartition par Motif
              </span>
              {Object.entries(hovered.p.motifCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([motif, count]) => (
                  <div key={motif} className='flex items-center justify-between text-xs'>
                    <span className='truncate pr-3 text-secondary/70'>{motif}</span>
                    <span className='shrink-0 font-semibold text-foreground'>{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className='text-xs italic text-muted-foreground'>Aucun motif</p>
          )}

          <div className='mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary'
              style={{ width: `${Math.min(hovered.p.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </DataTable.Root>
  )
}
