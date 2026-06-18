import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, User, CalendarBlank, CalendarDots as CalendarClock } from '@phosphor-icons/react'
import clsx from 'clsx'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import { Button } from '@/components/ui'
import type { Patient } from '@/stores/patientsStore'

export const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  MALE: { label: 'Homme', color: 'bg-blue-50 text-blue-600' },
  FEMALE: { label: 'Femme', color: 'bg-pink-50 text-pink-600' },
  OTHER: { label: 'Autre', color: 'bg-gray-50 text-gray-600' },
}

export function getAppointmentStats(patient: Patient) {
  const now = Date.now()
  const appts = patient.appointments || []
  const count = appts.length
  let nextDate: Date | null = null
  let lastDate: Date | null = null

  for (const appt of appts) {
    const schedule = appt.schedules?.[0]
    if (!schedule?.datetime) continue
    const dt = new Date(schedule.datetime).getTime()
    if (dt >= now && (!nextDate || dt < nextDate.getTime())) {
      nextDate = new Date(schedule.datetime)
    }
    if (dt < now && (!lastDate || dt > lastDate.getTime())) {
      lastDate = new Date(schedule.datetime)
    }
  }

  return { count, nextDate, lastDate }
}

type PatientColumnsDeps = {
  isPractitioner: boolean
  onEdit: (item: Patient) => void
  onDelete: (item: Patient) => void
}

export function createPatientsColumns({
  isPractitioner,
  onEdit,
  onDelete,
}: PatientColumnsDeps): ColumnDef<Patient>[] {
  return [
    {
      id: 'name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Patient' />,
      cell: ({ row }) => {
        const genderConf = GENDER_CONFIG[row.original.gender] || GENDER_CONFIG.OTHER
        return (
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/5'>
              <User size={16} className='text-secondary/40' />
            </div>
            <div>
              <span className='block text-sm font-semibold tracking-tight'>
                {row.original.firstName} {row.original.lastName}
              </span>
              <span
                className={clsx(
                  'mt-1 inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                  genderConf.color,
                  row.original.gender === 'MALE' ? 'border-blue-100 bg-blue-50/50' :
                  row.original.gender === 'FEMALE' ? 'border-pink-100 bg-pink-50/50' :
                  'border-gray-100 bg-gray-50/50',
                )}
              >
                {genderConf.label}
              </span>
            </div>
          </div>
        )
      },
      meta: { width: 'wide' },
    },
    {
      id: 'gender',
      accessorKey: 'gender',
      enableHiding: true,
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.gender),
    },
    {
      id: 'city',
      accessorKey: 'city',
      enableHiding: true,
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.city, ['all', '', null, undefined, 'null']),
    },
    {
      id: 'reservations',
      accessorFn: (row) => getAppointmentStats(row).count,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Réservations' />,
      cell: ({ row }) => {
        const stats = getAppointmentStats(row.original)
        return (
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-6 min-w-[24px] items-center justify-center rounded-lg border border-border-subtle bg-secondary/5 px-1.5 text-xs font-bold text-secondary/60'>
              {stats.count}
            </span>
            <span className='text-[10px] font-medium uppercase tracking-wider text-secondary/30'>RDV</span>
          </div>
        )
      },
    },
    {
      id: 'nextDate',
      accessorFn: (row) => getAppointmentStats(row).nextDate?.getTime() ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prochain RDV' />,
      cell: ({ row }) => {
        const stats = getAppointmentStats(row.original)
        if (!stats.nextDate) return <span className='text-xs font-medium text-secondary/20'>—</span>
        return (
          <div className='flex items-center gap-2 text-secondary/70'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/5'>
              <CalendarClock size={14} className='text-primary' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[13px] font-medium'>
                {stats.nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
              <span className='text-[10px] font-medium text-secondary/40'>
                {stats.nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'lastDate',
      accessorFn: (row) => getAppointmentStats(row).lastDate?.getTime() ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Dernier RDV' />,
      cell: ({ row }) => {
        const stats = getAppointmentStats(row.original)
        if (!stats.lastDate) return <span className='text-xs font-medium text-secondary/20'>—</span>
        return (
          <div className='flex items-center gap-2 text-secondary/50'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/5'>
              <CalendarBlank size={14} className='text-secondary/40' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[13px] font-medium'>
                {stats.lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
              <span className='text-left text-[10px] font-medium text-secondary/40'>
                {stats.lastDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )
      },
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
          {!isPractitioner && (
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => onDelete(row.original)}
              className='text-muted-foreground hover:bg-red-50 hover:text-red-600'
            >
              <Trash2 size={16} />
            </Button>
          )}
        </DataTable.RowActions>
      ),
      meta: { align: 'right', width: 'actions' },
    },
  ]
}

export const PATIENTS_EMPTY_ICON = User
