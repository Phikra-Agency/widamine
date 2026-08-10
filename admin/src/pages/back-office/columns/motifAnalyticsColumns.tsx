import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'

function pctChange(current: number, previous: number): number | null {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function TrendPill({ value }: { value: number | null }) {
  if (value === null) return <span className='text-xs text-secondary/30'>—</span>
  const up = value >= 0
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold', up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
      {up ? '↑' : '↓'} {Math.abs(value).toFixed(0)}%
    </span>
  )
}

export interface MotifRow {
  id: string
  name: string
  yesterday: number
  today: number
  tomorrow: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
  thisYear: number
  share: number
}

export function createMotifColumns(): ColumnDef<MotifRow>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => row.name,
      filterFn: (row, _columnId, filterValue) => {
        const val = String(filterValue).toLowerCase()
        return row.original.name.toLowerCase().includes(val)
      },
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          table={table}
          title='Traitement'
          searchColumn={column}
        />
      ),
      cell: ({ row }) => (
        <span className='text-sm font-semibold tracking-tight text-foreground truncate max-w-[200px] block'>
          {row.original.name}
        </span>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'yesterday',
      accessorFn: (row) => row.yesterday,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title="Hier" />,
      cell: ({ row }) => (
        <span className='text-[13px] font-medium text-secondary/40'>{row.original.yesterday}</span>
      ),
    },
    {
      id: 'today',
      accessorFn: (row) => row.today,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title="Aujourd'hui" />,
      cell: ({ row }) => (
        <span className={cn('text-[13px]', row.original.today > 0 ? 'font-semibold text-foreground' : 'font-medium text-secondary/40')}>
          {row.original.today}
        </span>
      ),
    },
    {
      id: 'tomorrow',
      accessorFn: (row) => row.tomorrow,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Demain' />,
      cell: ({ row }) => (
        <span className='text-[13px] font-medium text-secondary/40'>{row.original.tomorrow}</span>
      ),
    },
    {
      id: 'thisWeek',
      accessorFn: (row) => row.thisWeek,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Cette semaine' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span className='inline-flex h-6 min-w-[24px] items-center justify-center rounded-element border border-border-subtle bg-secondary/5 px-1.5 text-xs font-bold text-secondary/60'>
            {row.original.thisWeek}
          </span>
        </div>
      ),
    },
    {
      id: 'lastWeek',
      accessorFn: (row) => row.lastWeek,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Sem. dernière' />,
      cell: ({ row }) => (
        <span className='text-[13px] font-medium text-secondary/40'>{row.original.lastWeek}</span>
      ),
    },
    {
      id: 'thisMonth',
      accessorFn: (row) => row.thisMonth,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Ce mois' />,
      cell: ({ row }) => (
        <span className='text-[13px] font-medium text-secondary/40'>{row.original.thisMonth}</span>
      ),
    },
    {
      id: 'lastMonth',
      accessorFn: (row) => row.lastMonth,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Mois dernier' />,
      cell: ({ row }) => (
        <span className='text-[13px] font-medium text-secondary/40'>{row.original.lastMonth}</span>
      ),
    },
    {
      id: 'thisYear',
      accessorFn: (row) => row.thisYear,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Cette année' />,
      cell: ({ row }) => (
        <span className='text-[13px] font-bold text-secondary/60'>{row.original.thisYear}</span>
      ),
    },
    {
      id: 'trend',
      accessorFn: (row) => pctChange(row.thisWeek, row.lastWeek) ?? 0,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Tendance' />,
      cell: ({ row }) => (
        <TrendPill value={pctChange(row.original.thisWeek, row.original.lastWeek)} />
      ),
    },
    {
      id: 'share',
      accessorFn: (row) => row.share,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Part (%)' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5 w-full min-w-[80px] max-w-[120px]'>
          <div className='h-1.5 flex-1 rounded-full bg-secondary/10 overflow-hidden'>
            <div 
              className='h-full rounded-full bg-primary transition-all duration-500' 
              style={{ width: `${Math.min(100, Math.max(0, row.original.share))}%` }} 
            />
          </div>
          <span className='text-[11px] font-semibold text-secondary/60 w-8 shrink-0 text-right'>
            {row.original.share.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ]
}
