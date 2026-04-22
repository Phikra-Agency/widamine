import { useContactsStore } from '@/stores/contactsStore'
import { Eye, ChatCircleDots, EnvelopeSimple, Phone, User, CheckCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useDebounce } from 'use-debounce'
import { motion } from 'framer-motion'

export default function Contacts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className='h-full'
    >
      <div className="space-y-5 relative">
        <Heading />
        <Filters />
        <div className="relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-white/60 shadow-[0_20px_60px_rgba(10,31,47,0.08)] backdrop-blur-xl">
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
      <h3 className="font-semibold text-2xl text-secondary tracking-tight">Gestion Des Contacts</h3>
      <p className="text-sm text-secondary/60 mt-1">Consultez et gérez les messages reçus</p>
    </div>
  )
}

function Filters() {
  const { filters, setFilters } = useContactsStore()

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={filters.term}
          onChange={(e) => setFilters({ ...filters, term: e.target.value })}
          className="w-full bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm transition-all"
        />
      </div>
      <select
        value={filters.read ? '1' : '0'}
        onChange={(e) => setFilters({ ...filters, read: e.target.value === '1' })}
        className="bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm cursor-pointer min-w-[150px]"
      >
        <option value="0">Non lus</option>
        <option value="1">Lus</option>
      </select>
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
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-secondary/10">
          <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Contact</th>
          <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Email</th>
          <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Téléphone</th>
          <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Message</th>
          <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 && (
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-3 text-secondary/50">
                <div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center">
                  <ChatCircleDots size={32} className="text-secondary/30" />
                </div>
                <p className="text-sm font-medium">Aucun message trouvé</p>
                <p className="text-xs">Les messages reçus apparaîtront ici</p>
              </div>
            </td>
          </tr>
        )}
        {filtered.map((item) => (
          <tr className="border-b border-secondary/5 hover:bg-white/40 transition-colors" key={item.id}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <span className="font-medium text-secondary">{item.name}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-secondary/70">
                <EnvelopeSimple size={14} className="text-secondary/40" />
                <span>{item.email}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-secondary/70">
                <Phone size={14} className="text-secondary/40" />
                <span>{item.phone}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-secondary/60 text-sm line-clamp-1 max-w-[200px] block">{item.context}</span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setItem(item)
                    toggleOpenShowModal()
                  }}
                  className="p-2 rounded-lg text-secondary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200"
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
                    className="p-2 rounded-lg text-secondary/60 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
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
  )
}

function ShowModal() {
  const { openShowModal, toggleOpenShowModal, item } = useContactsStore()
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4', openShowModal ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
      <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300" onClick={toggleOpenShowModal} />
      <div className={clsx('relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300', openShowModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
        <div className="sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4">
          <h2 className="text-lg font-semibold text-secondary">Message reçu</h2>
          <p className="text-sm text-secondary/60 mt-0.5">De la part de {item.name}</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ChatCircleDots size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">{item.name}</h3>
              <p className="text-sm text-secondary/60">{item.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
                <EnvelopeSimple size={16} className="text-secondary/40" />
                {item.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Téléphone</label>
              <div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
                <Phone size={16} className="text-secondary/40" />
                {item.phone}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Message</label>
              <div className="rounded-xl border border-secondary/10 bg-white/80 p-4 text-sm text-secondary min-h-[120px] max-h-[250px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{item.context}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex justify-end">
          <button
            onClick={toggleOpenShowModal}
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
