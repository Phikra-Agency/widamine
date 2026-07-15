import { useUsersStore } from '@/stores/usersStore'
import { useAuthStore } from '@/stores/authStore'
import { Plus, Trash as Trash2, MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { useSearchHighlight } from '@/hooks/useSearchHighlight'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Role } from '@/stores/authStore'
import { FormDialog, FieldError } from '@/components/bo'
import { userCreateSchema, userEditSchema } from '@/lib/formSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import { DataTable, DataTableFilterPills, DataTablePagination, globalSearchFilter, TanStackDataTable, type FilterPillOption } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGlobalSearchStore } from '@/stores/globalSearchStore'
import { createUsersColumns, RoleBadge, USERS_EMPTY_ILLUSTRATION } from './columns/usersColumns'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const FAB_CLASSES = 'fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-bo-fab'

const ROLE_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Tous', color: 'mist' },
  { value: 'RECEPTIONIST', label: 'Réception', color: 'sky' },
  { value: 'ADMIN', label: 'Admin', color: 'sea' },
  { value: 'DOCTOR', label: 'Médecin', color: 'sage' },
  { value: 'PRACTITIONER', label: 'Praticien', color: 'aqua' },
]

const ROLE_OPTIONS: Record<string, { label: string; bg: string; text: string; activeBg: string; activeBorder: string; activeText: string }> = {
  ADMIN: { label: 'Administrateur', bg: 'bg-violet-50', text: 'text-violet-600', activeBg: 'bg-violet-50', activeBorder: 'border-violet-300', activeText: 'text-violet-700' },
  DOCTOR: { label: 'Médecin', bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-50', activeBorder: 'border-emerald-300', activeText: 'text-emerald-700' },
  RECEPTIONIST: { label: 'Réceptionniste', bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-blue-50', activeBorder: 'border-blue-300', activeText: 'text-blue-700' },
  PRACTITIONER: { label: 'Praticien', bg: 'bg-sky-50', text: 'text-sky-600', activeBg: 'bg-sky-50', activeBorder: 'border-sky-300', activeText: 'text-sky-700' },
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchTerm = useGlobalSearchStore((s) => s.term)
  const setSearchTerm = useGlobalSearchStore((s) => s.setTerm)
  useSearchHighlight('users')

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
      }),
    [isReceptionist],
  )

  const table = useReactTable({
    data: items,
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
      <DataTable.Toolbar className='max-lg:px-0'>
        <div className='hidden lg:flex flex-wrap items-center gap-1.5'>
          <DataTableFilterPills
            options={ROLE_FILTER_PILLS}
            value={roleFilter}
            onChange={(value) => setRoleFilter(value as Role | 'all')}
          />
        </div>
        <div className='flex lg:hidden items-center gap-2 flex-1'>
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as Role | 'all')}
          >
            <SelectTrigger size='sm' className='h-9 flex-1 text-xs font-medium'>
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_PILLS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-transparent text-muted-foreground hover:bg-muted/35'
            aria-label='Rechercher'
          >
            <MagnifyingGlass size={16} />
          </button>
        </div>
      </DataTable.Toolbar>

      {mobileSearchOpen && (
        <div className='px-4 pb-2 lg:hidden'>
          <Input
            placeholder='Rechercher...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='h-9 text-xs'
            autoFocus
          />
        </div>
      )}

      <DataTable.Desktop>
        <TanStackDataTable
          table={table}
          loading={loading}
          emptyIllustration={USERS_EMPTY_ILLUSTRATION}
          emptyTitle='Aucun utilisateur trouvé'
          stopClickOnColumns={[]}
          onRowClick={(user) => openEditModal(user)}
        />
      </DataTable.Desktop>

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && (
            <div className='px-3 py-8 text-center text-sm text-muted-foreground'>Chargement…</div>
          )}
          {isEmpty && <DataTable.Empty illustration={USERS_EMPTY_ILLUSTRATION} title='Aucun utilisateur trouvé' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const initials = (item.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <DataTable.MobileCard key={row.id} data-id={item.id} onClick={() => openEditModal(item)}>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                      <span className='text-sm font-semibold text-primary'>{initials}</span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{item.name}</p>
                      <p className='mt-0.5 truncate text-xs text-muted-foreground'>{item.email}</p>
                    </div>
                    <RoleBadge role={item.role} />
                  </div>
                  {!isReceptionist && (
                    <div className='mt-3 flex justify-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(item) }}
                        className='gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700'
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
        <Button type='button' onClick={openCreateModal} className={FAB_CLASSES} aria-label='Ajouter un utilisateur'>
          <Plus size={22} weight='bold' />
        </Button>
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3 max-lg:justify-start'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useUsersStore()
  const { user: currentUser } = useAuthStore()
  const isEdit = operation === 'edit'
  const isReceptionist = currentUser?.role === 'RECEPTIONIST'
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen
  const validation = useFormValidation(isEdit ? userEditSchema : userCreateSchema, item)

  useEffect(() => {
    if (!isOpen) validation.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const initials = (item.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const selectedRole = ROLE_OPTIONS[item.role] || ROLE_OPTIONS.RECEPTIONIST

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      title={isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
      onSubmit={(e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
      onCancel={closeModal}
    >
      <div className='mb-4 flex items-center justify-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <span className='text-lg font-bold text-primary'>{initials}</span>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom complet</Label>
        <Input
          value={item.name ?? ''}
          onChange={(e) => {
            const next = { ...item, name: e.target.value }
            setItem(next)
            validation.onFieldChange('name', next)
          }}
          onBlur={() => validation.onFieldBlur('name')}
          placeholder='John Doe'
          aria-invalid={!!validation.getError('name')}
        />
        <FieldError message={validation.getError('name')} />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</Label>
        <Input
          type='email'
          value={item.email ?? ''}
          onChange={(e) => {
            const next = { ...item, email: e.target.value }
            setItem(next)
            validation.onFieldChange('email', next)
          }}
          onBlur={() => validation.onFieldBlur('email')}
          placeholder='john.doe@example.com'
          aria-invalid={!!validation.getError('email')}
        />
        <FieldError message={validation.getError('email')} />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Rôle</Label>
        <div className='grid grid-cols-2 gap-2'>
          {Object.entries(ROLE_OPTIONS).map(([role, config]) => {
            const isActive = item.role === role
            return (
              <button
                key={role}
                type='button'
                onClick={() => {
                  if (!isReceptionist) {
                    const next = { ...item, role: role as typeof item.role }
                    setItem(next)
                    validation.onFieldChange('role', next)
                  }
                }}
                className={cn(
                  'flex items-center gap-2 rounded-control border px-3 py-2.5 text-left text-sm font-medium transition-all',
                  isActive
                    ? cn(config.activeBg, config.activeBorder, config.activeText, 'ring-1 ring-current/20')
                    : 'border-border bg-background text-muted-foreground hover:border-border-strong hover:bg-muted/30',
                  isReceptionist && 'cursor-not-allowed opacity-60'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', isActive ? 'bg-current' : 'bg-muted-foreground/30')} />
                {config.label}
              </button>
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
          value={item.password ?? ''}
          onChange={(e) => {
            const next = { ...item, password: e.target.value }
            setItem(next)
            validation.onFieldChange('password', next)
          }}
          onBlur={() => validation.onFieldBlur('password')}
          placeholder={isEdit ? 'Laisser vide pour ne pas changer' : '********'}
          autoComplete='new-password'
          aria-invalid={!!validation.getError('password')}
        />
        <FieldError message={validation.getError('password')} />
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useUsersStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton className='gap-0 overflow-hidden p-0 sm:max-w-md'>
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
