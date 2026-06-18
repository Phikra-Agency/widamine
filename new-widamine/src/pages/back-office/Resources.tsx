import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen, Star, Link } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { DataTable, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormDialog from '@/components/bo/FormDialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createResourcesColumns, RESOURCES_EMPTY_ICON } from './columns/resourcesColumns'
import { PRIORITY_CONFIG } from './columns/shared/priorityBadge'

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
      <div className='bo-page-inner'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-logo-sky/6 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack h-full min-h-0 overflow-y-auto'>
          <Heading />
          <Card className='bo-table-card'>
            <ResourcesTable />
          </Card>
        </div>
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
        <h3 className='bo-title'>Gestion Des Salles</h3>
      </div>
      <Button onClick={openCreateModal}>
        <Plus weight='bold' /> Ajouter Une Salle
      </Button>
    </div>
  )
}

function ResourcesTable() {
  const { items, fetchItems, openEditModal, openDeleteModal } = useResourcesStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () =>
      createResourcesColumns({
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
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
        emptyIcon={RESOURCES_EMPTY_ICON}
        emptyTitle='Aucune salle trouvée'
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty icon={RESOURCES_EMPTY_ICON} title='Aucune salle trouvée' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const prioConf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG[1]
              return (
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted'>
                      <FolderOpen size={18} className='text-muted-foreground' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{item.name}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${prioConf.color}`}>
                        <Star size={9} weight={item.priority >= 3 ? 'fill' : 'regular'} />
                        {prioConf.label}
                      </span>
                    </div>
                  </div>
                  {(item.motifs || []).length > 0 && (
                    <p className='mt-2 text-[11px] text-muted-foreground'>
                      {(item.motifs || []).length} motif{(item.motifs || []).length > 1 ? 's' : ''} associé{(item.motifs || []).length > 1 ? 's' : ''}
                    </p>
                  )}
                  <div className='mt-3 flex items-center gap-2'>
                    <Button variant='outline' size='sm' className='flex-1' onClick={() => openEditModal(item)}>
                      <Pen size={14} /> Modifier
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 text-destructive hover:bg-destructive/10'
                      onClick={() => openDeleteModal(item)}
                    >
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
      </DataTable.Mobile>
    </DataTable.Root>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const { items: motifs, fetchItems: fetchMotifs } = useMotifsStore()
  const isEdit = operation === 'edit'
  const open = ['create', 'edit'].includes(operation) && modalOpen

  useEffect(() => { if (open) fetchMotifs() }, [open, fetchMotifs])

  function toggleMotif(motifId: string) {
    const cur = item.motifIds || []
    const next = cur.includes(motifId)
      ? cur.filter((id: string) => id !== motifId)
      : [...cur, motifId]
    setItem({ ...item, motifIds: next })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => { if (!nextOpen) closeModal() }}
      title={`${isEdit ? 'Modifier' : 'Nouvelle'} salle`}
      onSubmit={(e) => { e.preventDefault(); saveItem() }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer la salle'}
      className='sm:max-w-lg'
    >
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom de la salle</Label>
        <Input
          type='text'
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder='Salle A'
        />
      </div>
      <div className='space-y-2'>
        <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Priorité</Label>
        <div className='grid grid-cols-4 gap-2'>
          {[1, 2, 3, 4].map((p) => {
            const conf = PRIORITY_CONFIG[p]
            return (
              <Button
                key={p}
                type='button'
                variant={item.priority === p ? 'default' : 'outline'}
                onClick={() => setItem({ ...item, priority: p })}
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
        <div className='flex min-h-[60px] flex-wrap gap-2 rounded-lg border border-border bg-background p-3'>
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
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50'>
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
