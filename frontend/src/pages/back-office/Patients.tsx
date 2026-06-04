import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useSchedulesStore } from '@/stores/schedulesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, EnvelopeSimple, Phone, MapPin, CalendarBlank, MagnifyingGlass, CaretDown, X, ArrowRight, CalendarDots as CalendarClock } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  buildCalendarReturnUrl,
  buildCalendarUrlFromAppointment,
  clearCalendarReturnContext,
  normalizeAppointmentId,
  readCalendarReturnContext,
  stashAppointmentForCalendarOpen,
} from '@/lib/scheduleNavigation'
import { useDebounce } from 'use-debounce'
import Pagination from '@/components/Pagination'

const GENDER_CONFIG: Record<string, { label: string; color: string }> = {
  MALE: { label: 'Homme', color: 'bg-blue-50 text-blue-600' },
  FEMALE: { label: 'Femme', color: 'bg-pink-50 text-pink-600' },
  OTHER: { label: 'Autre', color: 'bg-gray-50 text-gray-600' },
}

function getAppointmentStats(patient: any) {
  const now = new Date().getTime()
  const appts = patient?.appointments || []
  const count = appts.length

  let nextDate: Date | null = null
  let lastDate: Date | null = null

  for (const appt of appts) {
    const schedule = appt.schedules?.[0]
    if (!schedule?.datetime) continue
    const dt = new Date(schedule.datetime).getTime()
    if (dt >= now && (!nextDate || dt < nextDate.getTime())) {
      nextDate = new Date(schedule.datetime)
    }
    if (dt < now && (!lastDate || dt > lastDate.getTime())) {
      lastDate = new Date(schedule.datetime)
    }
  }

  return { count, nextDate, lastDate }
}

export default function Patients() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPatient, setDrawerPatient] = useState<any>(null)
  const items = usePatientStore(state => state.items)
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)

  const openDrawer = useCallback((patient: any) => {
    setDrawerPatient(patient)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setDrawerPatient(null)
  }, [])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (!patientId || hasOpenedFromUrl.current) return
    if (items.length === 0) return
    hasOpenedFromUrl.current = true
    const patient = items.find(item => String(item.id) === patientId)
    if (patient) openDrawer(patient)
  }, [searchParams, items, openDrawer])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner bo-page-stack'>
        {/* Ambient background */}
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/4 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/3 blur-3xl' />

        <div className='bo-section-stack flex-shrink-0'>
          <Heading />
          <Filters />
        </div>
        <div className='bo-surface mt-0 flex-1 min-h-0 flex flex-col'>
          <Table openDrawer={openDrawer} />
        </div>
      </div>
      <Modal />
      <DeleteModal />
      <PatientDrawer open={drawerOpen} patient={drawerPatient} onClose={closeDrawer} />
    </motion.div>
  )
}

function Heading() {
  const { openCreateModal } = usePatientStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h3 className='bo-title'>Gestion Des Patients</h3>
        <p className='bo-subtitle'>Gérez les dossiers de vos patients</p>
      </div>
      {!isPractitioner && (
        <button
          onClick={openCreateModal}
          className='bo-primary-btn hidden lg:inline-flex cursor-pointer hover:scale-[1.02]'
        >
          <Plus weight='bold' /> Ajouter Un Patient
        </button>
      )}
    </div>
  )
}

