import { EmptyFolderIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui'

export type CategoryRow = {
  id: number
  category: string
  _count?: { services: number }
}

type CategoryColumnsDeps = {
  onEdit: (item: CategoryRow) => void
  onDelete: (item: CategoryRow) => void
}

export function createCategoriesColumns({ onEdit, onDelete }: CategoryColumnsDeps): ColumnDef<CategoryRow>[] {
  return [
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Catégorie' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-element bg-primary/8'>
            <FolderOpen size={18} className='text-primary' />
          </div>
          <span className='font-medium'>{row.original.category}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'services',
      accessorFn: (row) => row._count?.services ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Services' />,
      cell: ({ row }) => (
        <>
          <span className='font-medium'>{row.original._count?.services || 0}</span>
          <span className='ml-1 text-xs text-muted-foreground'>services</span>
        </>
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

export const CATEGORIES_EMPTY_ILLUSTRATION = EmptyFolderIllustration
