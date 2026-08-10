import { EmptyRoomIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { Door, PencilSimple as Pen, Trash as Trash2 } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { Resource } from '@/stores/resourcesStore'
import { PriorityBadge } from './shared/priorityBadge'
import { SallesMotifChips } from './shared/motifChips'
import { Button } from '@/components/ui'

type SallesColumnsDeps = {
  onEdit: (item: Resource) => void
  onDelete: (item: Resource) => void
}

export function createSallesColumns({ onEdit, onDelete }: SallesColumnsDeps): ColumnDef<Resource>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Salle' searchColumn={column} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10'>
            <Door size={16} className='text-primary' />
          </div>
          <span className='text-sm font-semibold tracking-tight'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Priorité' />,
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      meta: { width: 'narrow' },
    },
    {
      id: 'motifs',
      header: 'Traitements associés',
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

export const SALLES_EMPTY_ILLUSTRATION = EmptyRoomIllustration
