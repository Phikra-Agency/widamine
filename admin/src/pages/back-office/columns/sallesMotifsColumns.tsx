import { EmptyMotifIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2 } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui'

export type SallesMotifRow = {
  id?: string
  name: string
  duration?: number
  color?: string
}

type SallesMotifsColumnsDeps = {
  onEdit: (item: SallesMotifRow) => void
  onDelete: (item: SallesMotifRow) => void
}

export function createSallesMotifsColumns({ onEdit, onDelete }: SallesMotifsColumnsDeps): ColumnDef<SallesMotifRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
        header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Traitement' searchColumn={column} />
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
    {
      id: 'actions',
      header: () => <span className='sr-only'>Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <DataTable.RowActions>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => onEdit(row.original)}
            className='text-muted-foreground hover:bg-amber-50 hover:text-amber-600'
          >
            <Pen size={16} />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => onDelete(row.original)}
            className='text-muted-foreground hover:bg-red-50 hover:text-red-600'
          >
            <Trash2 size={16} />
          </Button>
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const SALLES_MOTIFS_EMPTY_ILLUSTRATION = EmptyMotifIllustration
