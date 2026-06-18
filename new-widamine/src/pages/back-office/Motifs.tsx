import { useMotifsStore } from '@/stores/motifsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2 } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import FormDialog from '@/components/bo/FormDialog'
import { DataTable, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { createMotifsColumns, MOTIFS_EMPTY_ICON } from './columns/motifsColumns'

export default function Motifs() {
  const { closeModal: closeMotModal, setOperation: setMotOperation } = useMotifsStore()

  useEffect(() => {
    return () => {
      closeMotModal()
      setMotOperation('create')
    }
  }, [closeMotModal, setMotOperation])

  return (
    <div className='bo-page'>
      <div className='bo-page-inner'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-logo-sky/6 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack h-full min-h-0 overflow-y-auto'>
          <Heading />
          <Card className='bo-table-card'>
            <MotifsTable />
          </Card>
        </div>
      </div>
      <Modal />
      <DeleteModal />
    </div>
  )
}

function Heading() {
  const { openModal, setOperation, clearItem } = useMotifsStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Motifs</h3>
      </div>
      <Button onClick={() => { clearItem(); setOperation('create'); openModal() }}>
        <Plus weight='bold' /> Ajouter Un Motif
      </Button>
    </div>
  )
}

function MotifsTable() {
  const { items, fetchItems, setOperation, openModal, setItem } = useMotifsStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () =>
      createMotifsColumns({
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

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIcon={MOTIFS_EMPTY_ICON}
        emptyTitle='Aucun motif trouvé'
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty icon={MOTIFS_EMPTY_ICON} title='Aucun motif trouvé' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              return (
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center justify-between gap-3 min-w-0'>
                    <p className='truncate text-sm font-semibold'>{item.name}</p>
                    <span className='shrink-0 text-xs text-muted-foreground'>{item.duration || 30} min</span>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => { setItem(item); setOperation('edit'); openModal() }}
                    >
                      <Pen size={14} /> Modifier
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 text-destructive hover:bg-destructive/10'
                      onClick={() => { setItem(item); setOperation('delete'); openModal() }}
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
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useMotifsStore()
  const isEdit = operation === 'edit'
  const open = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => { if (!nextOpen) closeModal() }}
      title={`${isEdit ? 'Modifier' : 'Nouveau'} motif`}
      onSubmit={(e) => { e.preventDefault(); saveItem() }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer le motif'}
    >
      <div className='space-y-2'>
        <Label>Nom du motif</Label>
        <Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder='Consultation' />
      </div>
      <div className='space-y-2'>
        <Label>Durée (minutes)</Label>
        <Input
          type='number'
          value={item.duration ?? 30}
          onChange={(e) => setItem({ ...item, duration: Number(e.target.value) })}
        />
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useMotifsStore()
  const open = operation === 'delete' && modalOpen

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeModal() }}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50'>
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