function Filters() {
  const { filters, setFilters, items } = usePatientStore()
  const cities = useMemo(() => {
    const norm = (s: string) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase()
    const map = new Map<string, string>()
    items.forEach(i => {
      if (!i.city) return
      const key = i.city.trim().toLowerCase()
      map.set(key, norm(i.city))
    })
    return [...map.values()].sort()
  }, [items])
  const [showExtra, setShowExtra] = useState(false)

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1 min-w-0'>
          <MagnifyingGlass size={15} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/30' />
          <input
            type='text'
            placeholder='Rechercher par nom ou email...'
            value={filters.term}
            onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            className='w-full rounded-xl border border-black/[0.06] bg-white pl-10 pr-4 py-2.5 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] placeholder:text-secondary/35 transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>
        <button
          type='button'
          onClick={() => setShowExtra(!showExtra)}
          className='shrink-0 h-[42px] px-3 rounded-lg border border-black/[0.06] text-secondary/40 hover:text-secondary hover:bg-secondary/5 transition-all lg:hidden'
          aria-label='Filtres supplémentaires'
        >
          <CaretDown size={14} className={`transition-transform ${showExtra ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className={`flex-col gap-2 sm:flex-row sm:flex-wrap ${showExtra ? 'flex' : 'hidden lg:flex'}`}>
        <div className='relative flex-1 min-w-[140px]'>
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className='w-full appearance-none rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 pr-10 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'
          >
            <option value=''>Tous les genres</option>
            <option value='MALE'>Homme</option>
            <option value='FEMALE'>Femme</option>
            <option value='OTHER'>Autre</option>
          </select>
          <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
        </div>
        <div className='relative flex-1 min-w-[140px]'>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className='w-full appearance-none rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 pr-10 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'
          >
            <option value='null'>Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 10

function Table({ openDrawer }: { openDrawer: (patient: any) => void }) {
  const { items, filters, fetchItems, openEditModal, openDeleteModal, openCreateModal } = usePatientStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const term = debouncedFilters.term.toLowerCase()
      const matchesTerm = !term ||
        i.firstName.toLowerCase().includes(term) ||
        i.lastName.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term)
      const matchesGender = !debouncedFilters.gender || i.gender === debouncedFilters.gender
      const matchesCity = debouncedFilters.city === 'null' || !debouncedFilters.city || i.city === debouncedFilters.city
      return matchesTerm && matchesGender && matchesCity
    })
  }, [items, debouncedFilters])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedFilters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className='flex flex-col h-full'>
      {/* Desktop table */}
      <div className='hidden flex-1 min-h-0 overflow-auto lg:block'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-black/[0.04] bg-secondary/[0.01]'>
              <th scope='col' className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Patient</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Réservations</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Prochain RDV</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-left'>Dernier RDV</th>
              <th scope='col' className='px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-black/[0.02]'>
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className='px-6 py-12 text-center'>
                  <div className='flex flex-col items-center gap-3 text-secondary/40'>
                    <p className='text-sm font-medium'>Aucun patient trouvé</p>
                    <p className='text-xs'>Ajoutez un patient pour commencer</p>
                  </div>
                </td>
              </tr>
            )}
            {paged.map((item) => {
              const genderConf = GENDER_CONFIG[item.gender] || GENDER_CONFIG.OTHER
              const stats = getAppointmentStats(item)
              return (
                <tr
                  className='group hover:bg-secondary/[0.02] transition-colors cursor-pointer'
                  key={item.id}
                  onClick={() => openDrawer(item)}
                >
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors'>
                        <User size={16} className='text-secondary/40 group-hover:text-primary transition-colors' />
                      </div>
                      <div>
                        <span className='font-semibold text-secondary block text-sm tracking-tight'>{item.firstName} {item.lastName}</span>
                        <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 border', genderConf.color, 
                          item.gender === 'MALE' ? 'border-blue-100 bg-blue-50/50' : 
                          item.gender === 'FEMALE' ? 'border-pink-100 bg-pink-50/50' : 
                          'border-gray-100 bg-gray-50/50'
                        )}>{genderConf.label}</span>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <span className='inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg text-xs font-bold bg-secondary/5 text-secondary/60 border border-black/[0.03]'>
                        {stats.count}
                      </span>
                      <span className='text-[10px] text-secondary/30 font-medium uppercase tracking-wider'>RDV</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    {stats.nextDate ? (
                      <div className='flex items-center gap-2 text-secondary/70'>
                        <div className='w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0'>
                          <CalendarClock size={14} className='text-primary' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[13px] font-medium'>{stats.nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          <span className='text-[10px] text-secondary/40 font-medium'>{stats.nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ) : (
                      <span className='text-secondary/20 text-xs font-medium'>—</span>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {stats.lastDate ? (
                      <div className='flex items-center gap-2 text-secondary/50'>
                        <div className='w-7 h-7 rounded-full bg-secondary/5 flex items-center justify-center shrink-0'>
                          <CalendarBlank size={14} className='text-secondary/40' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[13px] font-medium'>{stats.lastDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                          <span className='text-[10px] text-secondary/40 font-medium text-left'>{stats.lastDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ) : (
                      <span className='text-secondary/20 text-xs font-medium'>—</span>
                    )}
                  </td>
                  <td className='px-6 py-4' onClick={(e) => e.stopPropagation()}>
                    <div className='flex items-center justify-end gap-1'>
                      <button
                        onClick={() => openEditModal(item)}
                        className='p-2 rounded-lg text-secondary/30 hover:text-amber-600 hover:bg-amber-50 transition-all'
                      >
                        <Pen size={16} />
                      </button>
                      {!isPractitioner && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className='p-2 rounded-lg text-secondary/30 hover:text-red-600 hover:bg-red-50 transition-all'
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className='flex-1 min-h-0 overflow-auto lg:hidden'>
        {paged.length === 0 ? (
          <div className='p-3'>
            <div className='rounded-2xl border border-black/[0.06] bg-white px-4 py-10 text-center text-secondary/40'>
              <p className='text-sm font-medium'>Aucun patient trouvé</p>
              <p className='mt-1 text-xs'>Ajoutez un patient pour commencer</p>
            </div>
          </div>
        ) : (
            <div className='divide-y divide-black/[0.04] bg-white border-b border-black/[0.04]'>
            {paged.map((item) => {
              const stats = getAppointmentStats(item)
              return (
                <div
                  key={item.id}
                  onClick={() => openDrawer(item)}
                  className='flex items-center gap-2 px-3 py-3.5 active:bg-secondary/[0.02] transition-colors cursor-pointer'
                >
                  <div className='w-9 h-9 rounded-full bg-secondary/5 flex items-center justify-center shrink-0'>
                    <User size={15} className='text-secondary/40' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-secondary truncate'>{item.firstName} {item.lastName}</p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      {item.phone && (
                        <span className='text-[11px] text-secondary/50 truncate'>{item.phone}</span>
                      )}
                      {stats.nextDate && (
                        <>
                          {item.phone && <span className='text-[9px] text-secondary/30'>·</span>}
                          <span className='text-[11px] text-primary/70 shrink-0'>
                            {stats.nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center shrink-0' onClick={(e) => e.stopPropagation()}>
                    {!isPractitioner && (
                      <>
                        <button
                          type='button'
                          onClick={() => openEditModal(item)}
                          className='w-7 h-7 rounded-lg text-secondary/30 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center'
                        >
                          <Pen size={12} />
                        </button>
                        <button
                          type='button'
                          onClick={() => openDeleteModal(item)}
                          className='w-7 h-7 rounded-lg text-secondary/30 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center'
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    <div className='w-5 h-5 flex items-center justify-center text-secondary/20 ml-1'>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {/* Floating action button for mobile */}
      {!isPractitioner && (
        <button
          type='button'
          onClick={openCreateModal}
          className='bo-fab lg:hidden'
          aria-label='Ajouter un patient'
        >
          <Plus size={24} weight='bold' />
        </button>
      )}
      <div className='shrink-0 border-t border-black/[0.04] px-4 py-3 bg-white/80 backdrop-blur-sm'>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = usePatientStore()
  const isEdit = operation === 'edit'
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4'>
          <motion.div
            key='patient-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-secondary/30 backdrop-blur-sm'
            onClick={closeModal}
          />
          <motion.form
            key='patient-form'
            onSubmit={(e) => {
              e.preventDefault()
              saveItem()
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className='relative w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
          >
        <div className='sticky top-0 z-10 border-b border-black/[0.04] bg-white px-6 py-4'>
          <h2 className='text-lg font-semibold text-secondary'>{isEdit ? 'Modifier le patient' : 'Nouveau patient'}</h2>
          <p className='text-sm text-secondary/50 mt-0.5'>{isEdit ? 'Modifiez les informations du patient' : 'Ajoutez un nouveau patient'}</p>
        </div>

        <div className='p-6 space-y-6'>
          <div className='flex items-center justify-center mb-2'>
            <div className='w-14 h-14 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
              <User size={28} className='text-secondary/50' />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Prénom</label>
              <input type='text' value={item.firstName} onChange={(e) => setItem({ ...item, firstName: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Ahmed' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom</label>
              <input type='text' value={item.lastName} onChange={(e) => setItem({ ...item, lastName: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Benali' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</label>
              <input type='email' value={item.email} onChange={(e) => setItem({ ...item, email: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='ahmed@example.com' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Téléphone</label>
              <input type='text' value={item.phone} onChange={(e) => setItem({ ...item, phone: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='+212600000000' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Date de naissance</label>
              <input type='date' value={item.dateOfBirth} onChange={(e) => setItem({ ...item, dateOfBirth: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Genre</label>
              <div className='relative'>
                <select value={item.gender || ''} onChange={(e) => setItem({ ...item, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                  className='w-full appearance-none rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 pr-10 text-sm text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20'>
                  <option value='' disabled>Sélectionner</option>
                  <option value='MALE'>Homme</option>
                  <option value='FEMALE'>Femme</option>
                  <option value='OTHER'>Autre</option>
                </select>
                <CaretDown size={14} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30' />
              </div>
            </div>

            <div className='col-span-1 sm:col-span-2 space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Adresse</label>
              <input type='text' value={item.address} onChange={(e) => setItem({ ...item, address: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='123 Rue Mohammed V' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Ville</label>
              <input type='text' value={item.city} onChange={(e) => setItem({ ...item, city: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Casablanca' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Code postal</label>
              <input type='text' value={item.postalCode} onChange={(e) => setItem({ ...item, postalCode: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='20000' />
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Pays</label>
              <input type='text' value={item.country} onChange={(e) => setItem({ ...item, country: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Maroc' />
            </div>

            <div className='col-span-1 sm:col-span-2 space-y-2'>
              <label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Antécédents médicaux</label>
              <textarea value={item.medicalHistory || ''} onChange={(e) => setItem({ ...item, medicalHistory: e.target.value })}
                className='w-full rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all'
                placeholder='Notes sur les antécédents médicaux...'
                rows={3} />
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 border-t border-black/[0.04] bg-white px-6 py-4 flex gap-3 justify-end'>
          <button onClick={closeModal} type='button'
            className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
            Annuler
          </button>
          <button type='submit'
            className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 hover:shadow-lg hover:shadow-primary/12 transition-all duration-200'>
            {isEdit ? 'Enregistrer' : 'Créer le patient'}
          </button>
        </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = usePatientStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4'>
          <motion.div
            key='patient-delete-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute inset-0 bg-secondary/30 backdrop-blur-sm'
            onClick={closeModal}
          />
          <motion.div
            key='patient-delete-dialog'
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
              <h2 className='text-lg font-semibold text-secondary'>Supprimer ce patient ?</h2>
              <p className='text-sm text-secondary/50 mt-2'>Cette action est irréversible. Le patient sera définitivement supprimé.</p>
            </div>
            <div className='border-t border-black/[0.04] px-6 py-4 flex gap-3 justify-end'>
              <button onClick={closeModal} className='px-5 py-2.5 rounded-lg text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200'>
                Annuler
              </button>
              <button onClick={deleteItem} className='px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200'>
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function UpcomingAppointmentRow({
  appt,
  onOpenCalendar,
}: {
  appt: any
  onOpenCalendar: (appt: any) => void
}) {
  const hasSlot = appt._dt > 0
  const appointmentId = normalizeAppointmentId(appt)
  const isClickable = hasSlot && appointmentId && appt.status === 'CONFIRMED'

  if (!isClickable) {
    return (
      <div className='flex w-full items-center gap-3 rounded-lg bg-secondary/[0.02] px-3 py-2'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-secondary truncate'>{appt.name}</p>
          <div className='mt-0.5 flex items-center gap-2 text-[11px] text-secondary/40'>
            {appt.service && <span>{appt.service.name}</span>}
            <StatusBadge status={appt.status} />
          </div>
        </div>
        <span className='shrink-0 text-xs font-medium text-secondary/40'>—</span>
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={() => onOpenCalendar({ ...appt, id: appointmentId })}
      className='relative z-20 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-secondary/[0.02] px-3 py-2.5 text-left transition-all duration-200 hover:border-primary/20 hover:bg-primary/[0.06] hover:shadow-[0_2px_12px_rgba(46,144,192,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99]'
    >
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-secondary truncate'>{appt.name}</p>
        <div className='mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-secondary/40'>
          {appt.service && <span>{appt.service.name}</span>}
          <StatusBadge status={appt.status} />
          <span className='font-medium text-primary/70'>Voir au calendrier →</span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1.5'>
        <span className='text-xs font-semibold text-primary'>
          {new Date(appt._dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}{' '}
          {new Date(appt._dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <CalendarClock size={15} className='shrink-0 text-primary/40' />
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
        status === 'CONFIRMED'
          ? 'bg-emerald-50 text-emerald-600'
          : status === 'PENDING'
            ? 'bg-amber-50 text-amber-600'
            : status === 'CANCELLED'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-secondary/[0.04] text-secondary/40',
      )}
    >
      {status === 'CONFIRMED'
        ? 'Confirmé'
        : status === 'PENDING'
          ? 'En attente'
          : status === 'CANCELLED'
            ? 'Annulé'
            : status || '—'}
    </span>
  )
}

function PatientDrawer({ open, patient, onClose }: { open: boolean; patient: any; onClose: () => void }) {
  const { openEditModal } = usePatientStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const openAppointmentFromPatientDrawer = useSchedulesStore(state => state.openAppointmentFromPatientDrawer)
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const calendarReturn = useMemo(() => (open ? readCalendarReturnContext() : null), [open])
  const calendarTo = calendarReturn ? buildCalendarReturnUrl(calendarReturn) : '/back-office/calendar'

  const openOnCalendar = useCallback(
    (appt: any) => {
      const appointmentId = normalizeAppointmentId(appt)
      if (!appointmentId || !appt._dt) return

      const payload = { ...appt, id: appointmentId }
      clearCalendarReturnContext()
      stashAppointmentForCalendarOpen(payload)

      const opened = openAppointmentFromPatientDrawer(payload)
      if (!opened) return

      onClose()
      navigate('/back-office/calendar')
    },
    [navigate, onClose, openAppointmentFromPatientDrawer],
  )

  const appts = useMemo(() => {
    if (!patient?.appointments) return { upcoming: [], past: [] }
    const now = new Date().getTime()
    const list = patient.appointments.map((a: any) => {
      const dt = a.schedules?.[0]?.datetime ? new Date(a.schedules[0].datetime).getTime() : 0
      return { ...a, _dt: dt }
    }).sort((a: any, b: any) => b._dt - a._dt)
    return {
      upcoming: list.filter((a: any) => a._dt >= now),
      past: list.filter((a: any) => a._dt < now),
    }
  }, [patient])

  const drawerMotion = {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18 },
    },
    panel: {
      initial: { x: 24, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 24, opacity: 0 },
      transition: { type: 'spring' as const, damping: 28, stiffness: 360 },
    },
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && patient && (
        <div className='fixed inset-0 z-[120] flex'>
          <motion.button
            type='button'
            aria-label='Fermer le dossier patient'
            {...drawerMotion.overlay}
            className='min-w-0 flex-1 border-0 bg-black/25 p-0'
            onClick={onClose}
          />

          <motion.aside
            {...drawerMotion.panel}
            className='relative z-[121] flex h-full w-full max-w-[520px] shrink-0 flex-col border-l border-black/[0.06] bg-white shadow-[-8px_0_32px_rgba(26,54,70,0.08)]'
          >
            <div className='shrink-0 px-5 py-4 border-b border-black/[0.06] flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-secondary/40'>Dossier patient</p>
                <p className='text-base font-medium text-secondary truncate'>
                  {patient.firstName} {patient.lastName}
                </p>
                <div className='flex items-center gap-2 mt-0.5'>
                  <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', (GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).color)}>
                    {(GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).label}
                  </span>
                  {patient.dateOfBirth && (
                    <span className='text-xs text-secondary/50'>
                      Né(e) le {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className='shrink-0 w-9 h-9 rounded-lg border border-black/[0.06] flex items-center justify-center hover:bg-secondary/[0.02] transition-colors'
              >
                <X size={16} className='text-secondary/60' />
              </button>
            </div>

            <div className='flex-1 min-h-0 overflow-auto px-4 py-3 space-y-3 sm:px-5 sm:py-4 sm:space-y-4'>
              {/* Contact */}
              <div className='rounded-xl border border-black/[0.06] p-4 space-y-2'>
                <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Contact</p>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><EnvelopeSimple size={12} /> Email</span>
                  <span className='text-xs text-secondary/70'>{patient.email || '—'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><Phone size={12} /> Téléphone</span>
                  <span className='text-xs text-secondary/70'>{patient.phone || '—'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><MapPin size={12} /> Adresse</span>
                  <span className='text-xs text-secondary/70 text-right truncate max-w-[55%]'>{[patient.address, patient.city, patient.postalCode, patient.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
              </div>

              {/* Medical history */}
              {patient.medicalHistory && (
                <div className='rounded-xl border border-black/[0.06] p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Antécédents médicaux</p>
                  <p className='text-sm text-secondary/70 leading-relaxed'>{patient.medicalHistory}</p>
                </div>
              )}

              {/* Upcoming appointments */}
              {appts.upcoming.length > 0 && (
                <div className='rounded-xl border border-black/[0.06] p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Rendez-vous à venir ({appts.upcoming.length})</p>
                  <div className='space-y-2'>
                    {appts.upcoming.map((a: any) => (
                      <UpcomingAppointmentRow
                        key={normalizeAppointmentId(a) ?? `upcoming-${a._dt}-${a.name}`}
                        appt={a}
                        onOpenCalendar={openOnCalendar}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past appointments */}
              {appts.past.length > 0 && (
                <div className='rounded-xl border border-black/[0.06] p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Historique ({appts.past.length})</p>
                  <div className='space-y-2'>
                    {appts.past.slice(0, 8).map((a: any) => (
                      <UpcomingAppointmentRow
                        key={normalizeAppointmentId(a) ?? `past-${a._dt}-${a.name}`}
                        appt={a}
                        onOpenCalendar={openOnCalendar}
                      />
                    ))}
                    {appts.past.length > 8 && (
                      <p className='text-xs text-secondary/40 text-center pt-1'>+ {appts.past.length - 8} résultats précédents</p>
                    )}
                  </div>
                </div>
              )}

              {appts.upcoming.length === 0 && appts.past.length === 0 && (
                <div className='rounded-xl border border-black/[0.06] p-6 text-center'>
                  <p className='text-sm text-secondary/40'>Aucun rendez-vous lié à ce patient</p>
                </div>
              )}

              {/* Actions */}
              <div className='pt-2 flex items-center gap-2'>
                {!isPractitioner && (
                  <button
                    onClick={() => { onClose(); openEditModal(patient); }}
                    className='flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors'
                  >
                    Modifier
                  </button>
                )}
                <Link
                  to={calendarTo}
                  className={clsx(
                    'flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                    calendarReturn
                      ? 'border-primary/20 bg-primary/[0.04] text-primary hover:bg-primary/[0.08]'
                      : 'border-black/[0.06] text-secondary hover:bg-secondary/[0.02]',
                  )}
                >
                  {calendarReturn ? 'Retour au créneau' : 'Calendrier'} <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
