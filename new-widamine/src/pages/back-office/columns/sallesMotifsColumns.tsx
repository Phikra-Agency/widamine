import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, Stethoscope } from '@phosphor-icons/react'
import { getFamilyForMotif } from '@/lib/motifFamilies'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui'

export type SallesMotifRow = {
  id?: string
  name: string
  duration?: number
  color?: string
  bookingType?: string
}

type SallesMotifColumnsDeps = {
  onEdit: (item: SallesMotifRow) => void
  onDelete: (item: SallesMotifRow) => void
}

export function createSallesMotifsColumns({
  onEdit,
  onDelete,
}: SallesMotifColumnsDeps): ColumnDef<SallesMotifRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Motif' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/4'>
            <Stethoscope size={16} className='text-secondary/40' />
          </div>
          <span className='text-sm font-semibold tracking-tight'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'family',
      accessorFn: (row) => getFamilyForMotif(row).label,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Famille' />,
      cell: ({ row }) => {
        const family = getFamilyForMotif(row.original)
        return (
          <span
            className='inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold'
            style={{
              borderColor: `${family.hue}35`,
              backgroundColor: `${family.hue}12`,
              color: family.hue,
            }}
          >
            <span className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: family.hue }} />
            {family.label}
          </span>
        )
      },
    },
    {
      id: 'color',
      accessorKey: 'color',
      header: 'Couleur',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span
            className='h-4 w-4 rounded-full border border-border-subtle'
            style={{ backgroundColor: row.original.color || '#2E90C0' }}
          />
          <span className='text-xs font-medium text-secondary/55'>
            {row.original.color || '#2E90C0'}
          </span>
        </div>
      ),
    },
    {
      id: 'duration',
      accessorFn: (row) => row.duration ?? 30,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durée' />,
      cell: ({ row }) => (
        <span className='inline-flex items-center rounded-md border border-border-subtle bg-secondary/1 px-2.5 py-1 text-xs font-semibold text-secondary/70'>
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

export const SALLES_MOTIFS_EMPTY_ICON = Stethoscope
