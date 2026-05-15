import { useResourcesStore } from '@/stores/resourcesStore'
import { useMotifsStore } from '@/stores/motifsStore'
import { useUsersStore } from '@/stores/usersStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, Star, Link as LinkIcon, Door, Stethoscope, UserCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

const PRIO: Record<number, { label: string; color: string }> = {
  1: { label: 'Basse', color: 'bg-gray-50 text-gray-600 border-gray-100' },
  2: { label: 'Normale', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  3: { label: 'Haute', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  4: { label: 'Urgente', color: 'bg-red-50 text-red-600 border-red-100' },
}

type Tab = 'salles' | 'motifs'

export default function SallesMotifs() {
  const [tab, setTab] = useState<Tab>('salles')
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className='bo-page-scroll'>
      <div className='bo-page-inner'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />
        <div className='bo-section-stack'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h3 className='bo-title'>Salles & Motifs</h3>
              <p className='bo-subtitle'>Gérez les salles, motifs et leurs associations</p>
            </div>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='inline-flex items-center gap-1 rounded-xl border border-black/[0.06] bg-secondary/[0.01] p-1'>
                <button onClick={() => setTab('salles')} className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'salles' ? 'bg-white text-secondary border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-secondary/55 hover:text-secondary hover:bg-white/80')}>
                  <Door size={14} /> Salles
                </button>
                <button onClick={() => setTab('motifs')} className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'motifs' ? 'bg-white text-secondary border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-secondary/55 hover:text-secondary hover:bg-white/80')}>
                  <Stethoscope size={14} /> Motifs
                </button>
              </div>
              {tab === 'salles' ? <AddSalleBtn /> : <AddMotifBtn />}
            </div>
          </div>
          <AnimatePresence mode='wait'>
            {tab === 'salles' ? (
              <motion.div key='salles' initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className='bo-surface'>
                <SallesTable />
              </motion.div>
            ) : (
              <motion.div key='motifs' initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className='bo-surface'>
                <MotifsTable />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SalleModal /><SalleDeleteModal /><MotifModal /><MotifDeleteModal />
    </motion.div>
  )
}

function AddSalleBtn() { const { openCreateModal } = useResourcesStore(); return <button onClick={openCreateModal} className='bo-primary-btn hover:scale-[1.02]'><Plus weight='bold' size={16} /> Ajouter</button> }
function AddMotifBtn() { const { openModal, setOperation, clearItem } = useMotifsStore(); return <button onClick={() => { clearItem(); setOperation('create'); openModal() }} className='bo-primary-btn hover:scale-[1.02]'><Plus weight='bold' size={16} /> Ajouter</button> }

