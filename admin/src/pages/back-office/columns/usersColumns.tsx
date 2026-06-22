import { EmptyUsersIllustration } from '@/components/illustrations'
import type { ColumnDef } from '@tanstack/react-table'
import { PencilSimple as Pen, Trash as Trash2, User, Crown, Stethoscope, UserCircle } from '@phosphor-icons/react'
import clsx from 'clsx'
import type { Role } from '@/stores/authStore'
import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { Badge, Button } from '@/components/ui'
import { equalsOrAllFilter } from '@/components/data-table'

export type UserRow = {
  id: number
  name: string
  email: string
  role: Role
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400', icon: Crown },
  DOCTOR: { label: 'Médecin', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', icon: Stethoscope },
  RECEPTIONIST: { label: 'Réceptionniste', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', icon: UserCircle },
  PRACTITIONER: { label: 'Praticien', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400', icon: Stethoscope },
}

export function RoleBadge({ role }: { role: string }) {
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.RECEPTIONIST
  const RoleIcon = roleConfig.icon
  return (
    <Badge variant='secondary' className={clsx('gap-1 border-0 font-normal', roleConfig.color)}>
      <RoleIcon size={12} />
      {roleConfig.label}
    </Badge>
  )
}

type UserColumnsDeps = {
  isReceptionist: boolean
  onEdit: (item: UserRow) => void
  onDelete: (item: UserRow) => void
}

export function createUsersColumns({ isReceptionist, onEdit, onDelete }: UserColumnsDeps): ColumnDef<UserRow>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader column={column} table={table} title='Utilisateur' searchColumn={column} />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-element bg-muted'>
            <User size={16} className='text-muted-foreground' />
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
      cell: ({ row }) => <span className='text-muted-foreground'>{row.original.email}</span>,
      meta: { truncate: true },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title='Rôle' />,
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
      filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.role),
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
            onClick={() => onEdit(row.original)}
            className='text-muted-foreground hover:bg-amber-50 hover:text-amber-600'
          >
            <Pen size={16} />
          </Button>
          {!isReceptionist && (
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

export const USERS_EMPTY_ILLUSTRATION = EmptyUsersIllustration
