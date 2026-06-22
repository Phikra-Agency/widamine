import { EmptyRoomIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, FolderOpen } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui'
import type { Resource } from '@/stores/resourcesStore'
import { MotifChips } from './shared/motifChips'
import { PriorityBadge } from './shared/priorityBadge'

type ResourceColumnsDeps = {
  onEdit: (item: Resource) => void
  onDelete: (item: Resource) => void
}

export function createResourcesColumns({ onEdit, onDelete }: ResourceColumnsDeps): ColumnDef<Resource>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Salle' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-element bg-muted'>
            <FolderOpen size={16} className='text-muted-foreground' />
          </div>
          <span className='font-medium'>{row.original.name}</span>
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
      header: 'Motifs associés',
      enableSorting: false,
      cell: ({ row }) => <MotifChips motifs={row.original.motifs} />,
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

export const RESOURCES_EMPTY_ILLUSTRATION = EmptyRoomIllustration
