import { useCategoriesStore } from '@/stores/categoriesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen } from '@phosphor-icons/react'
import { useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Categories() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner bo-section-stack'>
        {/* Ambient blur circles */}
        <div className='absolute -top-20 -right-20 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none' />
        
        <Heading />
        <div className='bo-surface'>
          <Table />
        </div>
      </div>
      <Modal />
      <DeleteModal />
    </motion.div>
  )
}

function Heading() {
  const { openModal, setOperation, clearItem } = useCategoriesStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Catégories</h3>
        <p className='bo-subtitle'>Organisez vos services par catégorie</p>
      </div>
      <button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='bo-primary-btn cursor-pointer'
      >
        <Plus weight='bold' /> Ajouter Une Catégorie
      </button>
    </div>
  )
}

function Table() {
  const { items, fetchItems, setOperation, openModal, setItem } = useCategoriesStore()

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <>
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-black/[0.06]'>
            <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40'>Catégorie</th>
            <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40'>Services</th>
            <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={3} className='px-6 py-12 text-center'>
                <div className='flex flex-col items-center gap-3 text-secondary/40'>
                  <div className='w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
                    <FolderOpen size={32} className='text-secondary/30' />
                  </div>
                  <p className='text-sm font-medium'>Aucune catégorie trouvée</p>
                  <p className='text-xs'>Ajoutez une catégorie pour organiser vos services</p>
                </div>
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr className='border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors' key={item.id}>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center'>
                    <FolderOpen size={20} className='text-primary' />
                  </div>
                  <span className='font-medium text-secondary'>{item.category}</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-1.5 text-secondary/60'>
                  <span className='font-medium'>{item._count?.services || 0}</span>
                  <span className='text-xs text-secondary/40'>services</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center justify-end gap-1'>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation('edit')
                      openModal()
                    }}
                    className='p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'
                  >
                    <Pen size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation('delete')
                      openModal()
                    }}
                    className='p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className='lg:hidden'>
        <div className='space-y-3 p-3'>
          {items.length === 0 ? (
            <div className='rounded-2xl border border-black/[0.06] bg-white px-4 py-10 text-center text-secondary/40'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
                  <FolderOpen size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucune catégorie trouvée</p>
                <p className='text-xs'>Ajoutez une catégorie pour organiser vos services</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className='rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0'>
                    <FolderOpen size={20} className='text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-semibold text-secondary truncate'>{item.category}</p>
                    <p className='text-xs text-secondary/50'>{item._count?.services || 0} service{(item._count?.services || 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className='mt-3 flex items-center gap-2'>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation('edit')
                      openModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-secondary/60 hover:bg-secondary/5 hover:text-secondary transition-all'
                  >
                    <Pen size={14} className='inline mr-1' /> Modifier
                  </button>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation('delete')
                      openModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all'
                  >
                    <Trash2 size={14} className='inline mr-1' /> Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useCategoriesStore()
  const isEdit = operation === 'edit'

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <motion.form
        onSubmit={(e) => {
          e.preventDefault()
          saveItem()
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12 }}
        animate={['create', 'edit'].includes(operation) && modalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}
      >
        <div className='sticky top-0 z-10 border-b border-black/[0.06] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <p className='text-sm text-secondary/40 mt-0.5'>{isEdit ? 'Modifiez le nom de la catégorie' : 'Créez une nouvelle catégorie de services'}</p>
        </div>

        <div className='p-6 space-y-5'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-2xl bg-primary/[0.08] flex items-center justify-center'>
              <FolderOpen size={32} className='text-primary' />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/40'>Nom de la catégorie</label>
            <input
              type='text'
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              className='w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder='Cardiologie'
            />
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-black/[0.06] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200'>
            Annuler
          </button>
          <button type='submit'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/10 transition-all duration-200'>
            {isEdit ? 'Enregistrer' : 'Créer la catégorie'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useCategoriesStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <div onClick={(e) => e.stopPropagation()} className={clsx('relative w-full max-w-md rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300', operation === 'delete' && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}>
        <div className='p-6 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={28} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette catégorie ?</h2>
          <p className='text-sm text-secondary/40 mt-2'>Cette action est irréversible. La catégorie sera définitivement supprimée.</p>
        </div>
        <div className='border-t border-black/[0.06] px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200'>
            Annuler
          </button>
          <button onClick={deleteItem} className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/10 transition-all duration-200'>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
