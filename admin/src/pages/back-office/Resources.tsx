import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, Door, Star, Link } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { DataTable, globalSearchFilter, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog, FieldError } from '@/components/bo'
import { resourceSchema } from '@/lib/formSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createSallesColumns, SALLES_EMPTY_ILLUSTRATION } from './columns/sallesColumns'
import { SALLES_PRIORITY_CONFIG } from './columns/shared/priorityBadge'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const FAB_CLASSES = 'fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-bo-fab'

export default function Resources() {
  const { closeModal: closeResModal, setOperation: setResOp } = useResourcesStore()

  useEffect(() => {
    return () => {
      closeResModal()
      setResOp('create')
    }
  }, [closeResModal, setResOp])

  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <ResourcesTable />
        </Card>
      </div>
      <Modal />
      <DeleteModal />
    </div>
  )
}

function Heading() {
  const { openCreateModal } = useResourcesStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Salles</h3>
      </div>
      <Button onClick={openCreateModal}>
        <Plus weight='bold' /> Ajouter Une Salle
      </Button>
    </div>
  )
}

function ResourcesTable() {
  const { items, fetchItems, openEditModal, openDeleteModal, openCreateModal } = useResourcesStore()
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedGlobalSearch()

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () =>
      createSallesColumns({
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    [openDeleteModal, openEditModal],
  )

  const table = useDataTable({
    data: items,
    columns,
    globalFilter: debouncedSearch,
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name']),
  })
  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={SALLES_EMPTY_ILLUSTRATION}
        emptyTitle='Aucune salle trouvée'
        onRowClick={openEditModal}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty illustration={SALLES_EMPTY_ILLUSTRATION} title='Aucune salle trouvée' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const p = SALLES_PRIORITY_CONFIG[item.priority] || SALLES_PRIORITY_CONFIG[1]
              return (
                <DataTable.MobileCard key={row.id} onClick={() => openEditModal(item)}>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary/4'>
                      <Door size={16} className='text-secondary/40' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='break-words text-sm font-semibold leading-tight'>{item.name}</p>
                        <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 self-start rounded-element border px-1.5 py-0.5 text-[10px] font-medium ${p.color}`}>
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

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const { items: motifs, fetchItems: fetchMotifs } = useMotifsStore()
  const isEdit = operation === 'edit'
  const open = ['create', 'edit'].includes(operation) && modalOpen
  const validation = useFormValidation(resourceSchema, item)

  useEffect(() => { if (open) fetchMotifs() }, [open, fetchMotifs])
  useEffect(() => { if (!open) validation.reset() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [open])

  function toggleMotif(motifId: string) {
    const cur = item.motifIds || []
    const next = cur.includes(motifId)
      ? cur.filter((id: string) => id !== motifId)
      : [...cur, motifId]
    const nextItem = { ...item, motifIds: next }
    setItem(nextItem)
    validation.onFieldChange('motifIds', nextItem)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => { if (!nextOpen) closeModal() }}
      title={`${isEdit ? 'Modifier' : 'Nouvelle'} salle`}
      onSubmit={(e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer la salle'}
      className='sm:max-w-lg'
    >
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom de la salle</Label>
        <Input
          type='text'
          value={item.name}
          onChange={(e) => {
            const next = { ...item, name: e.target.value }
            setItem(next)
            validation.onFieldChange('name', next)
          }}
          onBlur={() => validation.onFieldBlur('name')}
          placeholder='Salle A'
          aria-invalid={!!validation.getError('name')}
        />
        <FieldError message={validation.getError('name')} />
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Priorité</Label>
        <div className='grid grid-cols-4 gap-2'>
          {[1, 2, 3, 4].map((p) => {
            const conf = SALLES_PRIORITY_CONFIG[p]
            return (
              <Button
                key={p}
                type='button'
                variant={item.priority === p ? 'default' : 'outline'}
                onClick={() => {
                  const next = { ...item, priority: p }
                  setItem(next)
                  validation.onFieldChange('priority', next)
                }}
                className={clsx(
                  'flex h-auto flex-col gap-1 p-2.5',
                  item.priority !== p && 'text-secondary/50',
                )}
              >
                <Star size={16} weight={p >= 3 ? 'fill' : 'regular'} />
                <span className='text-[10px] font-medium'>{conf.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motifs associés</Label>
        <div className='flex min-h-[60px] flex-wrap gap-2 rounded-control border border-border bg-background p-3'>
          {motifs.length === 0 ? (
            <span className='text-xs text-secondary/40'>Aucun motif disponible</span>
          ) : (
            motifs.map((motif) => {
              const selected = (item.motifIds || []).includes(motif.id!)
              return (
                <Button
                  key={motif.id}
                  type='button'
                  size='sm'
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleMotif(motif.id!)}
                  className={clsx(!selected && 'text-secondary/50')}
                >
                  <Link size={10} />
                  {motif.name}
                </Button>
              )
            })
          )}
        </div>
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useResourcesStore()
  const open = operation === 'delete' && modalOpen

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeModal() }}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-control bg-red-50'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-lg font-semibold text-secondary'>Supprimer cette salle ?</DialogTitle>
          </DialogHeader>
        </div>
        <DialogFooter className='border-t border-border px-6 py-4'>
          <Button type='button' variant='ghost' onClick={closeModal}>Annuler</Button>
          <Button type='button' variant='destructive' onClick={deleteItem}>Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
