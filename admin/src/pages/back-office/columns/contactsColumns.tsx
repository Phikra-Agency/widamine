import { EmptyInboxIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader, DataTableColumnSearch } from '@/components/data-table'
import { Button } from '@/components/ui'

export type ContactRow = {
  id?: number
  name: string
  email: string
  phone: string
  context: string
}

type ContactColumnsDeps = {
  showReadAction: boolean
  onView: (item: ContactRow) => void
  onMarkRead: (item: ContactRow) => void
}

export function createContactsColumns({
  showReadAction,
  onView,
  onMarkRead,
}: ContactColumnsDeps): ColumnDef<ContactRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <div className='flex items-center justify-between gap-1'>
          <DataTableColumnHeader column={column} title='Expéditeur' />
          <DataTableColumnSearch column={column} />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-element bg-primary/8'>
            <User size={18} className='text-primary' />
          </div>
          <span className='font-medium'>{row.original.name}</span>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <EnvelopeSimple size={14} className='text-muted-foreground/60' />
          <span>{row.original.email}</span>
        </div>
      ),
      meta: { truncate: true },
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Téléphone' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <Phone size={14} className='text-muted-foreground/60' />
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      id: 'context',
      accessorKey: 'context',
      header: 'Message',
      enableSorting: false,
      cell: ({ row }) => (
        <span className='line-clamp-1 block max-w-[200px] text-sm text-muted-foreground'>
          {row.original.context}
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
            onClick={() => onView(row.original)}
            className='text-muted-foreground hover:bg-primary/8 hover:text-primary'
            title='Voir le message'
          >
            <Eye size={18} />
          </Button>
          {showReadAction && (
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => onMarkRead(row.original)}
              className='text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600'
              title='Marquer comme lu'
            >
              <CheckCircle size={18} />
            </Button>
          )}
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const CONTACTS_EMPTY_ILLUSTRATION = EmptyInboxIllustration
