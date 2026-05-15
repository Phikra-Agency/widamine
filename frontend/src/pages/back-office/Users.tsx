import { useUsersStore } from '@/stores/usersStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, Crown, Stethoscope, UserCircle, CaretDown } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from 'use-debounce'
import type { Role } from '@/stores/authStore'

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-violet-50 text-violet-600', icon: Crown },
  DOCTOR: { label: 'Médecin', color: 'bg-emerald-50 text-emerald-600', icon: Stethoscope },
  RECEPTIONIST: { label: 'Réceptionniste', color: 'bg-blue-50 text-blue-600', icon: UserCircle },
  PRACTITIONER: { label: 'Praticien', color: 'bg-sky-50 text-sky-600', icon: Stethoscope },
}

export default function Users() {
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
          <Filters />
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
  const { openCreateModal } = useUsersStore()
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='bo-title'>Gestion Des Utilisateurs</h3>
        <p className='bo-subtitle'>Gérez les comptes utilisateurs et leurs rôles</p>
      </div>
      <button
        onClick={openCreateModal}
        className='bo-primary-btn cursor-pointer hover:scale-[1.02]'
      >
        <Plus weight='bold' /> Ajouter Un Utilisateur
      </button>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useUsersStore()

  return (
    <div className='flex gap-3'>
      <div className='relative flex-1 max-w-md'>
        <input
          type='text'
          placeholder='Rechercher un utilisateur...'
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className='bo-input'
        />
      </div>
      <div className='relative min-w-[160px]'>
        <select
          onChange={(e) => setFilters({ ...filters, role: e.target.value as Role & 'null' })}
          value={filters.role}
          className='bo-select'
        >
          <option value='null'>Tous les rôles</option>
          <option value='RECEPTIONIST'>Réceptionniste</option>
          <option value='ADMIN'>Administrateur</option>
          <option value='DOCTOR'>Médecin</option>
          <option value='PRACTITIONER'>Praticien</option>
        </select>
        <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
      </div>
    </div>
  )
}

function Table() {
  const { items, filters, fetchItems, openEditModal, openDeleteModal } = useUsersStore()
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
        <tr className='border-b border-black/[0.04]'>
          <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Utilisateur</th>
          <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</th>
          <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Rôle</th>
          <th scope='col' className='px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40 text-right'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={4} className='px-6 py-12 text-center'>
              <div className='flex flex-col items-center gap-3 text-secondary/40'>
                <div className='w-14 h-14 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
                  <User size={28} className='text-secondary/20' />
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
            <tr className='border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors' key={item.id}>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-secondary/[0.04] flex items-center justify-center'>
                    <User size={18} className='text-secondary/50' />
                  </div>
                  <div className='font-medium text-secondary'>{item.name}</div>
                </div>
              </td>
              <td className='px-6 py-4 text-secondary/60'>{item.email}</td>
              <td className='px-6 py-4'>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${roleConfig.color}`}>
                  <RoleIcon size={12} />
                  {roleConfig.label}
                </span>
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center justify-end gap-1'>
                  <button
                    onClick={() => openEditModal(item)}
                    className='p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200'
                  >
                    <Pen size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className='p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200'
                  >
                    <Trash2 size={16} />
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
  const { operation, modalOpen, closeModal, item, setItem, saveItem, clearItem, setOperation } = useUsersStore()
  const isEdit = operation === 'edit'
  const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
  const RoleIcon = roleConfig.icon
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <AnimatePresence
      onExitComplete={() => { clearItem(); setOperation('create') }}
    >
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4'>
          <motion.div
            key='user-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-secondary/30 backdrop-blur-sm'
            onClick={closeModal}
          />
          <motion.form
            key='user-form'
            onSubmit={(e) => {
              e.preventDefault()
              saveItem()
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className='relative w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
          >
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisisateur'}</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}</p>
        </div>

        <div className='p-6 space-y-5'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-14 h-14 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
              <RoleIcon size={28} className='text-secondary/50' />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom complet</label>
            <input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })}
              className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder='John Doe' />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</label>
            <input type='email' value={item.email} onChange={(e) => setItem({ ...item, email: e.target.value })}
              className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder='john.doe@example.com' />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Rôle</label>
            <div className='grid grid-cols-2 gap-3'>
              {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                const RIcon = config.icon
                return (
                  <button
                    key={role}
                    type='button'
                    onClick={() => setItem({ ...item, role: role as typeof item.role })}
                    className={clsx(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200',
                      item.role === role
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-black/[0.06] bg-white text-secondary/50 hover:border-black/[0.1]'
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
            <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Mot de passe</label>
            <input type='password' value={item.password} onChange={(e) => setItem({ ...item, password: e.target.value })}
              className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
              placeholder={isEdit ? 'Laisser vide pour ne pas changer' : '********'}
              autoComplete={isEdit ? 'new-password' : 'new-password'} />
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button'
            className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit'
            className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all duration-200'>
            {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
          </button>
        </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem, clearItem, setOperation } = useUsersStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <AnimatePresence
      onExitComplete={() => { clearItem(); setOperation('create') }}
    >
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4'>
          <motion.div
            key='user-delete-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-secondary/30 backdrop-blur-sm'
            onClick={closeModal}
          />
          <motion.form
            key='user-delete-dialog'
            onSubmit={(e) => {
              e.preventDefault()
              deleteItem()
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className='relative w-full max-w-md rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
          >
            <div className='p-6 text-center'>
              <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
                <Trash2 size={26} className='text-red-500' />
              </div>
              <h2 className='text-lg font-semibold text-secondary'>Supprimer cet utilisateur ?</h2>
              <p className='text-sm text-secondary/50 mt-2'>Cette action est irréversible. L'utilisateur sera définitivement supprimé.</p>
            </div>

            <div className='border-t border-black/[0.04] px-6 py-4 flex gap-3 justify-end'>
              <button onClick={closeModal} type='button' className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
                Annuler
              </button>
              <button type='submit' className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200'>
                Supprimer
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}
