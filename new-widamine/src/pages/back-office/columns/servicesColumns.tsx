import type { ColumnDef } from '@tanstack/react-table'
import { Eye, PencilSimple as Pen, Trash as Trash2, FirstAid, Clock, CurrencyDollar } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import { Button } from '@/components/ui'

export type ServiceRow = {
  id?: string
  name: string
  price: number
  categoryId?: string
  _count?: { sessions: number }
  category?: { name: string }
  primaryDoctor?: { name: string }
}

type ServiceColumnsDeps = {
  onShow: (item: ServiceRow) => void
  onEdit: (item: ServiceRow) => void
  onDelete: (item: ServiceRow) => void
}

export function createServicesColumns({
  onShow,
  onEdit,
  onDelete,
}: ServiceColumnsDeps): ColumnDef<ServiceRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Service' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8'>
            <FirstAid size={18} className='text-primary' />
          </div>
          <span className='font-medium'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prix' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <CurrencyDollar size={14} className='text-muted-foreground/60' />
          <span className='font-medium'>{row.original.price}</span>
          <span className='text-xs text-muted-foreground/60'>DH</span>
        </div>
      ),
    },
    {
      id: 'sessions',
      accessorFn: (row) => row._count?.sessions ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Séances' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <Clock size={14} className='text-muted-foreground/60' />
          <span className='font-medium'>{row.original._count?.sessions || 0}</span>
        </div>
      ),
    },
    {
      id: 'doctor',
      accessorFn: (row) => row.primaryDoctor?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Médecin' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.original.primaryDoctor?.name || '—'}</span>
      ),
    },
    {
      id: 'categoryId',
      accessorKey: 'categoryId',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Catégorie' />,
      cell: ({ row }) =>
        row.original.category?.name ? (
          <span className='inline-flex items-center rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700'>
            {row.original.category.name}
          </span>
        ) : (
          '—'
        ),
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.categoryId),
      meta: { width: 'narrow' },
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
            onClick={() => onShow(row.original)}
            className='text-muted-foreground hover:bg-primary/8 hover:text-primary'
          >
            <Eye size={18} />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => onEdit(row.original)}
            className='text-muted-foreground hover:bg-amber-50 hover:text-amber-600'
          >
            <Pen size={18} />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={() => onDelete(row.original)}
            className='text-muted-foreground hover:bg-red-50 hover:text-red-600'
          >
            <Trash2 size={18} />
          </Button>
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const SERVICES_EMPTY_ICON = FirstAid
