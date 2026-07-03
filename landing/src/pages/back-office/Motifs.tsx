import { useMotifsStore } from '@/stores/motifsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2 } from '@phosphor-icons/react'
import { useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Motifs() {
  const { closeModal: closeMotModal, setOperation: setMotOperation } = useMotifsStore()

  useEffect(() => {
    return () => {
      closeMotModal()
      setMotOperation('create')
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner'>
        {/* Ambient background */}
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack h-full min-h-0 overflow-y-auto'>
          <Heading />
          <div className='bo-surface'>
            <Table />
          </div>
        </div>
      </div>
      <Modal />
      <DeleteModal />
    </motion.div>
  )
}

function Heading() {
  const { openModal, setOperation, clearItem } = useMotifsStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Traitements</h3>
        <p className='bo-subtitle'>Définissez les traitements de consultation</p>
      </div>
      <button
        onClick={() => { clearItem(); setOperation('create'); openModal() }}
        className='bo-primary-btn cursor-pointer hover:scale-[1.02]'
      >
        <Plus weight='bold' /> Ajouter Un Traitement
      </button>
    </div>
  )
}

function Table() {
  const { items, fetchItems, setOperation, openModal, setItem } = useMotifsStore()
  useEffect(() => { fetchItems() }, [])
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-black/[0.04]'>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Traitement</th>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Durée</th>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr>          <td colSpan={3} className='px-6 py-12 text-center text-secondary/40'>Aucun traitement trouvé</td></tr>
        )}
        {items.map((item) => (
          <tr className='border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors' key={item.id}>
            <td className='px-6 py-4 font-medium text-secondary'>{item.name}</td>
            <td className='px-6 py-4 text-secondary/70'>{item.duration || 30} min</td>
            <td className='px-6 py-4'>
              <div className='flex items-center justify-end gap-1'>
                <button onClick={() => { setItem(item); setOperation('edit'); openModal() }} className='p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'><Pen size={16} /></button>
                <button onClick={() => { setItem(item); setOperation('delete'); openModal() }} className='p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200'><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useMotifsStore()
  const isEdit = operation === 'edit'
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <motion.form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveItem() }} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={['create', 'edit'].includes(operation) && modalOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-bo-elevated', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier' : 'Nouveau'} traitement</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez le traitement de consultation' : 'Ajoutez un nouveau traitement'}</p>
        </div>
        <div className='p-6'>
          <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 mb-2 block'>Nom du traitement</label>
          <input type='text' value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className='bo-input' placeholder='Nom du traitement' />
          <label className='mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 mb-2 block'>Durée (minutes)</label>
          <input
            type='number'
            min={5}
            step={5}
            value={item.duration ?? 30}
            onChange={(e) => setItem({ ...item, duration: Math.max(5, Number.parseInt(e.target.value || '30', 10) || 30) })}
            className='bo-input'
            placeholder='30'
          />
        </div>
        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>Annuler</button>
          <button type='submit' className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all duration-200'>Enregistrer</button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useMotifsStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <div onClick={(e) => e.stopPropagation()} className={clsx('relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white shadow-bo-elevated', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className='p-6 text-center'>
          <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer ce traitement ?</h2>
          <p className='text-sm text-secondary/50 mt-2'>Cette action est irréversible.</p>
        </div>
        <div className='px-6 py-4 flex gap-3 justify-end border-t border-black/[0.04]'>
          <button onClick={closeModal} className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>Annuler</button>
          <button onClick={deleteItem} className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all duration-200'>Supprimer</button>
        </div>
      </div>
    </div>
  )
}
