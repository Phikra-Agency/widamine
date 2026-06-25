import { EmptyMotifIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'

export type SallesMotifRow = {
  id?: string
  name: string
  duration?: number
  color?: string
}

export function createSallesMotifsColumns(): ColumnDef<SallesMotifRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Motif' searchColumn={column} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <span
            className='h-3 w-3 shrink-0 rounded-full'
            style={{ backgroundColor: row.original.color || '#2E90C0' }}
          />
          <span className='text-sm font-semibold tracking-tight'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'duration',
      accessorFn: (row) => row.duration ?? 30,
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Durée' />,
      cell: ({ row }) => (
        <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
          {row.original.duration || 30} min
        </span>
      ),
    },
  ]
}

export const SALLES_MOTIFS_EMPTY_ILLUSTRATION = EmptyMotifIllustration
