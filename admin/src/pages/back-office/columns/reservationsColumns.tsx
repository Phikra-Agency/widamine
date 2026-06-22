import { EmptyCalendarIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import type { ComponentType } from 'react'
import { Eye, CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, Clock, User, Hash } from '@phosphor-icons/react'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import { Button } from '@/components/ui'
import type { Appointment } from '@/stores/appointmentsStore'

type ReservationsColumnsDeps = {
  StatusSelect: ComponentType<{ appointmentId: number; status: string }>
  onView: (item: Appointment) => void
}

function formatDate(datetime?: string) {
  if (!datetime) return null
  const d = new Date(datetime)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatDateFull(datetime?: string) {
  if (!datetime) return null
  const d = new Date(datetime)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function createReservationsColumns({
  StatusSelect,
  onView,
}: ReservationsColumnsDeps): ColumnDef<Appointment>[] {
  return [
    {
      id: 'reservation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Réservation' />,
      cell: ({ row }) => {
        const appt = row.original
        const firstSchedule = appt.schedules?.[0]
        const formatted = formatDate(firstSchedule?.datetime)
        return (
          <div className='space-y-1'>
            <div className='flex items-center gap-2 text-sm'>
              <Hash size={12} className='text-muted-foreground/50' />
              <span className='font-medium text-secondary'>#{appt.id}</span>
            </div>
            {formatted && (
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground/70'>
                <Clock size={11} />
                <span>{formatted}</span>
              </div>
            )}
          </div>
        )
      },
      meta: { width: 'wide' },
    },
    {
      id: 'patient',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Patient' />,
      cell: ({ row }) => (
        <div className='space-y-0.5'>
          <div className='flex items-center gap-1.5'>
            <User size={12} className='text-muted-foreground/50' />
            <span className='font-medium text-sm'>{row.original.name}</span>
          </div>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground/60 ml-4'>
            <EnvelopeSimple size={10} />
            <span className='truncate max-w-36'>{row.original.email}</span>
          </div>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'service',
      accessorFn: (row) => row.service?.name || '',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Service' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>{row.original.service?.name || '—'}</span>
      ),
    },
    {
      id: 'motif',
      accessorFn: (row) => row.motif?.name || row.service?.name || '',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Motif' />,
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.motif?.name || row.original.service?.name || '—'}
        </span>
      ),
    },
    {
      id: 'practitioner',
      accessorFn: (row) => row.practitioner?.name ?? 'Auto',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Praticien' />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ressource' />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='Statut' />,
      cell: ({ row }) => (
        <StatusSelect appointmentId={row.original.id!} status={row.original.status || 'PENDING'} />
      ),
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.status),
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

export const RESERVATIONS_EMPTY_ILLUSTRATION = EmptyCalendarIllustration
