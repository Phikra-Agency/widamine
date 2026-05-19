import { useContactsStore } from '@/stores/contactsStore'
import { Eye, ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle, CaretDown } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useDebounce } from 'use-debounce'
import { motion } from 'framer-motion'

export default function Contacts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className="bo-page-inner bo-section-stack">
        {/* Ambient blur circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none" />
        
        <Heading />
        <Filters />
        <div className="bo-surface">
          <Table />
        </div>
      </div>
      <ShowModal />
    </motion.div>
  )
}

function Heading() {
  return (
    <div>
      <h3 className="bo-title">Gestion Des Contacts</h3>
      <p className="bo-subtitle">Consultez et gérez les messages reçus</p>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useContactsStore()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className="bo-input"
        />
      </div>
      <div className="relative min-w-[150px]">
        <select
          value={filters.read ? '1' : '0'}
          onChange={(e) => setFilters({ ...filters, read: e.target.value === '1' })}
          className="bo-select"
        >
          <option value="0">Non lus</option>
          <option value="1">Lus</option>
        </select>
        <CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
      </div>
    </div>
  )
}

function Table() {
  const { items, filters, fetchItems, setItem, toggleOpenShowModal, readItem } = useContactsStore()
  const [filtered, setFiltered] = useState(items)
  const [debouncedFilters] = useDebounce(filters, 300)

  useEffect(() => {
    fetchItems()
  }, [filters.read])

  useEffect(() => {
    setFiltered(items.filter((i) => i.name.includes(debouncedFilters.term) || i.email.includes(debouncedFilters.term) || i.phone.includes(debouncedFilters.term)))
  }, [items, debouncedFilters])

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Contact</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Email</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Téléphone</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Message</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-secondary/40">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center">
                      <ChatCircleDots size={32} className="text-secondary/30" />
                    </div>
                    <p className="text-sm font-medium">Aucun message trouvé</p>
                    <p className="text-xs">Les messages reçus apparaîtront ici</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr className="border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors" key={item.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <span className="font-medium text-secondary">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-secondary/60">
                    <EnvelopeSimple size={14} className="text-secondary/40" />
                    <span>{item.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-secondary/60">
                    <Phone size={14} className="text-secondary/40" />
                    <span>{item.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-secondary/40 text-sm line-clamp-1 max-w-[200px] block">{item.context}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setItem(item)
                        toggleOpenShowModal()
                      }}
                      className="p-2 rounded-lg text-secondary/40 hover:text-primary hover:bg-primary/[0.08] transition-all duration-200"
                      title="Voir le message"
                    >
                      <Eye size={18} />
                    </button>
                    {!filters.read && (
                      <button
                        onClick={() => {
                          setItem(item)
                          readItem()
                        }}
                        className="p-2 rounded-lg text-secondary/40 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                        title="Marquer comme lu"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className='lg:hidden'>
        <div className='space-y-3 p-3'>
          {filtered.length === 0 ? (
            <div className='rounded-2xl border border-black/[0.06] bg-white px-4 py-10 text-center text-secondary/40'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
                  <ChatCircleDots size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucun message trouvé</p>
                <p className='text-xs'>Les messages reçus apparaîtront ici</p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className='rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0'>
                      <User size={20} className='text-primary' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-secondary truncate'>{item.name}</p>
                    </div>
                  </div>
                </div>

                <div className='mt-3 space-y-2 text-xs text-secondary/60'>
                  <div className='flex items-center gap-2'>
                    <EnvelopeSimple size={14} className='text-secondary/30 shrink-0' />
                    <span className='truncate'>{item.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone size={14} className='text-secondary/30 shrink-0' />
                    <span>{item.phone}</span>
                  </div>
                  <div className='mt-2 rounded-lg bg-secondary/[0.03] p-2.5 text-xs text-secondary/50 leading-relaxed line-clamp-2'>
                    {item.context}
                  </div>
                </div>

                <div className='mt-3 flex items-center gap-2'>
                  <button
                    onClick={() => {
                      setItem(item)
                      toggleOpenShowModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-primary hover:bg-primary/5 transition-all'
                  >
                    <Eye size={14} className='inline mr-1' /> Voir
                  </button>
                  {!filters.read && (
                    <button
                      onClick={() => {
                        setItem(item)
                        readItem()
                      }}
                      className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-emerald-600 hover:bg-emerald-50 transition-all'
                    >
                      <CheckCircle size={14} className='inline mr-1' /> Lu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function ShowModal() {
  const { openShowModal, toggleOpenShowModal, item } = useContactsStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', openShowModal ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className="absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300" onClick={toggleOpenShowModal} />
      <div onClick={(e) => e.stopPropagation()} className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300', openShowModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}>
        <div className="sticky top-0 z-10 border-b border-black/[0.06] bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-secondary">Message reçu</h2>
          <p className="text-sm text-secondary/40 mt-0.5">De la part de {item.name}</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center">
              <ChatCircleDots size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">{item.name}</h3>
              <p className="text-sm text-secondary/40">{item.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
                <EnvelopeSimple size={16} className="text-secondary/40" />
                {item.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Téléphone</label>
              <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
                <Phone size={16} className="text-secondary/40" />
                {item.phone}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Message</label>
              <div className="rounded-xl border border-black/[0.08] bg-white p-4 text-sm text-secondary min-h-[120px] max-h-[250px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{item.context}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-black/[0.06] bg-white px-6 py-4 flex justify-end">
          <button
            onClick={toggleOpenShowModal}
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
