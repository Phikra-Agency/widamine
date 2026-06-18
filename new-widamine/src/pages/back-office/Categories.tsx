import { useCategoriesStore } from '@/stores/categoriesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import FormDialog from '@/components/bo/FormDialog'
import { DataTable, TanStackDataTable, useDataTable } from '@/components/data-table'
import { Button, Card, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { CATEGORIES_EMPTY_ICON, createCategoriesColumns } from './columns/categoriesColumns'

export default function Categories() {
  const { closeModal: closeCatModal, setOperation: setCatOperation } = useCategoriesStore()

  useEffect(() => {
    return () => {
      closeCatModal()
      setCatOperation('create')
    }
  }, [closeCatModal, setCatOperation])

  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='absolute -top-20 -right-20 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none' />

        <Heading />
        <Card className='bo-table-card'>
          <CategoriesTable />
        </Card>
      </div>
      <Modal />
      <DeleteModal />
    </div>
  )
}

function Heading() {
  const { openModal, setOperation, clearItem } = useCategoriesStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Catégories</h3>
      </div>
      <Button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='h-10 rounded-xl px-5'
      >
        <Plus weight='bold' /> Ajouter Une Catégorie
      </Button>
    </div>
  )
}

function CategoriesTable() {
  const { items, fetchItems, setOperation, openModal, setItem } = useCategoriesStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const columns = useMemo(
    () =>
      createCategoriesColumns({
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
        emptyIcon={CATEGORIES_EMPTY_ICON}
        emptyTitle='Aucune catégorie trouvée'
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty icon={CATEGORIES_EMPTY_ICON} title='Aucune catégorie trouvée' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              return (
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8'>
                      <FolderOpen size={20} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold'>{item.category}</p>
                      <p className='text-xs text-muted-foreground'>
                        {item._count?.services || 0} service{(item._count?.services || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        setItem(item)
                        setOperation('edit')
                        openModal()
                      }}
                    >
                      <Pen size={14} /> Modifier
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 text-destructive hover:bg-destructive/10'
                      onClick={() => {
                        setItem(item)
                        setOperation('delete')
                        openModal()
                      }}
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
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useCategoriesStore()
  const isEdit = operation === 'edit'
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      title={isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
      onSubmit={(e) => {
        e.preventDefault()
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer la catégorie'}
      onCancel={closeModal}
      className='sm:max-w-lg'
    >
      <div className='flex items-center justify-center mb-4'>
        <div className='w-16 h-16 rounded-2xl bg-primary/[0.08] flex items-center justify-center'>
          <FolderOpen size={32} className='text-primary' />
        </div>
      </div>

      <div className='space-y-2'>
        <Label className='text-xs font-semibold uppercase tracking-wider text-secondary/40'>Nom de la catégorie</Label>
        <Input
          type='text'
          value={item.category}
          onChange={(e) => setItem({ ...item, category: e.target.value })}
          placeholder='Cardiologie'
        />
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useCategoriesStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <div className='p-6 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={28} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette catégorie ?</h2>
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
