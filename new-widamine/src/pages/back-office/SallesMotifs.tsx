import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { useUsersStore } from '@/stores/usersStore'
import { getFamilyForMotif, MOTIF_FAMILIES } from '@/lib/motifFamilies'
import { PencilSimple as Pen, Plus, Trash as Trash2, Star, Link as LinkIcon, Door, Stethoscope, UserCircle } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import FormDialog from '@/components/bo/FormDialog'
import { DataTable, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { createSallesColumns, SALLES_EMPTY_ICON } from './columns/sallesColumns'
import { createSallesMotifsColumns, SALLES_MOTIFS_EMPTY_ICON } from './columns/sallesMotifsColumns'
import { SALLES_PRIORITY_CONFIG } from './columns/shared/priorityBadge'

const FAB_CLASSES = 'fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-bo-fab'

type Tab = 'salles' | 'motifs'

export default function SallesMotifs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<Tab>((tabParam === 'motifs' ? 'motifs' : 'salles'))

  const handleSetTab = (next: Tab) => {
    setTab(next)
    setSearchParams(next === 'motifs' ? { tab: 'motifs' } : {}, { replace: true })
  }

  const { openCreateModal: openCreateSalle, closeModal: closeResModal, setOperation: setResOp } = useResourcesStore()
  const { setOperation: setMotifOp, openModal: openMotifModal, clearItem: clearMotifItem, closeModal: closeMotModal } = useMotifsStore()

  useEffect(() => {
    return () => {
      closeResModal()
      setResOp('create')
      closeMotModal()
      setMotifOp('create')
    }
  }, [])

  const handleCreate = () => {
    if (tab === 'salles') {
      openCreateSalle()
    } else {
      clearMotifItem()
      setMotifOp('create')
      openMotifModal()
    }
  }

  return (
    <div className='bo-page'>
      <div className='bo-page-inner'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-logo-sky/6 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />
        <div className='bo-section-stack h-full min-h-0 overflow-y-auto'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='bo-title'>Salles & Motifs</h3>
            </div>
            <div className='flex items-center gap-3'>
              <Tabs value={tab} onValueChange={(value) => handleSetTab(value as Tab)} className='w-full sm:w-auto'>
                <TabsList className='w-full sm:w-auto'>
                  <TabsTrigger value='salles' className='flex-1 sm:flex-initial'>
                    <Door size={14} /> Salles
                  </TabsTrigger>
                  <TabsTrigger value='motifs' className='flex-1 sm:flex-initial'>
                    <Stethoscope size={14} /> Motifs
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleCreate} className='hidden h-10 rounded-xl px-5 lg:inline-flex'>
                <Plus weight='bold' /> Ajouter
              </Button>
            </div>
          </div>

          {tab === 'salles' ? (
            <Card key='salles' className='bo-table-card'>
              <SallesTable />
            </Card>
          ) : (
            <Card key='motifs' className='bo-table-card'>
              <MotifsTable />
            </Card>
          )}
        </div>
      </div>
      <SalleModal /><SalleDeleteModal /><MotifModal /><MotifDeleteModal />
    </div>
  )
}

