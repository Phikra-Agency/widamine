import { useMotifsStore } from '@/stores/motifsStore'
import { useUsersStore } from '@/stores/usersStore'
import { Plus, Trash as Trash2 } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { FormDialog, FieldError } from '@/components/bo'
import { motifSchema } from '@/lib/formSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import { DataTable, DataTablePagination, globalSearchFilter, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { createSallesMotifsColumns, SALLES_MOTIFS_EMPTY_ILLUSTRATION } from './columns/sallesMotifsColumns'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const FAB_CLASSES = 'fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-bo-fab'

export default function Motifs() {
  const { closeModal: closeMotModal, setOperation: setMotifOp } = useMotifsStore()

  useEffect(() => {
    return () => {
      closeMotModal()
      setMotifOp('create')
    }
  }, [closeMotModal, setMotifOp])

  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <MotifsTable />
        </Card>
      </div>
      <MotifModal />
      <MotifDeleteModal />
    </div>
  )
}

function Heading() {
  const { openModal, setOperation, clearItem } = useMotifsStore()
  return (
    <div className='bo-page-heading'>
      <h3 className='bo-title'>Motifs</h3>
      <Button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='hidden h-10 px-5 lg:inline-flex'
      >
        <Plus weight='bold' /> Ajouter un motif
      </Button>
    </div>
  )
}

function MotifsTable() {
  const { items, fetchItems, setOperation, openModal, setItem, clearItem } = useMotifsStore()
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedGlobalSearch()

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(() => createSallesMotifsColumns(), [])

  const table = useDataTable({
    data: items,
    columns,
    enablePagination: true,
    pageSize: 10,
    globalFilter: debouncedSearch,
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name']),
  })
  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  const openEdit = (item: (typeof items)[number]) => {
    setItem(item)
    setOperation('edit')
    openModal()
  }

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={SALLES_MOTIFS_EMPTY_ILLUSTRATION}
        emptyTitle='Aucun motif trouvé'
        stopClickOnColumns={[]}
        onRowClick={openEdit}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty illustration={SALLES_MOTIFS_EMPTY_ILLUSTRATION} title='Aucun motif trouvé' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              return (
                <DataTable.MobileCard key={row.id} onClick={() => openEdit(item)}>
                  <div className='flex items-center gap-3'>
                    <span
                      className='h-3 w-3 shrink-0 rounded-full'
                      style={{ backgroundColor: item.color || '#2E90C0' }}
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='break-words text-sm font-semibold leading-tight'>{item.name}</p>
                        <span className='inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                          {item.duration || 30} min
                        </span>
                      </div>
                    </div>
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
        <Button
          type='button'
          onClick={() => {
            clearItem()
            setOperation('create')
            openModal()
          }}
          className={FAB_CLASSES}
          aria-label='Ajouter un motif'
        >
          <Plus size={24} weight='bold' />
        </Button>
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
  )
}

