import { EmptyInboxIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
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
  onMarkRead: (item: ContactRow) => void
}

export function createContactsColumns({
  showReadAction,
  onMarkRead,
}: ContactColumnsDeps): ColumnDef<ContactRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Expéditeur' searchColumn={column} />
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
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Email' />,
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
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Téléphone' />,
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
    ...(showReadAction
      ? [
          {
            id: 'actions' as const,
            header: () => <span className='sr-only'>Actions</span>,
            enableSorting: false,
            cell: ({ row }: { row: any }) => (
              <DataTable.RowActions>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onMarkRead(row.original)
                  }}
                  className='gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                >
                  <CheckCircle size={14} />
                  Marquer comme lu
                </Button>
              </DataTable.RowActions>
            ),
            meta: { align: 'right' as const, width: 'actions' as const },
          },
        ]
      : []),
  ]
}

export const CONTACTS_EMPTY_ILLUSTRATION = EmptyInboxIllustration
