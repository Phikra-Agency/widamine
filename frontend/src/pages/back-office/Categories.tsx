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
      transition={{ duration: 0.45 }}
      className='h-full'
    >
      <div className='space-y-5 relative'>
        <Heading />
        <div className='relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-white/60 shadow-[0_20px_60px_rgba(10,31,47,0.08)] backdrop-blur-xl'>
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
        <h3 className='font-semibold text-2xl text-secondary tracking-tight'>Gestion Des Catégories</h3>
        <p className='text-sm text-secondary/60 mt-1'>Organisez vos services par catégorie</p>
      </div>
      <button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='flex gap-2 items-center cursor-pointer bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25'
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
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-secondary/10'>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Catégorie</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Services</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>
            <td colSpan={3} className='px-6 py-12 text-center'>
              <div className='flex flex-col items-center gap-3 text-secondary/50'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center'>
                  <FolderOpen size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucune catégorie trouvée</p>
                <p className='text-xs'>Ajoutez une catégorie pour organiser vos services</p>
              </div>
            </td>
          </tr>
        )}
        {items.map((item) => (
          <tr className='border-b border-secondary/5 hover:bg-white/40 transition-colors' key={item.id}>
            <td className='px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <FolderOpen size={20} className='text-primary' />
                </div>
                <span className='font-medium text-secondary'>{item.category}</span>
              </div>
            </td>
            <td className='px-6 py-4'>
              <div className='flex items-center gap-1.5 text-secondary/70'>
                <span className='font-medium'>{item._count?.services || 0}</span>
                <span className='text-xs text-secondary/50'>services</span>
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
                  className='p-2 rounded-lg text-secondary/60 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'
                >
                  <Pen size={18} />
                </button>
                <button
                  onClick={() => {
                    setItem(item)
                    setOperation('delete')
                    openModal()
                  }}
                  className='p-2 rounded-lg text-secondary/60 hover:text-red-600 hover:bg-red-50 transition-all duration-200'
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useCategoriesStore()
  const isEdit = operation === 'edit'

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <motion.form
        onSubmit={(e) => {
          e.preventDefault()
          saveItem()
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={['create', 'edit'].includes(operation) && modalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.32 }}
        className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
      >
        <div className='sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
          <p className='text-sm text-secondary/60 mt-0.5'>{isEdit ? 'Modifiez le nom de la catégorie' : 'Créez une nouvelle catégorie de services'}</p>
        </div>

        <div className='p-6 space-y-5'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <FolderOpen size={32} className='text-primary' />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Nom de la catégorie</label>
            <input
              type='text'
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder='Cardiologie'
            />
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02]'>
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
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <div className={clsx('relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', operation === 'delete' && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className='p-6 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={28} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette catégorie ?</h2>
          <p className='text-sm text-secondary/60 mt-2'>Cette action est irréversible. La catégorie sera définitivement supprimée.</p>
        </div>
        <div className='border-t border-secondary/10 px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button onClick={deleteItem} className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 hover:scale-[1.02]'>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
