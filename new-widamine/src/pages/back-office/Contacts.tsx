import { useContactsStore } from '@/stores/contactsStore'
import { Eye, ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { DataTable, globalSearchFilter, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { CONTACTS_EMPTY_ICON, createContactsColumns } from './columns/contactsColumns'

export default function Contacts() {
  return (
    <div className='bo-page'>
      <div className="bo-page-inner bo-section-stack">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none" />

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
      <h3 className="bo-title">Gestion Des Contacts</h3>
    </div>
  )
}

function ContactsTable() {
  const { items, filters, fetchItems, setItem, toggleOpenShowModal, readItem, setFilters } = useContactsStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  useEffect(() => {
    setLoading(true)
    void fetchItems().finally(() => setLoading(false))
  }, [filters.read, fetchItems])

  const columns = useMemo(
    () =>
      createContactsColumns({
        showReadAction: !filters.read,
        onView: (item) => {
          setItem(item)
          toggleOpenShowModal()
        },
        onMarkRead: (item) => {
          setItem(item)
          void readItem()
        },
      }),
    [filters.read, readItem, setItem, toggleOpenShowModal],
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
        <div className="relative min-w-[200px] flex-1">
          <Input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-background"
          />
        </div>
        <Select
          value={filters.read ? '1' : '0'}
          onValueChange={(value) => setFilters({ read: value === '1' })}
        >
          <SelectTrigger className="h-9 w-[150px] bg-background">
            <SelectValue placeholder="Non lus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Non lus</SelectItem>
            <SelectItem value="1">Lus</SelectItem>
          </SelectContent>
        </Select>
      </DataTable.Toolbar>

      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIcon={CONTACTS_EMPTY_ICON}
        emptyTitle="Aucun message trouvé"
        emptyDescription="Les messages reçus apparaîtront ici"
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && (
            <DataTable.Empty
              icon={CONTACTS_EMPTY_ICON}
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
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8'>
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
                    <div className='line-clamp-2 rounded-lg bg-secondary/3 p-2.5 text-xs leading-relaxed text-secondary/50'>
                      {item.context}
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        setItem(item)
                        toggleOpenShowModal()
                      }}
                    >
                      <Eye size={14} /> Voir
                    </Button>
                    {!filters.read && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 text-emerald-600 hover:bg-emerald-50'
                        onClick={() => {
                          setItem(item)
                          void readItem()
                        }}
                      >
                        <CheckCircle size={14} /> Lu
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
  const { openShowModal, toggleOpenShowModal, item } = useContactsStore()

  return (
    <Dialog open={openShowModal} onOpenChange={(open) => !open && toggleOpenShowModal()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold text-secondary">Message reçu</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center">
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
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                <EnvelopeSimple size={16} className="text-secondary/40" />
                {item.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Téléphone</Label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                <Phone size={16} className="text-secondary/40" />
                {item.phone}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Message</Label>
              <div className="rounded-xl border border-border bg-background p-4 text-sm text-secondary min-h-[120px] max-h-[250px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{item.context}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={toggleOpenShowModal} type="button">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
