import { useContactsStore } from '@/stores/contactsStore'
import { EnvelopeSimple, Phone, User, CheckCircle, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, DataTableFilterPills, DataTablePagination, globalSearchFilter, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent } from '@/components/ui'
import { CONTACTS_EMPTY_ILLUSTRATION, createContactsColumns } from './columns/contactsColumns'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const READ_FILTER_PILLS: FilterPillOption[] = [
  { value: '0', label: 'Non lus', color: 'coral' },
  { value: '1', label: 'Lus', color: 'sage' },
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
  const { items, filters, fetchItems, setItem, readItem, setFilters } = useContactsStore()
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedGlobalSearch()

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
      }),
    [filters.read, readItem, setItem],
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
        <DataTableFilterPills
          options={READ_FILTER_PILLS}
          value={filters.read ? '1' : '0'}
          onChange={(value) => setFilters({ read: value === '1' })}
        />
      </DataTable.Toolbar>

      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={CONTACTS_EMPTY_ILLUSTRATION}
        emptyTitle="Aucun message trouvé"
        emptyDescription="Les messages reçus apparaîtront ici"
        stopClickOnColumns={[]}
        onRowClick={(contact) => {
          useContactsStore.setState({ item: contact, openShowModal: true })
        }}
      />

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
                <DataTable.MobileCard key={row.id} onClick={() => useContactsStore.setState({ item: contact, openShowModal: true })}>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary/8'>
                      <User size={20} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{contact.name}</p>
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
                        className='flex-1 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        onClick={(e) => {
                          e.stopPropagation()
                          setItem(contact)
                          void readItem()
                        }}
                      >
                        <CheckCircle size={14} /> Marquer comme lu
                      </Button>
                    )}
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
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
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-lg rounded-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between px-5 pt-5 pb-3'>
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
        <div className='max-h-[calc(100vh-12rem)] overflow-y-auto p-5 space-y-4'>
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

        <div className='flex items-center justify-end border-t border-border-subtle/40 px-5 py-3'>
          <Button variant='ghost' size='sm' onClick={toggleOpenShowModal} type='button' className='text-xs font-medium text-muted-foreground/45 hover:text-foreground'>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
