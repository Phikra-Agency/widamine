import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, Door } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui'
import type { Resource } from '@/stores/resourcesStore'
import { PriorityBadge } from './shared/priorityBadge'
import { SallesMotifChips } from './shared/motifChips'

type SalleColumnsDeps = {
  onEdit: (item: Resource) => void
  onDelete: (item: Resource) => void
}

export function createSallesColumns({ onEdit, onDelete }: SalleColumnsDeps): ColumnDef<Resource>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Salle' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/4'>
            <Door size={16} className='text-secondary/40' />
          </div>
          <span className='text-sm font-semibold tracking-tight'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Priorité' />,
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} variant='salles' />,
      meta: { width: 'narrow' },
    },
    {
      id: 'motifs',
      header: 'Motifs associés',
      enableSorting: false,
      cell: ({ row }) => <SallesMotifChips assignments={row.original.motifAssignments} />,
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
            className='text-secondary/30 hover:bg-amber-50 hover:text-amber-600'
          >
            <Pen size={16} />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => onDelete(row.original)}
            className='text-secondary/30 hover:bg-red-50 hover:text-red-600'
          >
            <Trash2 size={16} />
          </Button>
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const SALLES_EMPTY_ICON = Door
