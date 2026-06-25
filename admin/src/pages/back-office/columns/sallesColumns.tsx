import { EmptyRoomIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { Door } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { Resource } from '@/stores/resourcesStore'
import { PriorityBadge } from './shared/priorityBadge'
import { SallesMotifChips } from './shared/motifChips'

export function createSallesColumns(): ColumnDef<Resource>[] {
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
      header: 'Motifs associés',
      enableSorting: false,
      cell: ({ row }) => <SallesMotifChips assignments={row.original.motifAssignments} />,
    },
  ]
}

export const SALLES_EMPTY_ILLUSTRATION = EmptyRoomIllustration
