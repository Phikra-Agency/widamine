import { useContactsStore } from '@/stores/contactsStore'
import { EnvelopeSimple, Phone, User, CheckCircle, X, ArrowRight, MagnifyingGlass, Trash as Trash2 } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, DataTableFilterPills, DataTablePagination, globalSearchFilter, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent } from '@/components/ui'
import { CONTACTS_EMPTY_ILLUSTRATION, createContactsColumns } from './columns/contactsColumns'
import { useDebounce } from 'use-debounce'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const READ_FILTER_PILLS: FilterPillOption[] = [
  { value: 'non-lus', label: 'Non lus', color: 'coral' },
  { value: 'lus', label: 'Lus', color: 'sage' },
]

export default function Contacts() {
  return (
    <div className='bo-page'>
      <div className="bo-page-inner bo-section-stack">
        <div className="bo-page-ambient-tr" />
        <div className="bo-page-ambient-bl" />

        <Heading />
        <Card className="bo-table-card">
          <ContactsTable />
        </Card>
      </div>
      <ShowModal />
      <ConfirmDelete />
    </div>
  )
}

function Heading() {
  return (
    <div>
      <h3 className="bo-title">Messages reçus</h3>
    </div>
  )
}

function ContactsTable() {
  const { items, filters, fetchItems, setItem, readItem, setFilters, setShowConfirm } = useContactsStore()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 300)

  useEffect(() => {
    setLoading(true)
    void fetchItems().finally(() => setLoading(false))
  }, [filters.read, fetchItems])

  const columns = useMemo(
    () =>
      createContactsColumns({
        showReadAction: !filters.read,
        onMarkRead: (item) => {
          setItem(item)
          void readItem()
        },
        onDelete: (item) => {
          setItem(item)
          setShowConfirm(true)
        },
      }),
    [filters.read, readItem, setItem, setShowConfirm],
  )

  const table = useDataTable({
    data: items,
    columns,
    enablePagination: true,
    pageSize: 10,
    globalFilter: debouncedSearch,
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name', 'email', 'phone']),
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <DataTable.Toolbar>
        {/* Desktop filters */}
        <div className='hidden lg:flex flex-wrap items-center gap-2'>
          <DataTableFilterPills
            options={READ_FILTER_PILLS}
            value={filters.read ? 'lus' : 'non-lus'}
            onChange={(value) => setFilters({ read: value === 'lus' })}
          />
        </div>

        {/* Mobile filters */}
        <div className='flex lg:hidden items-center gap-2 w-full'>
          <Select
            items={{ 'non-lus': 'Non lus', lus: 'Lus' }}
            value={filters.read ? 'lus' : 'non-lus'}
            onValueChange={(value) => setFilters({ read: value === 'lus' })}
          >
            <SelectTrigger size='sm' className='h-8 w-[110px] text-[13px] font-medium shrink-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {READ_FILTER_PILLS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='relative flex-1 min-w-0'>
            <MagnifyingGlass size={16} weight='bold' className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Rechercher...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-8 pl-8 text-[13px] bg-background border-border focus-visible:ring-0! focus-visible:border-border-strong!'
            />
          </div>
        </div>
      </DataTable.Toolbar>

      <DataTable.Desktop>
        <TanStackDataTable
          table={table}
          loading={loading}
          emptyIllustration={CONTACTS_EMPTY_ILLUSTRATION}
          emptyTitle="Aucun message trouvé"
          emptyDescription="Les messages reçus apparaîtront ici"
          stopClickOnColumns={["actions"]}
          onRowClick={(contact) => {
            useContactsStore.setState({ item: contact, openShowModal: true })
          }}
        />
      </DataTable.Desktop>

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && (
            <DataTable.Empty
              illustration={CONTACTS_EMPTY_ILLUSTRATION}
              title="Aucun message trouvé"
              description="Les messages reçus apparaîtront ici"
            />
          )}
          {!loading &&
            rows.map((row) => {
              const contact = row.original
              return (
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-element bg-primary/8'>
                      <User size={14} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold'>{contact.name}</p>
                    </div>
                  </div>
                  <div className='mt-3 space-y-2 text-xs text-foreground/60'>
                    <div className='flex items-center gap-2'>
                      <EnvelopeSimple size={14} className='shrink-0 text-muted-foreground/30' />
                      <span className='truncate'>{contact.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone size={14} className='shrink-0 text-muted-foreground/30' />
                      <span>{contact.phone}</span>
                    </div>
                    <div className='line-clamp-2 rounded-control bg-muted/30 p-2.5 text-xs leading-relaxed text-muted-foreground/50'>
                      {contact.context}
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    {!filters.read && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 h-9 gap-1.5 text-primary border-primary/30 hover:bg-primary/5'
                        onClick={(e) => {
                          e.stopPropagation()
                          setItem(contact)
                          void readItem()
                        }}
                      >
                        <CheckCircle size={14} /> Lu
                      </Button>
                    )}
                    {filters.read && <div className='flex-1' />}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        setItem(contact)
                        setShowConfirm(true)
                      }}
                      className='flex shrink-0 h-9 w-9 items-center justify-center rounded-control border border-border bg-secondary/[0.04] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors'
                      aria-label='Supprimer le message'
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type='button'
                      onClick={() => useContactsStore.setState({ item: contact, openShowModal: true })}
                      className='flex shrink-0 h-9 w-9 items-center justify-center rounded-control border border-border bg-secondary/[0.04] text-secondary/50 hover:bg-secondary/[0.08] hover:text-secondary transition-colors'
                    >
                      <ArrowRight size={15} weight='bold' />
                    </button>
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
      </DataTable.Mobile>

      <div className='lg:hidden'>
        <DataTablePagination table={table} />
      </div>
      <div className='hidden lg:flex justify-end px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
  )
}

function ConfirmDelete() {
  const confirmOpen = useContactsStore((s) => s.confirmOpen)
  const setShowConfirm = useContactsStore((s) => s.setShowConfirm)
  const item = useContactsStore((s) => s.item)
  const deleteItem = useContactsStore((s) => s.deleteItem)

  if (!confirmOpen) return null

  return (
    <Dialog open onOpenChange={(open) => !open && setShowConfirm(false)}>
      <DialogContent showCloseButton className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='flex items-center gap-3 p-5'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600'>
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className='text-base font-semibold text-secondary'>Supprimer ce message ?</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Le message de <span className='font-medium text-foreground'>{item.name}</span> sera définitivement supprimé.
            </p>
          </div>
        </div>
        <div className='flex items-center justify-end gap-2 border-t border-border-subtle/40 px-5 py-3'>
          <Button variant='ghost' size='sm' type='button' onClick={() => setShowConfirm(false)}>
            Annuler
          </Button>
          <Button variant='destructive' size='sm' type='button' onClick={() => void deleteItem()}>
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShowModal() {
  const openShowModal = useContactsStore((s) => s.openShowModal)
  const toggleOpenShowModal = useContactsStore((s) => s.toggleOpenShowModal)
  const item = useContactsStore((s) => s.item)

  if (!openShowModal || !item?.name) return null

  const initials = item.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Dialog open onOpenChange={(open) => !open && toggleOpenShowModal()}>
      <DialogContent showCloseButton className='flex flex-col gap-0 p-0 sm:max-w-lg rounded-2xl'>
        <div className='flex items-start justify-between shrink-0 px-5 pt-5 pb-3'>
          <div className='flex items-start gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-sm font-bold text-primary'>
              {initials}
            </div>
            <div className='min-w-0 pt-0.5'>
              <h2 className='text-base font-semibold text-foreground leading-5'>{item.name}</h2>
              <p className='mt-0.5 text-xs text-muted-foreground/55'>{item.email}</p>
            </div>
          </div>
        </div>

        <div className='mx-5 h-px bg-border-subtle/40' />

        {/* Body */}
        <div className='min-h-0 flex-1 overflow-y-auto p-5 space-y-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]'>
              <EnvelopeSimple size={13} className='text-primary/60' />
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Email</p>
              <p className='text-sm font-medium text-foreground/85 truncate'>{item.email}</p>
            </div>
          </div>

          <div className='flex items-center gap-2.5'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]'>
              <Phone size={13} className='text-primary/60' />
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Téléphone</p>
              <p className='text-sm font-medium text-foreground/85 truncate'>{item.phone}</p>
            </div>
          </div>

          <div className='space-y-1.5'>
            <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Message</p>
            <div className='rounded-xl bg-muted/30 p-3.5 text-sm leading-relaxed text-foreground/70 max-h-[300px] overflow-y-auto'>
              <p className='whitespace-pre-wrap'>{item.context}</p>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end shrink-0 border-t border-border-subtle/40 px-5 py-3'>
          <Button variant='ghost' size='sm' onClick={toggleOpenShowModal} type='button' className='text-xs font-medium text-muted-foreground/45 hover:text-foreground'>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
