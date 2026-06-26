import { EmptyCalendarIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import type { ComponentType } from 'react'
import { CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, Clock, User } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import type { Appointment } from '@/stores/appointmentsStore'

type ReservationsColumnsDeps = {
  StatusSelect: ComponentType<{ appointmentId: number; status: string }>
}

function formatDate(datetime?: string) {
  if (!datetime) return null
  const d = new Date(datetime)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function createReservationsColumns({
  StatusSelect,
}: ReservationsColumnsDeps): ColumnDef<Appointment>[] {
  return [
    {
      id: 'patient',
      accessorFn: (row) => row.name || '',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Patient' searchColumn={column} />,
      cell: ({ row }) => {
        const appt = row.original
        const firstSchedule = appt.schedules?.[0]
        const formatted = formatDate(firstSchedule?.datetime)
        return (
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-element bg-primary/8'>
                <User size={14} className='text-primary' />
              </div>
              <span className='font-medium text-sm'>{appt.name}</span>
            </div>
            <div className='flex items-center gap-3 text-xs text-muted-foreground/60 ml-9'>
              <span className='flex items-center gap-1'>
                <EnvelopeSimple size={10} />
                <span className='truncate max-w-32'>{appt.email}</span>
              </span>
              {formatted && (
                <span className='flex items-center gap-1'>
                  <Clock size={10} />
                  <span>{formatted}</span>
                </span>
              )}
            </div>
          </div>
        )
      },
      meta: { width: 'wide' },
    },
    {
      id: 'motif',
      accessorFn: (row) => row.motif?.name || '',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Motif' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.motif?.name || '—'}
        </span>
      ),
    },
    {
      id: 'practitioner',
      accessorFn: (row) => row.practitioner?.name ?? 'Auto',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Praticien' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
          <Stethoscope size={14} className='text-muted-foreground/60' />
          <span>{row.original.practitioner?.name || 'Auto'}</span>
        </div>
      ),
    },
    {
      id: 'resource',
      accessorFn: (row) => row.resource?.name ?? '',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Ressource' />,
      cell: ({ row }) => {
        const name = row.original.resource?.name
        if (!name) return <span className='text-muted-foreground/40 text-sm'>—</span>
        return (
          <div className='flex items-center gap-1.5 text-muted-foreground text-sm'>
            <Door size={14} className='text-muted-foreground/60' />
            <span>{name}</span>
          </div>
        )
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Statut' />,
      cell: ({ row }) => (
        <div className='whitespace-nowrap'>
          <StatusSelect appointmentId={row.original.id!} status={row.original.status || 'PENDING'} />
        </div>
      ),
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.status),
      size: 180,
      minSize: 150,
    },
  ]
}

export const RESERVATIONS_EMPTY_ILLUSTRATION = EmptyCalendarIllustration
