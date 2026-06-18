import { useUsersStore } from '@/stores/usersStore'
import { useAuthStore } from '@/stores/authStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, Crown, Stethoscope, UserCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Role } from '@/stores/authStore'
import FormDialog from '@/components/bo/FormDialog'
import { DataTable, DataTableFilterPills, globalSearchFilter, TanStackDataTable, type FilterPillOption } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { createUsersColumns, RoleBadge, USERS_EMPTY_ILLUSTRATION, type UserRow } from './columns/usersColumns'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const FAB_CLASSES = 'fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-bo-fab'

const ROLE_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Tous', color: 'mist' },
  { value: 'RECEPTIONIST', label: 'Réception', color: 'sky' },
  { value: 'ADMIN', label: 'Admin', color: 'sea' },
  { value: 'DOCTOR', label: 'Médecin', color: 'sage' },
  { value: 'PRACTITIONER', label: 'Praticien', color: 'aqua' },
]

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400', icon: Crown },
  DOCTOR: { label: 'Médecin', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', icon: Stethoscope },
  RECEPTIONIST: { label: 'Réceptionniste', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', icon: UserCircle },
  PRACTITIONER: { label: 'Praticien', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400', icon: Stethoscope },
}

export default function Users() {
  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <UsersTable />
        </Card>
      </div>
      <Modal />
      <DeleteModal />
    </div>
  )
}

function Heading() {
  const { openCreateModal } = useUsersStore()
  return (
    <div className='bo-page-heading'>
      <div>
        <h3 className='bo-title'>Gestion Des Utilisateurs</h3>
      </div>
      <Button onClick={openCreateModal} className='hidden h-10 px-5 lg:inline-flex'>
        <Plus weight='bold' /> Ajouter Un Utilisateur
      </Button>
    </div>
  )
}

function UsersTable() {
  const { items, fetchItems, openEditModal, openDeleteModal, openCreateModal } = useUsersStore()
  const { user: currentUser } = useAuthStore()
  const isReceptionist = currentUser?.role === 'RECEPTIONIST'
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const debouncedSearch = useDebouncedGlobalSearch()

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: 'role', value: roleFilter }],
    [roleFilter],
  )

  const columns = useMemo(
    () =>
      createUsersColumns({
        isReceptionist,
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    [isReceptionist, openDeleteModal, openEditModal],
  )

  const table = useReactTable({
    data: items as UserRow[],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedSearch,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name', 'email']),
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <DataTable.Toolbar>
        <DataTableFilterPills
          options={ROLE_FILTER_PILLS}
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as Role | 'all')}
        />
      </DataTable.Toolbar>

      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={USERS_EMPTY_ILLUSTRATION}
        emptyTitle='Aucun utilisateur trouvé'
        onRowClick={openEditModal}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && (
            <div className='px-3 py-8 text-center text-sm text-muted-foreground'>Chargement…</div>
          )}
          {isEmpty && <DataTable.Empty illustration={USERS_EMPTY_ILLUSTRATION} title='Aucun utilisateur trouvé' />}
          {!loading &&
            rows.map((row) => (
              <DataTable.MobileCard key={row.id} onClick={() => openEditModal(row.original)}>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-element bg-muted'>
                    <User size={16} className='text-muted-foreground' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-semibold'>{row.original.name}</p>
                      <RoleBadge role={row.original.role} />
                    </div>
                    <p className='mt-0.5 truncate text-xs text-muted-foreground'>{row.original.email}</p>
                  </div>
                  <div className='flex shrink-0 items-center gap-0.5' onClick={(e) => e.stopPropagation()}>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      onClick={() => openEditModal(row.original)}
                      className='text-muted-foreground hover:bg-amber-50 hover:text-amber-600'
                      aria-label='Modifier'
                    >
                      <Pen size={14} />
                    </Button>
                    {!isReceptionist && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => openDeleteModal(row.original)}
                        className='text-muted-foreground hover:bg-red-50 hover:text-red-600'
                        aria-label='Supprimer'
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </DataTable.MobileCard>
            ))}
        </DataTable.MobileList>
        <Button type='button' onClick={openCreateModal} className={FAB_CLASSES} aria-label='Ajouter un utilisateur'>
          <Plus size={22} weight='bold' />
        </Button>
      </DataTable.Mobile>
    </DataTable.Root>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useUsersStore()
  const { user: currentUser } = useAuthStore()
  const isEdit = operation === 'edit'
  const isReceptionist = currentUser?.role === 'RECEPTIONIST'
  const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
  const RoleIcon = roleConfig.icon
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      title={isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      onSubmit={(e) => {
        e.preventDefault()
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
      onCancel={closeModal}
    >
      <div className='mb-4 flex items-center justify-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-control bg-secondary/[0.04]'>
          <RoleIcon size={28} className='text-secondary/50' />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom complet</Label>
        <Input
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder='John Doe'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</Label>
        <Input
          type='email'
          value={item.email}
          onChange={(e) => setItem({ ...item, email: e.target.value })}
          placeholder='john.doe@example.com'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Rôle</Label>
        <div className='grid grid-cols-2 gap-2 sm:gap-3'>
          {Object.entries(ROLE_CONFIG).map(([role, config]) => {
            const RIcon = config.icon
            const isActive = item.role === role
            return (
              <Button
                key={role}
                type='button'
                variant='outline'
                onClick={() => {
                  if (!isReceptionist) {
                    setItem({ ...item, role: role as typeof item.role })
                  }
                }}
                className={clsx(
                  'flex h-auto flex-col items-center gap-2 p-3',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'text-secondary/50',
                  isReceptionist && 'cursor-not-allowed opacity-60'
                )}
              >
                <RIcon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className='text-center text-xs font-medium leading-tight'>{config.label}</span>
              </Button>
            )
          })}
        </div>
        {isReceptionist && (
          <p className='text-[11px] text-amber-600 mt-1'>Seul un administrateur peut modifier les rôles.</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Mot de passe</Label>
        <Input
          type='password'
          value={item.password}
          onChange={(e) => setItem({ ...item, password: e.target.value })}
          placeholder={isEdit ? 'Laisser vide pour ne pas changer' : '********'}
          autoComplete='new-password'
        />
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useUsersStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-5 text-center sm:p-6'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-control bg-red-50'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-base font-semibold text-secondary sm:text-lg'>Supprimer cet utilisateur ?</h2>
        </div>
        <DialogFooter className='border-t border-border px-5 py-3.5 sm:px-6 sm:py-4'>
          <Button variant='ghost' type='button' onClick={closeModal}>
            Annuler
          </Button>
          <Button variant='destructive' type='button' onClick={deleteItem}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
