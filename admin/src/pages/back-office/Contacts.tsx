import { useContactsStore } from '@/stores/contactsStore'
import { ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { DataTable, DataTableFilterPills, globalSearchFilter, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@/components/ui'
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
              const item = row.original
              return (
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary/8'>
                      <User size={20} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{item.name}</p>
                    </div>
                  </div>
                  <div className='mt-3 space-y-2 text-xs text-secondary/60'>
                    <div className='flex items-center gap-2'>
                      <EnvelopeSimple size={14} className='shrink-0 text-secondary/30' />
                      <span className='truncate'>{item.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone size={14} className='shrink-0 text-secondary/30' />
                      <span>{item.phone}</span>
                    </div>
                    <div className='line-clamp-2 rounded-control bg-secondary/3 p-2.5 text-xs leading-relaxed text-secondary/50'>
                      {item.context}
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    {!filters.read && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        onClick={() => {
                          setItem(item)
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
    </DataTable.Root>
  )
}

function ShowModal() {
  const openShowModal = useContactsStore((s) => s.openShowModal)
  const toggleOpenShowModal = useContactsStore((s) => s.toggleOpenShowModal)
  const item = useContactsStore((s) => s.item)

  if (!openShowModal || !item?.name) return null

  return (
    <Dialog open onOpenChange={(open) => !open && toggleOpenShowModal()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold text-secondary">Message reçu</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-control bg-primary/[0.08] flex items-center justify-center">
              <ChatCircleDots size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">{item.name}</h3>
              <p className="text-sm text-secondary/40">{item.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Email</Label>
              <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                <EnvelopeSimple size={16} className="text-secondary/40" />
                {item.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Téléphone</Label>
              <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                <Phone size={16} className="text-secondary/40" />
                {item.phone}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Message</Label>
              <div className="rounded-control border border-border bg-background p-4 text-sm text-secondary min-h-[120px] max-h-[250px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{item.context}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
          <Button variant="ghost" onClick={toggleOpenShowModal} type="button">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
