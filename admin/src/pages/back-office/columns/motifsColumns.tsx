import { EmptyMotifIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, Stethoscope } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader, DataTableColumnSearch } from '@/components/data-table'
import { Button } from '@/components/ui'

export type MotifRow = {
  id?: string
  name: string
  duration?: number
}

type MotifColumnsDeps = {
  onEdit: (item: MotifRow) => void
  onDelete: (item: MotifRow) => void
}

export function createMotifsColumns({ onEdit, onDelete }: MotifColumnsDeps): ColumnDef<MotifRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <div className='flex items-center justify-between gap-1'>
          <DataTableColumnHeader column={column} title='Motif' />
          <DataTableColumnSearch column={column} />
        </div>
      ),
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
      meta: { width: 'wide' },
    },
    {
      id: 'duration',
      accessorFn: (row) => row.duration ?? 30,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durée' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.original.duration || 30} min</span>
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

export const MOTIFS_EMPTY_ILLUSTRATION = EmptyMotifIllustration
