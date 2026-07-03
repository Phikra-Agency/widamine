import { EmptyCalendarIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import type { ComponentType } from 'react'
import { Eye, CalendarBlank, EnvelopeSimple, Phone, Stethoscope } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import { Button } from '@/components/ui'
import type { Appointment } from '@/stores/appointmentsStore'

type AppointmentColumnsDeps = {
  StatusSelect: ComponentType<{ appointmentId: number; status: string }>
  onView: (item: Appointment) => void
}

export function createAppointmentsColumns({
  StatusSelect,
  onView,
}: AppointmentColumnsDeps): ColumnDef<Appointment>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Patient' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
      meta: { width: 'wide' },
    },
    {
      id: 'contact',
      header: 'Contact',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='space-y-0.5 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <EnvelopeSimple size={12} className='text-muted-foreground/60' />
            <span className='text-xs'>{row.original.email}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Phone size={12} className='text-muted-foreground/60' />
            <span className='text-xs'>{row.original.phone}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'motif',
      accessorFn: (row) => row.motif?.name || '',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Traitement' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground'>
          {row.original.motif?.name}
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Statut' />,
      cell: ({ row }) => (
        <StatusSelect appointmentId={row.original.id!} status={row.original.status || 'PENDING'} />
      ),
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.status),
      meta: { width: 'narrow' },
    },
    {
      id: 'practitioner',
      accessorFn: (row) => row.practitioner?.name ?? 'Auto',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Praticien' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground'>
          <Stethoscope size={14} className='text-muted-foreground/60' />
          <span className='text-sm'>{row.original.practitioner?.name || 'Auto'}</span>
        </div>
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
            className='text-muted-foreground hover:bg-primary/10 hover:text-primary'
          >
            <Eye size={16} />
          </Button>
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const APPOINTMENTS_EMPTY_ILLUSTRATION = EmptyCalendarIllustration