function MotifModal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useMotifsStore()
  const { items: users, fetchItems: fetchUsers } = useUsersStore()

  const isEdit = operation === 'edit'
  const visible = ['create', 'edit'].includes(operation) && modalOpen
  const validation = useFormValidation(motifSchema, item)

  useEffect(() => {
    if (visible) fetchUsers()
  }, [visible, fetchUsers])

  useEffect(() => {
    if (!visible) validation.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const doctors = users.filter((u) => u.role === 'DOCTOR' || u.role === 'PRACTITIONER')

  const toggleDoctor = (docId: string) => {
    const cur = item.practitionerIds || []
    const next = cur.includes(docId) ? cur.filter((id) => id !== docId) : [...cur, docId]
    const nextItem = { ...item, practitionerIds: next }
    setItem(nextItem)
    validation.onFieldChange('practitionerIds', nextItem)
  }

  return (
    <FormDialog
      open={visible}
      onOpenChange={(open) => !open && closeModal()}
      title={`${isEdit ? 'Modifier' : 'Nouveau'} motif`}
      onSubmit={(e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer'}
      onCancel={closeModal}
      className='sm:max-w-lg'
    >
      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nom du motif</Label>
        <Input
          type='text'
          value={item.name}
          onChange={(e) => {
            const next = { ...item, name: e.target.value }
            setItem(next)
            validation.onFieldChange('name', next)
          }}
          onBlur={() => validation.onFieldBlur('name')}
          placeholder='Nom du motif'
          aria-invalid={!!validation.getError('name')}
        />
        <FieldError message={validation.getError('name')} />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Durée (minutes)</Label>
        <Input
          type='number'
          min={5}
          step={5}
          value={item.duration ?? 30}
          onChange={(e) => {
            const next = {
              ...item,
              duration: Math.max(5, Number.parseInt(e.target.value || '30', 10) || 30),
            }
            setItem(next)
            validation.onFieldChange('duration', next)
          }}
          onBlur={() => validation.onFieldBlur('duration')}
          placeholder='30'
          aria-invalid={!!validation.getError('duration')}
        />
        <FieldError message={validation.getError('duration')} />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nombre de séances</Label>
        <Input
          type='number'
          min={1}
          value={item.numberOfSessions ?? 1}
          onChange={(e) => {
            const next = { ...item, numberOfSessions: Math.max(1, Number.parseInt(e.target.value || '1', 10) || 1) }
            setItem(next)
            validation.onFieldChange('numberOfSessions', next)
          }}
          placeholder='1'
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Réservation en ligne</Label>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => {
              const next = { ...item, isOnlineBookable: !item.isOnlineBookable }
              setItem(next)
              validation.onFieldChange('isOnlineBookable', next)
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${item.isOnlineBookable ? 'bg-primary' : 'bg-secondary/20'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${item.isOnlineBookable ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className='text-xs text-secondary/60'>{item.isOnlineBookable ? 'Activé' : 'Désactivé'}</span>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Choix du praticien</Label>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => {
              const next = { ...item, requiresPractitionerChoice: !item.requiresPractitionerChoice }
              setItem(next)
              validation.onFieldChange('requiresPractitionerChoice', next)
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${item.requiresPractitionerChoice ? 'bg-primary' : 'bg-secondary/20'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${item.requiresPractitionerChoice ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className='text-xs text-secondary/60'>{item.requiresPractitionerChoice ? 'Activé' : 'Désactivé'}</span>
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Durée expiration (heures)</Label>
        <Input
          type='number'
          min={1}
          value={item.pendingTtlHours ?? 24}
          onChange={(e) => {
            const next = { ...item, pendingTtlHours: Math.max(1, Number.parseInt(e.target.value || '24', 10) || 24) }
            setItem(next)
            validation.onFieldChange('pendingTtlHours', next)
          }}
          placeholder='24'
        />
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Couleur du motif</Label>
          <Button type='button' variant='outline' size='sm' onClick={() => setItem({ ...item, color: getRandomMotifColor() })} className='text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary/55'>
            Aléatoire
          </Button>
        </div>
        <div className='flex items-center gap-3 rounded-control border border-border bg-secondary/[0.01] p-3'>
          <input
            type='color'
            value={normalizeMotifColor(item.color) || '#2E90C0'}
            onChange={(e) => setItem({ ...item, color: e.target.value.toUpperCase() })}
            className='h-11 w-11 cursor-pointer rounded-control border border-border bg-transparent p-1'
          />
          <div className='min-w-0 flex-1 space-y-2'>
            <Input type='text' value={item.color || ''} onChange={(e) => setItem({ ...item, color: e.target.value.toUpperCase() })} placeholder='#2E90C0' />
            <div className='flex items-center gap-2'>
              <span className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: normalizeMotifColor(item.color) || '#2E90C0' }} />
            </div>
          </div>
        </div>
        {(() => {
          const color = normalizeMotifColor(item.color) || '#3b82f6'
          return (
            <div className='rounded-control border px-3 py-2.5' style={{ borderColor: `${color}30`, backgroundColor: `${color}10` }}>
              <div className='mt-2 flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full' style={{ backgroundColor: color }} />
                <span className='rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white' style={{ backgroundColor: color }}>
                  {item.name || 'Motif'}
                </span>
              </div>
            </div>
          )
        })()}
      </div>

      <div className='space-y-2'>
        <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Praticiens assignés</Label>
        <div className='flex min-h-[60px] flex-wrap gap-2 rounded-control border border-border bg-secondary/[0.01] p-3'>
          {doctors.length === 0 ? (
            <span className='text-xs text-secondary/30'>Aucun praticien trouvé</span>
          ) : (
            doctors.map((doc) => {
              const isSelected = (item.practitionerIds || []).includes(doc.id.toString())
              return (
                <button
                  key={doc.id}
                  type='button'
                  onClick={() => toggleDoctor(doc.id.toString())}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border-strong',
                  )}
                >
                  {doc.name}
                </button>
              )
            })
          )}
        </div>
      </div>
    </FormDialog>
  )
}

function MotifDeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useMotifsStore()
  const visible = operation === 'delete' && modalOpen
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-control bg-red-50'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer ce motif ?</h2>
        </div>
        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button variant='ghost' onClick={closeModal}>
            Annuler
          </Button>
          <Button variant='destructive' onClick={deleteItem}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
