import { EmptyUsersIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { User } from '@phosphor-icons/react'
import clsx from 'clsx'
import type { Role } from '@/stores/authStore'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { equalsOrAllFilter } from '@/components/data-table'
import { cn } from '@/lib/utils'

export type UserRow = {
  id: number
  name: string
  email: string
  role: Role
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ADMIN: { label: 'Administrateur', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  DOCTOR: { label: 'Médecin', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  RECEPTIONIST: { label: 'Réceptionniste', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  PRACTITIONER: { label: 'Praticien', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
}

export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.RECEPTIONIST
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.bg, config.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function UserAvatar({ name }: { name: string }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
      <span className='text-xs font-semibold text-primary'>{initials}</span>
    </div>
  )
}

type UserColumnsDeps = {
  isReceptionist: boolean
}

export function createUsersColumns({ isReceptionist }: UserColumnsDeps): ColumnDef<UserRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Utilisateur' searchColumn={column} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <UserAvatar name={row.original.name} />
          <div className='min-w-0'>
            <span className='block truncate font-medium text-sm'>{row.original.name}</span>
            <span className='block truncate text-xs text-muted-foreground'>{row.original.email}</span>
          </div>
        </div>
      ),
      meta: { width: 'wide' },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Rôle' />,
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.role),
      meta: { width: 'narrow' },
    },
  ]
}

export const USERS_EMPTY_ILLUSTRATION = EmptyUsersIllustration
