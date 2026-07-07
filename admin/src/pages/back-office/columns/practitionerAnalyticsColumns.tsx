import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { UserCircle } from '@phosphor-icons/react'
import clsx from 'clsx'

export interface PractitionerStatsRow {
  id: string
  name: string
  count: number
  percentage: number
  motifCounts: Record<string, number>
}

export function createPractitionerColumns(): ColumnDef<PractitionerStatsRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Praticien' />
      ),
      cell: ({ row }) => {
        const p = row.original
        const topMotifs = Object.entries(p.motifCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)

        return (
          <div className='group relative flex items-center gap-3'>
            {/* Icon — matches Patient page exactly */}
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-secondary/5'>
              <UserCircle size={18} className='text-secondary/40' />
            </div>

            <div>
              <span className='block text-sm font-semibold tracking-tight'>
                {p.name}
              </span>
              {/* Percentage badge — same style as gender badge in Patients */}
              <span className='mt-1 inline-flex items-center rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary/70'>
                {p.percentage.toFixed(1)}%
              </span>
            </div>

            {/* Hover popover — positioned relative to this cell wrapper */}
            {(p.count > 0) && (
              <div
                className={clsx(
                  'pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2',
                  'min-w-56 rounded-control border border-border bg-popover p-3 shadow-lg',
                  'opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
                )}
              >
                <div className='mb-2 flex items-center justify-between border-b border-border/50 pb-2'>
                  <span className='text-[12px] font-semibold text-foreground'>
                    Détails ({p.percentage.toFixed(1)}%)
                  </span>
                  <span className='text-[11px] text-muted-foreground'>{p.count} rés.</span>
                </div>

                {topMotifs.length > 0 ? (
                  <div className='flex flex-col gap-1'>
                    <span className='mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60'>
                      Répartition par Motif
                    </span>
                    {topMotifs.map(([motif, count]) => (
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
                    style={{ width: `${Math.min(p.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      },
      meta: { width: 'wide' },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'count',
      accessorKey: 'count',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Réservations' />
      ),
      cell: ({ row }) => {
        const count = row.getValue('count') as number
        return (
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-6 min-w-[24px] items-center justify-center rounded-element border border-border-subtle bg-secondary/5 px-1.5 text-xs font-bold text-secondary/60'>
              {count}
            </span>
            <span className='text-[10px] font-medium uppercase tracking-wider text-secondary/30'>
              RDV
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
  ]
}
