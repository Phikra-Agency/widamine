import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { Plus, Trash as Trash2, Door, Link, MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { DataTable, DataTableFilterPills, DataTablePagination, globalSearchFilter, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
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
import { PRIORITY_CONFIG } from './columns/shared/priorityBadge'
import { useDebounce } from 'use-debounce'

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
    <div className='bo-page-heading'>
      <div>
        <h3 className='bo-title'>Gestion de salles</h3>
      </div>
      <Button onClick={openCreateModal} className='hidden h-10 px-5 lg:inline-flex'>
        <Plus weight='bold' /> Ajouter Une Salle
      </Button>
    </div>
  )
}

function ResourcesTable() {
  const { items, fetchItems, openEditModal, openDeleteModal, openCreateModal } = useResourcesStore()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 300)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () => createSallesColumns({ onEdit: openEditModal, onDelete: openDeleteModal }),
    [openEditModal, openDeleteModal],
  )

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

  return (
    <DataTable.Root>
      <DataTable.Toolbar>
        {/* Mobile search */}
        <div className='flex lg:hidden items-center gap-2 w-full'>
          <div className='relative flex-1 min-w-0'>
            <MagnifyingGlass size={16} weight='bold' className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Rechercher une salle...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-8 pl-8 text-[13px] bg-background border-border focus-visible:ring-0! focus-visible:border-border-strong!'
            />
          </div>
        </div>

        {/* Desktop search */}
        <div className='hidden lg:flex items-center gap-2 ml-auto'>
          <div className='relative w-64'>
            <MagnifyingGlass size={16} weight='bold' className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              placeholder='Rechercher une salle...'
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
          emptyIllustration={SALLES_EMPTY_ILLUSTRATION}
          emptyTitle='Aucune salle trouvée'
          stopClickOnColumns={["actions"]}
          onRowClick={openEditModal}
        />
      </DataTable.Desktop>

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty illustration={SALLES_EMPTY_ILLUSTRATION} title='Aucune salle trouvée' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const p = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG[1]
              return (
                <DataTable.MobileCard key={row.id} onClick={() => openEditModal(item)}>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                      <Door size={16} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='break-words text-sm font-semibold leading-tight'>{item.name}</p>
                      {(item.motifs || []).length > 0 && (
                        <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                          {(item.motifs || []).length} motif{(item.motifs || []).length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${p.bg} ${p.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteModal(item)
                      }}
                      className='flex shrink-0 h-9 w-9 items-center justify-center rounded-control border border-border bg-secondary/[0.04] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors'
                      aria-label='Supprimer la salle'
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
        <Button type='button' onClick={openCreateModal} className={FAB_CLASSES} aria-label='Ajouter une salle'>
          <Plus size={24} weight='bold' />
        </Button>
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3 max-lg:justify-start'>
        <DataTablePagination table={table} />
      </div>
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
          value={item.name ?? ''}
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
            const conf = PRIORITY_CONFIG[p]
            return (
              <button
                key={p}
                type='button'
                onClick={() => {
                  const next = { ...item, priority: p }
                  setItem(next)
                  validation.onFieldChange('priority', next)
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-control border px-3 py-2.5 text-center transition-all',
                  item.priority === p
                    ? cn(conf.bg, conf.text, 'border-current ring-1 ring-current/20')
                    : 'border-border bg-background text-muted-foreground hover:border-border-strong',
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', item.priority === p ? conf.dot : 'bg-muted-foreground/30')} />
                <span className='text-[10px] font-medium'>{conf.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Traitements associés</Label>
        <div className='flex min-h-[60px] flex-wrap gap-2 rounded-control border border-border bg-background p-3'>
          {motifs.length === 0 ? (
            <span className='text-xs text-secondary/40'>Aucun traitement disponible</span>
          ) : (
            motifs.map((motif) => {
              const selected = (item.motifIds || []).includes(motif.id!)
              return (
                <button
                  key={motif.id}
                  type='button'
                  onClick={() => toggleMotif(motif.id!)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-xs font-medium transition-all',
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border-strong',
                  )}
                >
                  <Link size={10} />
                  {motif.name}
                </button>
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
      <DialogContent showCloseButton className='gap-0 overflow-hidden p-0 sm:max-w-md'>
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
