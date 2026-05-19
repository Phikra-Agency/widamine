import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, FolderOpen, Star, Link } from '@phosphor-icons/react'
import { useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Basse', color: 'bg-gray-50 text-gray-600' },
  2: { label: 'Normale', color: 'bg-blue-50 text-blue-600' },
  3: { label: 'Haute', color: 'bg-amber-50 text-amber-600' },
  4: { label: 'Urgente', color: 'bg-red-50 text-red-600' },
}

export default function Resources() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className='bo-page-scroll'
    >
      <div className='bo-page-inner'>
        {/* Ambient background */}
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack'>
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
  const { openCreateModal } = useResourcesStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Salles</h3>
        <p className='bo-subtitle'>Gérez les salles et leurs priorités</p>
      </div>
      <button
        onClick={openCreateModal}
        className='bo-primary-btn cursor-pointer hover:scale-[1.02]'
      >
        <Plus weight='bold' /> Ajouter Une Salle
      </button>
    </div>
  )
}

function Table() {
  const { items, fetchItems, openEditModal, openDeleteModal } = useResourcesStore()
  useEffect(() => { fetchItems() }, [])
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-black/[0.04]'>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Salle</th>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Priorité</th>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motifs associés</th>
          <th className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 && (
          <tr><td colSpan={4} className='px-6 py-12 text-center text-secondary/40'>Aucune salle trouvée</td></tr>
        )}
        {items.map((item) => {
          const prioConf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG[1]
          return (
            <tr className='border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors' key={item.id}>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-secondary/[0.04] flex items-center justify-center'>
                    <FolderOpen size={18} className='text-secondary/50' />
                  </div>
                  <span className='font-medium text-secondary'>{item.name}</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${prioConf.color}`}>
                  <Star size={12} weight={item.priority >= 3 ? 'fill' : 'regular'} />
                  {prioConf.label}
                </span>
              </td>
              <td className='px-6 py-4'>
                <div className='flex flex-wrap gap-1.5'>
                  {(item.motifs || []).length === 0 ? (
                    <span className='text-xs text-secondary/40'>Aucun motif</span>
                  ) : (
                    (item.motifs || []).map((m) => (
                      <span key={m.id} className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary/[0.03] text-secondary/60'>
                        <Link size={10} />
                        {m.name}
                      </span>
                    ))
                  )}
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center justify-end gap-1'>
                  <button onClick={() => openEditModal(item)} className='p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'><Pen size={16} /></button>
                  <button onClick={() => openDeleteModal(item)} className='p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200'><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
    </div>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const { items: motifs, fetchItems: fetchMotifs } = useMotifsStore()
  const isEdit = operation === 'edit'

  useEffect(() => { fetchMotifs() }, [])

  function toggleMotif(motifId: string) {
    const cur = item.motifIds || []
    const next = cur.includes(motifId)
      ? cur.filter((id: string) => id !== motifId)
      : [...cur, motifId]
    setItem({ ...item, motifIds: next })
  }

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <motion.form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveItem() }} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={['create', 'edit'].includes(operation) && modalOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.15)', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier' : 'Nouvelle'} salle</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez les informations de la salle' : 'Ajoutez une nouvelle salle'}</p>
        </div>
        <div className='p-6 space-y-5'>
          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom de la salle</label>
            <input type='text' value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' placeholder='Salle A' />
          </div>
          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Priorité</label>
            <div className='grid grid-cols-4 gap-2'>
              {[1, 2, 3, 4].map((p) => {
                const conf = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p}
                    type='button'
                    onClick={() => setItem({ ...item, priority: p })}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all duration-200',
                      item.priority === p
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1]'
                    )}
                  >
                    <Star size={16} weight={p >= 3 ? 'fill' : 'regular'} />
                    <span className='text-[10px] font-medium'>{conf.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motifs associés</label>
            <div className='flex flex-wrap gap-2 p-3 rounded-lg border border-black/[0.06] bg-white min-h-[60px]'>
              {motifs.length === 0 ? (
                <span className='text-xs text-secondary/40'>Aucun motif disponible</span>
              ) : (
                motifs.map((motif) => {
                  const selected = (item.motifIds || []).includes(motif.id!)
                  return (
                    <button
                      key={motif.id}
                      type='button'
                      onClick={() => toggleMotif(motif.id!)}
                      className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all duration-200',
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1]'
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
        </div>
        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button' className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>Annuler</button>
          <button type='submit' className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all duration-200'>{isEdit ? 'Enregistrer' : 'Créer la salle'}</button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useResourcesStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <div onClick={(e) => e.stopPropagation()} className={clsx('relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className='p-6 text-center'>
          <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cette salle ?</h2>
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