function SallesTable() {
  const { items, fetchItems, openEditModal, openDeleteModal } = useResourcesStore()
  useEffect(() => { fetchItems() }, [])
  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-black/[0.04] bg-secondary/[0.01]'>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Salle</th>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Priorité</th>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Motifs associés</th>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody className='divide-y divide-black/[0.02]'>
        {items.length === 0 && <tr><td colSpan={4} className='px-6 py-12 text-center'><div className='flex flex-col items-center gap-2 text-secondary/30'><Door size={24} /><p className='text-sm font-medium'>Aucune salle trouvée</p></div></td></tr>}
        {items.map((item) => { const p = PRIO[item.priority] || PRIO[1]; return (
          <tr className='group hover:bg-secondary/[0.02] transition-colors' key={item.id}>
            <td className='px-6 py-4'><div className='flex items-center gap-3'><div className='w-9 h-9 rounded-xl bg-secondary/[0.04] flex items-center justify-center group-hover:bg-primary/10 transition-colors'><Door size={16} className='text-secondary/40 group-hover:text-primary transition-colors' /></div><span className='font-semibold text-secondary text-sm tracking-tight'>{item.name}</span></div></td>
            <td className='px-6 py-4'><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${p.color}`}><Star size={11} weight={item.priority >= 3 ? 'fill' : 'regular'} />{p.label}</span></td>
            <td className='px-6 py-4'><div className='flex flex-wrap gap-1.5'>{(item.motifs || []).length === 0 ? <span className='text-xs text-secondary/30'>Aucun motif</span> : (item.motifs || []).map((m: any) => <span key={m.id} className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-secondary/[0.03] text-secondary/50 border-black/[0.04]'><LinkIcon size={9} />{m.name}</span>)}</div></td>
            <td className='px-6 py-4'><div className='flex items-center justify-end gap-1'><button onClick={() => openEditModal(item)} className='p-2 rounded-lg text-secondary/30 hover:text-amber-600 hover:bg-amber-50 transition-all'><Pen size={16} /></button><button onClick={() => openDeleteModal(item)} className='p-2 rounded-lg text-secondary/30 hover:text-red-600 hover:bg-red-50 transition-all'><Trash2 size={16} /></button></div></td>
          </tr>
        )})}
      </tbody>
    </table>
  )
}

function MotifsTable() {
  const { items, fetchItems, setOperation, openModal, setItem } = useMotifsStore()
  useEffect(() => { fetchItems() }, [])
  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-black/[0.04] bg-secondary/[0.01]'>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Motif</th>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Durée</th>
          <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody className='divide-y divide-black/[0.02]'>
        {items.length === 0 && <tr><td colSpan={3} className='px-6 py-12 text-center'><div className='flex flex-col items-center gap-2 text-secondary/30'><Stethoscope size={24} /><p className='text-sm font-medium'>Aucun motif trouvé</p></div></td></tr>}
        {items.map((item) => (
          <tr className='group hover:bg-secondary/[0.02] transition-colors' key={item.id}>
            <td className='px-6 py-4'><div className='flex items-center gap-3'><div className='w-9 h-9 rounded-xl bg-secondary/[0.04] flex items-center justify-center group-hover:bg-primary/10 transition-colors'><Stethoscope size={16} className='text-secondary/40 group-hover:text-primary transition-colors' /></div><span className='font-semibold text-secondary text-sm tracking-tight'>{item.name}</span></div></td>
            <td className='px-6 py-4'><span className='inline-flex items-center rounded-md border border-black/[0.06] bg-secondary/[0.01] px-2.5 py-1 text-xs font-semibold text-secondary/70'>{item.duration || 30} min</span></td>
            <td className='px-6 py-4'><div className='flex items-center justify-end gap-1'><button onClick={() => { setItem(item); setOperation('edit'); openModal() }} className='p-2 rounded-lg text-secondary/30 hover:text-amber-600 hover:bg-amber-50 transition-all'><Pen size={16} /></button><button onClick={() => { setItem(item); setOperation('delete'); openModal() }} className='p-2 rounded-lg text-secondary/30 hover:text-red-600 hover:bg-red-50 transition-all'><Trash2 size={16} /></button></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SalleModal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useResourcesStore()
  const { items: motifs, fetchItems: fetchMotifs } = useMotifsStore()
  const isEdit = operation === 'edit'
  const visible = ['create', 'edit'].includes(operation) && modalOpen
  useEffect(() => { if (visible) fetchMotifs() }, [visible])
  function toggleMotif(motifId: string) {
    const cur = item.motifIds || []
    setItem({ ...item, motifIds: cur.includes(motifId) ? cur.filter((id: string) => id !== motifId) : [...cur, motifId] })
  }
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <motion.form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveItem() }} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className='relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.15)]'>
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'><h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier' : 'Nouvelle'} salle</h2><p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez les informations' : 'Ajoutez une nouvelle salle'}</p></div>
        <div className='p-6 space-y-5'>
          <div className='space-y-2'><label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nom</label><input type='text' value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' placeholder='Salle A' /></div>
          <div className='space-y-2'><label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Priorité</label><div className='grid grid-cols-4 gap-2'>{[1, 2, 3, 4].map((p) => (<button key={p} type='button' onClick={() => setItem({ ...item, priority: p })} className={clsx('flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all', item.priority === p ? 'border-primary bg-primary/5 text-primary' : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1]')}><Star size={16} weight={p >= 3 ? 'fill' : 'regular'} /><span className='text-[10px] font-bold'>{PRIO[p].label}</span></button>))}</div></div>
          <div className='space-y-2'><label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Motifs associés</label><div className='flex flex-wrap gap-2 p-3 rounded-lg border border-black/[0.06] bg-white min-h-[60px]'>{motifs.length === 0 ? <span className='text-xs text-secondary/30'>Aucun motif disponible</span> : motifs.map((m) => { const sel = (item.motifIds || []).includes(m.id!); return <button key={m.id} type='button' onClick={() => toggleMotif(m.id!)} className={clsx('inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold border transition-all', sel ? 'border-primary bg-primary/10 text-primary' : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1]')}><LinkIcon size={10} />{m.name}</button> })}</div></div>
        </div>
        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'><button onClick={closeModal} type='button' className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all'>Annuler</button><button type='submit' className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all'>{isEdit ? 'Enregistrer' : 'Créer'}</button></div>
      </motion.form>
    </div>
  )
}

function SalleDeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useResourcesStore()
  const visible = operation === 'delete' && modalOpen
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <div onClick={(e) => e.stopPropagation()} className='relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'>
        <div className='p-6 text-center'><div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'><Trash2 size={26} className='text-red-500' /></div><h2 className='text-lg font-semibold text-secondary'>Supprimer cette salle ?</h2><p className='text-sm text-secondary/50 mt-2'>Cette action est irréversible.</p></div>
        <div className='px-6 py-4 flex gap-3 justify-end border-t border-black/[0.04]'><button onClick={closeModal} className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all'>Annuler</button><button onClick={deleteItem} className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all'>Supprimer</button></div>
      </div>
    </div>
  )
}

function MotifModal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useMotifsStore()
  const { items: users, fetchItems: fetchUsers } = useUsersStore()
  
  const isEdit = operation === 'edit'
  const visible = ['create', 'edit'].includes(operation) && modalOpen
  
  useEffect(() => {
    if (visible) fetchUsers()
  }, [visible])

  const doctors = users.filter(u => u.role === 'DOCTOR' || u.role === 'PRACTITIONER')

  const toggleDoctor = (docId: string) => {
    const cur = item.practitionerIds || []
    const next = cur.includes(docId) 
      ? cur.filter(id => id !== docId) 
      : [...cur, docId]
    setItem({ ...item, practitionerIds: next })
  }

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <motion.form 
        onClick={(e) => e.stopPropagation()} 
        onSubmit={(e) => { e.preventDefault(); saveItem() }} 
        initial={{ opacity: 0, y: 16, scale: 0.98 }} 
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.98 }} 
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} 
        className='relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.15)]'
      >
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier' : 'Nouveau'} motif</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez le motif' : 'Ajoutez un nouveau motif'}</p>
        </div>
        
        <div className='p-6 space-y-6'>
          {/* Name Field */}
          <div className='space-y-2'>
            <label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Nom du motif</label>
            <input 
              type='text' 
              value={item.name} 
              onChange={(e) => setItem({ ...item, name: e.target.value })} 
              className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' 
              placeholder='Nom du motif' 
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Durée (minutes)</label>
            <input
              type='number'
              min={5}
              step={5}
              value={item.duration ?? 30}
              onChange={(e) =>
                setItem({
                  ...item,
                  duration: Math.max(5, Number.parseInt(e.target.value || '30', 10) || 30),
                })
              }
              className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder='30'
            />
          </div>

          {/* Doctor Selection */}
          <div className='space-y-2'>
            <label className='text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40'>Praticiens assignés</label>
            <div className='flex flex-wrap gap-2 p-3 rounded-xl border border-black/[0.06] bg-secondary/[0.01] min-h-[60px]'>
              {doctors.length === 0 ? (
                <span className='text-xs text-secondary/30'>Aucun praticien trouvé</span>
              ) : (
                doctors.map((doc) => {
                  const isSelected = (item.practitionerIds || []).includes(doc.id.toString())
                  return (
                    <button 
                      key={doc.id} 
                      type='button' 
                      onClick={() => toggleDoctor(doc.id.toString())} 
                      className={clsx(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                          : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1] hover:text-secondary/70'
                      )}
                    >
                      <UserCircle size={14} weight={isSelected ? 'fill' : 'regular'} />
                      {doc.name}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button' className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all'>Annuler</button>
          <button type='submit' className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all'>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

function MotifDeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useMotifsStore()
  const visible = operation === 'delete' && modalOpen
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/30 backdrop-blur-sm' onClick={closeModal} />
      <div onClick={(e) => e.stopPropagation()} className='relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'>
        <div className='p-6 text-center'><div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'><Trash2 size={26} className='text-red-500' /></div><h2 className='text-lg font-semibold text-secondary'>Supprimer ce motif ?</h2><p className='text-sm text-secondary/50 mt-2'>Cette action est irréversible.</p></div>
        <div className='px-6 py-4 flex gap-3 justify-end border-t border-black/[0.04]'><button onClick={closeModal} className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all'>Annuler</button><button onClick={deleteItem} className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all'>Supprimer</button></div>
      </div>
    </div>
  )
}
