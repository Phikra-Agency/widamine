import { usePatientStore } from '@/stores/patientsStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, EnvelopeSimple, Phone, MapPin, CalendarBlank } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useDebounce } from 'use-debounce'

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  MALE: { label: 'Homme', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  FEMALE: { label: 'Femme', color: 'bg-pink-50 text-pink-700 border-pink-100' },
  OTHER: { label: 'Autre', color: 'bg-gray-50 text-gray-700 border-gray-100' },
}

export default function Patients() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className='h-full'
    >
      <div className='space-y-5 relative'>
        <Heading />
        <Filters />
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
  const { openModal, setOperation, clearItem } = usePatientStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='font-semibold text-2xl text-secondary tracking-tight'>Gestion Des Patients</h3>
        <p className='text-sm text-secondary/60 mt-1'>Gérez les dossiers de vos patients</p>
      </div>
      <button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='flex gap-2 items-center cursor-pointer bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25'
      >
        <Plus weight='bold' /> Ajouter Un Patient
      </button>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = usePatientStore()

  return (
    <div className='flex gap-4'>
      <div className='relative flex-1 max-w-md'>
        <input
          type='text'
          placeholder='Rechercher par nom ou email...'
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className='w-full bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm transition-all'
        />
      </div>
    </div>
  )
}

function Table() {
  const { items, filters, fetchItems, setOperation, openModal, setItem } = usePatientStore()
  const [filtered, setFiltered] = useState(items)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setFiltered(
      items.filter(
        (i) =>
          i.firstName.toLowerCase().includes(debouncedFilters.term.toLowerCase()) ||
          i.lastName.toLowerCase().includes(debouncedFilters.term.toLowerCase()) ||
          i.email.toLowerCase().includes(debouncedFilters.term.toLowerCase())
      )
    )
  }, [items, debouncedFilters])

  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-secondary/10'>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Patient</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Email</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Téléphone</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Naissance</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Ville</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} className='px-6 py-12 text-center'>
              <div className='flex flex-col items-center gap-3 text-secondary/50'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center'>
                  <User size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucun patient trouvé</p>
                <p className='text-xs'>Ajoutez un patient pour commencer</p>
              </div>
            </td>
          </tr>
        )}
        {filtered.map((item) => {
          const genderConf = GENDER_CONFIG[item.gender] || GENDER_CONFIG.OTHER
          return (
            <tr className='border-b border-secondary/5 hover:bg-white/40 transition-colors' key={item.id}>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <User size={20} className='text-primary' />
                  </div>
                  <div>
                    <span className='font-medium text-secondary block'>{item.firstName} {item.lastName}</span>
                    <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border mt-0.5', genderConf.color)}>{genderConf.label}</span>
                  </div>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-1.5 text-secondary/70'>
                  <EnvelopeSimple size={14} className='text-secondary/40' />
                  <span>{item.email}</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-1.5 text-secondary/70'>
                  <Phone size={14} className='text-secondary/40' />
                  <span>{item.phone}</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-1.5 text-secondary/70'>
                  <CalendarBlank size={14} className='text-secondary/40' />
                  <span>{new Date(item.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-1.5 text-secondary/70'>
                  <MapPin size={14} className='text-secondary/40' />
                  <span>{item.city || '—'}</span>
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
          )
        })}
      </tbody>
    </table>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = usePatientStore()
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
        className={clsx('relative w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
      >
        <div className='sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier le patient' : 'Nouveau patient'}</h2>
          <p className='text-sm text-secondary/60 mt-0.5'>{isEdit ? 'Modifiez les informations du patient' : 'Ajoutez un nouveau patient'}</p>
        </div>

        <div className='p-6 space-y-6'>
          <div className='flex items-center justify-center mb-2'>
            <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <User size={32} className='text-primary' />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Prénom</label>
              <input type='text' value={item.firstName} onChange={(e) => setItem({ ...item, firstName: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Ahmed' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Nom</label>
              <input type='text' value={item.lastName} onChange={(e) => setItem({ ...item, lastName: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Benali' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Email</label>
              <input type='email' value={item.email} onChange={(e) => setItem({ ...item, email: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='ahmed@example.com' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Téléphone</label>
              <input type='text' value={item.phone} onChange={(e) => setItem({ ...item, phone: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='+212600000000' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Date de naissance</label>
              <input type='date' value={item.dateOfBirth} onChange={(e) => setItem({ ...item, dateOfBirth: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Genre</label>
              <select value={item.gender} onChange={(e) => setItem({ ...item, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer'>
                <option value='MALE'>Homme</option>
                <option value='FEMALE'>Femme</option>
                <option value='OTHER'>Autre</option>
              </select>
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Adresse</label>
              <input type='text' value={item.address} onChange={(e) => setItem({ ...item, address: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='123 Rue Mohammed V' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Ville</label>
              <input type='text' value={item.city} onChange={(e) => setItem({ ...item, city: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Casablanca' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Code postal</label>
              <input type='text' value={item.postalCode} onChange={(e) => setItem({ ...item, postalCode: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='20000' />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Pays</label>
              <input type='text' value={item.country} onChange={(e) => setItem({ ...item, country: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Maroc' />
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Antécédents médicaux</label>
              <textarea value={item.medicalHistory || ''} onChange={(e) => setItem({ ...item, medicalHistory: e.target.value })}
                className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Notes sur les antécédents médicaux...'
                rows={3} />
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit'
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02]'>
            {isEdit ? 'Enregistrer' : 'Créer le patient'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = usePatientStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', operation === 'delete' && modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <div className={clsx('relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', operation === 'delete' && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className='p-6 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={28} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer ce patient ?</h2>
          <p className='text-sm text-secondary/60 mt-2'>Cette action est irréversible. Le patient sera définitivement supprimé.</p>
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
