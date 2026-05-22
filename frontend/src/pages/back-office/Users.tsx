import { useUsersStore } from '@/stores/usersStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, Crown, Stethoscope, UserCircle, CaretDown } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from 'use-debounce'
import type { Role } from '@/stores/authStore'

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Administrateur', color: 'bg-violet-50/55 text-violet-500', icon: Crown },
  DOCTOR: { label: 'Médecin', color: 'bg-emerald-50/55 text-emerald-500', icon: Stethoscope },
  RECEPTIONIST: { label: 'Réceptionniste', color: 'bg-blue-50/55 text-blue-500', icon: UserCircle },
  PRACTITIONER: { label: 'Praticien', color: 'bg-sky-50/55 text-sky-500', icon: Stethoscope },
}

export default function Users() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack h-full min-h-0 overflow-y-auto'>
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
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h3 className='bo-title'>Gestion Des Utilisateurs</h3>
        <p className='bo-subtitle'>Gérez les comptes utilisateurs et leurs rôles</p>
      </div>
      <button onClick={openCreateModal} className='bo-primary-btn hidden lg:inline-flex cursor-pointer'>
        <Plus weight='bold' /> Ajouter Un Utilisateur
      </button>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useUsersStore()

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
      <div className='relative flex-1 max-w-md'>
        <input
          type='text'
          placeholder='Rechercher un utilisateur...'
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className='w-full rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 pr-10 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] placeholder:text-secondary/35 transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'
        />
        {filters.term && (
          <button
            type='button'
            onClick={() => setFilters({ ...filters, term: '' })}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30 hover:text-secondary/60 transition-colors'
          >
            <span className='text-xs font-bold'>&times;</span>
          </button>
        )}
      </div>
      <div className='relative min-w-[160px]'>
        <select
          onChange={(e) => setFilters({ ...filters, role: e.target.value as Role & 'null' })}
          value={filters.role}
          className='w-full appearance-none rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 pr-10 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'
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
  const { items, filters, fetchItems, openEditModal, openDeleteModal, openCreateModal } = useUsersStore()
  const [filtered, setFiltered] = useState(items)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setFiltered(items.filter((i) => (i.name.includes(debouncedFilters.term) || i.email.includes(debouncedFilters.term)) && (debouncedFilters.role === 'null' || i.role === debouncedFilters.role)))
  }, [items, debouncedFilters])

  return (
    <>
      {/* Desktop table */}
      <div className='hidden lg:block overflow-x-auto'>
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
      </div>

      {/* Mobile rows */}
      <div className='lg:hidden space-y-2 p-3'>
        {filtered.length === 0 ? (
          <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-black/[0.06] px-6 py-14 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/[0.04]'>
              <User size={28} className='text-secondary/20' />
            </div>
            <div>
              <p className='text-sm font-medium text-secondary'>Aucun utilisateur trouvé</p>
              <p className='mt-1 text-xs text-secondary/40'>Ajoutez un utilisateur pour commencer</p>
            </div>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
            const RoleIcon = roleConfig.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
                className='flex items-center gap-3 rounded-xl border border-black/[0.04] bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/[0.04]'>
                  <User size={16} className='text-secondary/40' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='truncate text-sm font-semibold text-secondary'>{item.name}</p>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${roleConfig.color}`}>
                      <RoleIcon size={9} />
                      {roleConfig.label}
                    </span>
                  </div>
                  <p className='mt-0.5 truncate text-[11px] text-secondary/50'>{item.email}</p>
                </div>
                <div className='flex shrink-0 items-center gap-0.5'>
                  <button
                    type='button'
                    onClick={() => openEditModal(item)}
                    className='flex h-9 w-9 items-center justify-center rounded-lg text-secondary/30 transition-all hover:bg-amber-50 hover:text-amber-600'
                    aria-label='Modifier'
                  >
                    <Pen size={14} />
                  </button>
                  <button
                    type='button'
                    onClick={() => openDeleteModal(item)}
                    className='flex h-9 w-9 items-center justify-center rounded-lg text-secondary/30 transition-all hover:bg-red-50 hover:text-red-600'
                    aria-label='Supprimer'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
        <button
          type='button'
          onClick={openCreateModal}
          className='bo-fab'
          aria-label='Ajouter un utilisateur'
        >
          <Plus size={22} weight='bold' />
        </button>
      </div>
    </>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = useUsersStore()
  const isEdit = operation === 'edit'
  const roleConfig = ROLE_CONFIG[item.role] || ROLE_CONFIG.RECEPTIONIST
  const RoleIcon = roleConfig.icon
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center px-3 py-6 sm:px-4 sm:py-8'>
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
            className='relative w-full max-w-md max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
          >
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-5 py-3.5 sm:px-6 sm:py-4'>
          <h2 className='text-base font-semibold text-secondary sm:text-lg'>{isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</h2>
          <p className='mt-0.5 text-xs text-secondary/50 sm:text-sm'>{isEdit ? "Modifiez les informations de l'utilisateur" : 'Créez un nouveau compte utilisateur'}</p>
        </div>

        <div className='space-y-5 p-5 sm:p-6'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/[0.04]'>
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
            <div className='grid grid-cols-2 gap-2 sm:gap-3'>
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
                    <span className='text-center text-xs font-medium leading-tight'>{config.label}</span>
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

        <div className='sticky bottom-0 flex justify-end gap-3 border-t border-black/[0.04] bg-white px-5 py-3.5 sm:px-6 sm:py-4'>
          <button onClick={closeModal} type='button'
            className='rounded-lg px-4 py-2.5 text-sm font-medium text-secondary/60 transition-all duration-200 hover:text-secondary hover:bg-secondary/5'>
            Annuler
          </button>
          <button type='submit'
            className='rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/10 transition-all duration-200 hover:bg-primary/90'>
            {isEdit ? 'Enregistrer' : "Créer l'utilisateur"}
          </button>
        </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = useUsersStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center px-3 py-6 sm:px-4 sm:py-8'>
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
            <div className='p-5 text-center sm:p-6'>
              <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50'>
                <Trash2 size={26} className='text-red-500' />
              </div>
              <h2 className='text-base font-semibold text-secondary sm:text-lg'>Supprimer cet utilisateur ?</h2>
              <p className='mt-2 text-xs text-secondary/50 sm:text-sm'>Cette action est irréversible. L'utilisateur sera définitivement supprimé.</p>
            </div>

            <div className='flex justify-end gap-3 border-t border-black/[0.04] px-5 py-3.5 sm:px-6 sm:py-4'>
              <button onClick={closeModal} type='button' className='rounded-lg px-4 py-2.5 text-sm font-medium text-secondary/60 transition-all duration-200 hover:text-secondary hover:bg-secondary/5'>
                Annuler
              </button>
              <button type='submit' className='rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/25'>
                Supprimer
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}
