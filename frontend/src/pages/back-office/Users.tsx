import { useUsersStore } from '@/stores/usersStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, Crown, Stethoscope, UserCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useDebounce } from 'use-debounce'
import type { Role } from '@/stores/authStore'

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-violet-50 text-violet-700 border-violet-100', icon: Crown },
  DOCTOR: { label: 'Médecin', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Stethoscope },
  RECEPTIONIST: { label: 'Réceptionniste', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: UserCircle },
}

export default function Users() {
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
  const { openModal, setOperation, clearItem } = useUsersStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='font-semibold text-2xl text-secondary tracking-tight'>Gestion Des Utilisateurs</h3>
        <p className='text-sm text-secondary/60 mt-1'>Gérez les comptes utilisateurs et leurs rôles</p>
      </div>
      <button
        onClick={() => {
          clearItem()
          setOperation('create')
          openModal()
        }}
        className='flex gap-2 items-center cursor-pointer bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25'
      >
        <Plus weight='bold' /> Ajouter Un Utilisateur
      </button>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useUsersStore()

  return (
    <div className='flex gap-4'>
      <div className='relative flex-1 max-w-md'>
        <input 
          type='text' 
          placeholder='Rechercher un utilisateur...' 
          value={filters.term} 
          onChange={(e) => setFilters({ ...filters, term: e.target.value })} 
          className='w-full bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm transition-all' 
        />
      </div>
      <select 
        onChange={(e) => setFilters({ ...filters, role: e.target.value as Role & 'null' })} 
        value={filters.role}
        className='bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm cursor-pointer min-w-[180px]'
      >
        <option value='null'>Tous les rôles</option>
        <option value='RECEPTIONIST'>Réceptionniste</option>
        <option value='ADMIN'>Administrateur</option>
        <option value='DOCTOR'>Médecin</option>
      </select>
    </div>
  )
}

function Table() {
  const { items, filters, fetchItems, setOperation, openModal, setItem } = useUsersStore()
  const [filtered, setFiltered] = useState(items)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setFiltered(items.filter((i) => (i.name.includes(debouncedFilters.term) || i.email.includes(debouncedFilters.term)) && (debouncedFilters.role === 'null' || i.role === debouncedFilters.role)))
  }, [items, debouncedFilters])

  return (
    <table className='w-full text-sm'>
      <thead>
        <tr className='border-b border-secondary/10'>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Utilisateur</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Email</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60'>Rôle</th>
          <th scope='col' className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={4} className='px-6 py-12 text-center'>
              <div className='flex flex-col items-center gap-3 text-secondary/50'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center'>
                  <User size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucun utilisateur trouvé</p>
                <p className='text-xs'>Ajoutez un utilisateur pour commencer</p>
              </div>
            </td>
          </tr>
        )}
        {filtered.map((item) => {
          const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
          const RoleIcon = roleConfig.icon
          return (
            <tr className='border-b border-secondary/5 hover:bg-white/40 transition-colors' key={item.id}>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <User size={20} className='text-primary' />
                  </div>
                  <div className='font-medium text-secondary'>{item.name}</div>
                </div>
              </td>
              <td className='px-6 py-4 text-secondary/70'>{item.email}</td>
              <td className='px-6 py-4'>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${roleConfig.color}`}>
                  <RoleIcon size={12} />
                  {roleConfig.label}
                </span>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center justify-end gap-1'>
                  <button
                    onClick={() => {
                      setItem({ ...item, password: '' })
                      setOperation('edit')
                      openModal()
                    }}
                    className='p-2 rounded-lg text-secondary/60 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'
                  >
                    <Pen size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setItem({ ...item, password: '' })
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
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useUsersStore()
  const isEdit = operation === 'edit'
  const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
  const RoleIcon = roleConfig.icon

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
        className={clsx('relative w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', ['create', 'edit'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
      >
        <div className='sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
          <p className='text-sm text-secondary/60 mt-0.5'>{isEdit ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}</p>
        </div>

        <div className='p-6 space-y-5'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <RoleIcon size={32} className='text-primary' />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Nom complet</label>
            <input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} 
              className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' 
              placeholder='John Doe' />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Email</label>
            <input type='email' value={item.email} onChange={(e) => setItem({ ...item, email: e.target.value })} 
              className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' 
              placeholder='john.doe@example.com' />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Rôle</label>
            <div className='grid grid-cols-3 gap-3'>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                const RIcon = config.icon
                return (
                  <button
                    key={role}
                    type='button'
                    onClick={() => setItem({ ...item, role: role as Role })}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
                      item.role === role
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-secondary/10 bg-white/80 text-secondary/60 hover:border-secondary/20'
                    )}
                  >
                    <RIcon size={20} weight={item.role === role ? 'fill' : 'regular'} />
                    <span className='text-xs font-medium text-center leading-tight'>{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-secondary/60'>Mot de passe</label>
            <input type='password' value={item.password} onChange={(e) => setItem({ ...item, password: e.target.value })} 
              className='w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' 
              placeholder={isEdit ? 'Laisser vide pour ne pas changer' : '********'} />
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button' 
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit' 
            className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-[1.02]'>
            {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useUsersStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', ['delete'].includes(operation) && modalOpen ? '' : 'opacity-0 pointer-events-none')}>
      <div className='absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300' onClick={closeModal} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          deleteItem()
        }}
        className={clsx('relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', ['delete'].includes(operation) && modalOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
      >
        <div className='p-6 text-center'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={28} className='text-red-500' />
          </div>
          <h2 className='text-lg font-semibold text-secondary'>Supprimer cet utilisateur ?</h2>
          <p className='text-sm text-secondary/60 mt-2'>Cette action est irréversible. L'utilisateur sera définitivement supprimé.</p>
        </div>

        <div className='border-t border-secondary/10 px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button' className='px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit' className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 hover:scale-[1.02]'>
            Supprimer
          </button>
        </div>
      </form>
    </div>
  )
}
