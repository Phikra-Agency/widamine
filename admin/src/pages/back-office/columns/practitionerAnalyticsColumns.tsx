import { useRef, useCallback } from 'react'
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
  isTop: boolean
}

interface CellCallbacks {
  onHover: (p: PractitionerStatsRow, rect: DOMRect) => void
  onLeave: () => void
}

function PractitionerCell({ p, onHover, onLeave }: { p: PractitionerStatsRow } & CellCallbacks) {
  const ref = useRef<HTMLDivElement>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback(() => {
    clearTimeout(leaveTimer.current)
    const el = ref.current
    if (!el) return
    onHover(p, el.getBoundingClientRect())
  }, [p, onHover])

  const hide = useCallback(() => {
    leaveTimer.current = setTimeout(onLeave, 200)
  }, [onLeave])

  return (
    <div
      ref={ref}
      onMouseEnter={p.count > 0 ? show : undefined}
      onMouseLeave={p.count > 0 ? hide : undefined}
      className='flex items-center gap-3'
    >
      <div className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-control', p.isTop ? 'bg-amber-100 ring-2 ring-amber-300/60' : 'bg-secondary/5')}>
        <UserCircle size={18} className={p.isTop ? 'text-amber-600' : 'text-secondary/40'} />
      </div>

      <div>
        <span className='block text-sm font-semibold tracking-tight'>
          {p.name}
        </span>
        {p.isTop && (
          <span className='mt-0.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-300/40'>
            Meilleur
          </span>
        )}
      </div>
    </div>
  )
}

export function createPractitionerColumns(cbs: CellCallbacks): ColumnDef<PractitionerStatsRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Praticien' searchColumn={column} />
      ),
      cell: (info) => <PractitionerCell p={info.row.original} {...cbs} />,
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
    {
      id: 'percentage',
      accessorKey: 'percentage',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Charge' />
      ),
      cell: ({ row }) => {
        const pct = row.getValue('percentage') as number
        return (
          <div className='flex items-center gap-2'>
            <span className='min-w-[40px] text-xs font-semibold text-foreground'>
              {pct.toFixed(1)}%
            </span>
            <div className='h-2 w-full max-w-[80px] overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full rounded-full bg-primary transition-all'
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
  ]
}
