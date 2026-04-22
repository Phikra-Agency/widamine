import { useResourcesStore } from '@/stores/resourcesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen } from '@phosphor-icons/react'
import { useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Resources() {
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
  const { openModal, setOperation, clearItem } = useResourcesStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='font-semibold text-2xl text-secondary tracking-tight'>Gestion Des Ressources</h3>
        <p className='text-sm text-secondary/60 mt-1'>Gérez les ressources disponibles</p>
      </div>
      <button
        onClick={() => { clearItem(); setOperation('create'); openModal() }}
        className='flex gap-2 items-center cursor-pointer bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]'
      >
        <Plus weight='bold' /> Ajouter Une Ressource
      </button>
    </div>
  )
}

function Table() {
  const { items, fetchItems, setOperation, openModal, setItem } = useResourcesStore()
  useEffect(() => { fetchItems() }, [])
  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-secondary/10'>
          <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Ressource</th>
          <th className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr><td colSpan={2} className='px-6 py-12 text-center text-secondary/50'>Aucune ressource trouvée</td></tr>
        )}
        {items.map((item) => (
          <tr className='border-b border-secondary/5 hover:bg-white/40' key={item.id}>
            <td className='px-6 py-4 font-medium text-secondary'>{item.name}</td>
            <td className='px-6 py-4'>
              <div className='flex items-center justify-end gap-1'>
                <button onClick={() => { setItem(item); setOperation('edit'); openModal() }} className='p-2 rounded-lg hover:bg-amber-50'><Pen size={18} /></button>
                <button onClick={() => { setItem(item); setOperation('delete'); openModal() }} className='p-2 rounded-lg hover:bg-red-50'><Trash2 size={18} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const isEdit = operation === 'edit'
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm' onClick={closeModal} />
      <motion.form onSubmit={(e) => { e.preventDefault(); saveItem() }} initial={{ opacity: 0, y: 12 }} animate={['create', 'edit'].includes(operation) && modalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.32 }} className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] bg-white shadow-[0_40px_100px_rgba(10,31,47,0.25)]', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className='px-6 py-4 border-b border-secondary/10'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier' : 'Nouvelle'} ressource</h2>
        </div>
        <div className='p-6'>
          <input type='text' value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className='w-full rounded-xl border border-secondary/10 px-4 py-2.5' placeholder='Nom de la ressource' />
        </div>
        <div className='px-6 py-4 flex gap-3 justify-end border-t border-secondary/10'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-xl text-sm'>Annuler</button>
          <button type='submit' className='px-5 py-2.5 rounded-xl text-sm bg-primary text-white'>Enregistrer</button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useResourcesStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm' onClick={closeModal} />
      <div className={clsx('relative w-full max-w-md rounded-[2rem] bg-white shadow-[0_40px_100px_rgba(10,31,47,0.25)]', operation === 'delete' && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className='p-6 text-center'>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette ressource ?</h2>
          <p className='text-sm text-secondary/60 mt-2'>Cette action est irréversible.</p>
        </div>
        <div className='px-6 py-4 flex gap-3 justify-end border-t border-secondary/10'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-xl text-sm'>Annuler</button>
          <button onClick={deleteItem} className='px-5 py-2.5 rounded-xl text-sm bg-red-500 text-white'>Supprimer</button>
        </div>
      </div>
    </div>
  )
}