function SallesTable() {
  const { items, fetchItems, openEditModal, openDeleteModal, openCreateModal } = useResourcesStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () => createSallesColumns({ onEdit: openEditModal, onDelete: openDeleteModal }),
    [openDeleteModal, openEditModal],
  )

  const table = useDataTable({ data: items, columns, enableGlobalFilter: false })
  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIcon={SALLES_EMPTY_ICON}
        emptyTitle='Aucune salle trouvée'
        onRowClick={openEditModal}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty icon={SALLES_EMPTY_ICON} title='Aucune salle trouvée' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const p = SALLES_PRIORITY_CONFIG[item.priority] || SALLES_PRIORITY_CONFIG[1]
              return (
                <DataTable.MobileCard key={row.id} onClick={() => openEditModal(item)}>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/4'>
                      <Door size={16} className='text-secondary/40' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='break-words text-sm font-semibold leading-tight'>{item.name}</p>
                        <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 self-start rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${p.color}`}>
                          <Star size={9} weight={item.priority >= 3 ? 'fill' : 'regular'} />
                          {p.label}
                        </span>
                      </div>
                      {(item.motifs || []).length > 0 && (
                        <p className='mt-0.5 truncate text-[11px] text-secondary/50'>
                          {(item.motifs || []).length} motif{(item.motifs || []).length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className='flex shrink-0 items-center gap-0.5' onClick={(e) => e.stopPropagation()}>
                      <Button type='button' variant='ghost' size='icon-sm' onClick={() => openEditModal(item)} className='text-secondary/30 hover:bg-amber-50 hover:text-amber-600' aria-label='Modifier'>
                        <Pen size={14} />
                      </Button>
                      <Button type='button' variant='ghost' size='icon-sm' onClick={() => openDeleteModal(item)} className='text-secondary/30 hover:bg-red-50 hover:text-red-600' aria-label='Supprimer'>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
        <Button type='button' onClick={openCreateModal} className={FAB_CLASSES} aria-label='Ajouter une salle'>
          <Plus size={24} weight='bold' />
        </Button>
      </DataTable.Mobile>
    </DataTable.Root>
  )
}

function MotifsTable() {
  const { items, fetchItems, setOperation, openModal, setItem, clearItem } = useMotifsStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () =>
      createSallesMotifsColumns({
        onEdit: (item) => {
          setItem(item)
          setOperation('edit')
          openModal()
        },
        onDelete: (item) => {
          setItem(item)
          setOperation('delete')
          openModal()
        },
      }),
    [openModal, setItem, setOperation],
  )

  const table = useDataTable({ data: items, columns, enableGlobalFilter: false })
  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  const openEdit = (item: typeof items[number]) => {
    setItem(item)
    setOperation('edit')
    openModal()
  }

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIcon={SALLES_MOTIFS_EMPTY_ICON}
        emptyTitle='Aucun motif trouvé'
        onRowClick={openEdit}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty icon={SALLES_MOTIFS_EMPTY_ICON} title='Aucun motif trouvé' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              return (
              <DataTable.MobileCard key={row.id} onClick={() => openEdit(item)}>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/4'>
                    <Stethoscope size={16} className='text-secondary/40' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='break-words text-sm font-semibold leading-tight'>{item.name}</p>
                      <span className='mt-0.5 inline-flex shrink-0 items-center self-start rounded-md border border-border-subtle bg-secondary/3 px-1.5 py-0.5 text-[10px] font-medium text-secondary/50'>
                        {item.duration || 30} min
                      </span>
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='h-3.5 w-3.5 rounded-full border border-border-subtle' style={{ backgroundColor: item.color || '#2E90C0' }} />
                      <span className='text-[11px] text-secondary/45'>{item.color || '#2E90C0'}</span>
                    </div>
                  </div>
                  <div className='flex shrink-0 items-center gap-0.5' onClick={(e) => e.stopPropagation()}>
                    <Button type='button' variant='ghost' size='icon-sm' onClick={() => openEdit(item)} className='text-secondary/30 hover:bg-amber-50 hover:text-amber-600' aria-label='Modifier'>
                      <Pen size={14} />
                    </Button>
                    <Button type='button' variant='ghost' size='icon-sm' onClick={() => { setItem(item); setOperation('delete'); openModal() }} className='text-secondary/30 hover:bg-red-50 hover:text-red-600' aria-label='Supprimer'>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
        <Button type='button' onClick={() => { clearItem(); setOperation('create'); openModal() }} className={FAB_CLASSES} aria-label='Ajouter un motif'>
          <Plus size={24} weight='bold' />
        </Button>
      </DataTable.Mobile>
    </DataTable.Root>
  )
}

function SalleModal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const { items: motifs, fetchItems: fetchMotifs } = useMotifsStore()
  const isEdit = operation === 'edit'
  const visible = ['create', 'edit'].includes(operation) && modalOpen
  useEffect(() => { if (visible) fetchMotifs() }, [visible])
  function toggleMotif(motifId: string) {
    const cur = item.motifIds || []
    setItem({ ...item, motifIds: cur.includes(motifId) ? cur.filter((id: string) => id !== motifId) : [...cur, motifId] })
  }
  return (
    <FormDialog
      open={visible}
      onOpenChange={(open) => !open && closeModal()}
      title={`${isEdit ? 'Modifier' : 'Nouvelle'} salle`}
      onSubmit={(e) => { e.preventDefault(); saveItem() }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer'}
      onCancel={closeModal}
      className='sm:max-w-lg'
    >
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nom</Label>
        <Input type='text' value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder='Salle A' />
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Priorité</Label>
        <div className='grid grid-cols-4 gap-2'>
          {[1, 2, 3, 4].map((p) => (
            <Button
              key={p}
              type='button'
              variant='outline'
              onClick={() => setItem({ ...item, priority: p })}
              className={clsx(
                'flex h-auto flex-col items-center gap-1 p-2.5',
                item.priority === p ? 'border-primary bg-primary/5 text-primary' : 'text-secondary/50'
              )}
            >
              <Star size={16} weight={p >= 3 ? 'fill' : 'regular'} />
              <span className='text-[10px] font-bold'>{SALLES_PRIORITY_CONFIG[p].label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Motifs associés</Label>
        <div className='flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-background min-h-[60px]'>
          {motifs.length === 0 ? (
            <span className='text-xs text-secondary/30'>Aucun motif disponible</span>
          ) : (
            motifs.map((m) => {
              const sel = (item.motifIds || []).includes(m.id!)
              return (
                <Button
                  key={m.id}
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => toggleMotif(m.id!)}
                  className={clsx(
                    'text-xs font-bold',
                    sel ? 'border-primary bg-primary/10 text-primary' : 'text-secondary/50'
                  )}
                >
                  <LinkIcon size={10} />{m.name}
                </Button>
              )
            })
          )}
        </div>
      </div>
    </FormDialog>
  )
}

function SalleDeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useResourcesStore()
  const visible = operation === 'delete' && modalOpen
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette salle ?</h2>
        </div>
        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button variant='ghost' onClick={closeModal}>Annuler</Button>
          <Button variant='destructive' onClick={deleteItem}>Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MotifModal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useMotifsStore()
  const { items: users, fetchItems: fetchUsers } = useUsersStore()

  const isEdit = operation === 'edit'
  const visible = ['create', 'edit'].includes(operation) && modalOpen

  useEffect(() => {
    if (visible) fetchUsers()
  }, [visible])

  const doctors = users.filter(u => u.role === 'DOCTOR' || u.role === 'PRACTITIONER')

  const toggleDoctor = (docId: string) => {
    const cur = item.practitionerIds || []
    const next = cur.includes(docId)
      ? cur.filter(id => id !== docId)
      : [...cur, docId]
    setItem({ ...item, practitionerIds: next })
  }

  const randomizeColor = () => {
    setItem({ ...item, color: getRandomMotifColor() })
  }

  return (
    <FormDialog
      open={visible}
      onOpenChange={(open) => !open && closeModal()}
      title={`${isEdit ? 'Modifier' : 'Nouveau'} motif`}
      onSubmit={(e) => { e.preventDefault(); saveItem() }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer'}
      onCancel={closeModal}
      className='sm:max-w-lg'
    >
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nom du motif</Label>
        <Input
          type='text'
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder='Nom du motif'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Durée (minutes)</Label>
        <Input
          type='number'
          min={5}
          step={5}
          value={item.duration ?? 30}
          onChange={(e) =>
            setItem({
              ...item,
              duration: Math.max(5, Number.parseInt(e.target.value || '30', 10) || 30),
            })
          }
          placeholder='30'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Type / Famille</Label>
        <Select
          value={item.bookingType || 'CONSULTATION'}
          onValueChange={(value) => setItem({ ...item, bookingType: value ?? 'CONSULTATION' })}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOTIF_FAMILIES.flatMap((f) =>
              f.bookingTypes.map((bt) => (
                <SelectItem key={bt} value={bt}>
                  {f.label} ({bt})
                </SelectItem>
              )),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Couleur du motif</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={randomizeColor}
            className='text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary/55'
          >
            Aléatoire
          </Button>
        </div>
        <div className='flex items-center gap-3 rounded-xl border border-border bg-secondary/[0.01] p-3'>
          <input
            type='color'
            value={normalizeMotifColor(item.color) || '#2E90C0'}
            onChange={(e) => setItem({ ...item, color: e.target.value.toUpperCase() })}
            className='h-11 w-11 cursor-pointer rounded-lg border border-border bg-transparent p-1'
          />
          <div className='min-w-0 flex-1 space-y-2'>
            <Input
              type='text'
              value={item.color || ''}
              onChange={(e) => setItem({ ...item, color: e.target.value.toUpperCase() })}
              placeholder='#2E90C0'
            />
            <div className='flex items-center gap-2'>
              <span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: normalizeMotifColor(item.color) || '#2E90C0' }} />
            </div>
          </div>
        </div>
        {(() => {
          const family = getFamilyForMotif(item)
          const color = normalizeMotifColor(item.color) || family.hue
          return (
            <div
              className='rounded-xl border px-3 py-2.5'
              style={{ borderColor: `${family.hue}30`, backgroundColor: `${family.hue}10` }}
            >
              <div className='mt-2 flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full' style={{ backgroundColor: family.hue }} />
                <span className='text-xs font-medium text-secondary'>{family.label}</span>
                <span className='text-[10px] text-secondary/40'>·</span>
                <span
                  className='rounded-md px-2 py-0.5 text-[10px] font-semibold text-white'
                  style={{ backgroundColor: color }}
                >
                  {item.name || 'Motif'}
                </span>
              </div>
            </div>
          )
        })()}
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Praticiens assignés</Label>
        <div className='flex flex-wrap gap-2 p-3 rounded-xl border border-border bg-secondary/[0.01] min-h-[60px]'>
          {doctors.length === 0 ? (
            <span className='text-xs text-secondary/30'>Aucun praticien trouvé</span>
          ) : (
            doctors.map((doc) => {
              const isSelected = (item.practitionerIds || []).includes(doc.id.toString())
              return (
                <Button
                  key={doc.id}
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => toggleDoctor(doc.id.toString())}
                  className={clsx(
                    'text-xs font-bold',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'text-secondary/50'
                  )}
                >
                  <UserCircle size={14} weight={isSelected ? 'fill' : 'regular'} />
                  {doc.name}
                </Button>
              )
            })
          )}
        </div>
      </div>
    </FormDialog>
  )
}

function normalizeMotifColor(value?: string) {
  if (!value) return null
  const trimmed = value.trim()
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return /^#[0-9A-Fa-f]{6}$/.test(prefixed) ? prefixed.toUpperCase() : null
}

function getRandomMotifColor() {
  const palette = ['#2E90C0', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#EC4899', '#0EA5E9']
  return palette[Math.floor(Math.random() * palette.length)]
}

function MotifDeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useMotifsStore()
  const visible = operation === 'delete' && modalOpen
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer ce motif ?</h2>
        </div>
        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button variant='ghost' onClick={closeModal}>Annuler</Button>
          <Button variant='destructive' onClick={deleteItem}>Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
