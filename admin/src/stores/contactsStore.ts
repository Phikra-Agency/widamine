import api from '@/lib/api'
import { create } from 'zustand'

interface Contact {
  id?:number
  name: string
  email: string
  phone: string
  context: string
}

interface ContactStoreInterface {
  items: Contact[]
  item: Contact
  filters: { read: boolean }
  openShowModal: boolean
  lastFetchedAt: number
  lastFilter: string
  setItem: (item: Contact) => void
  toggleOpenShowModal: () => void
  setFilters: (filters: ContactStoreInterface['filters']) => void
  fetchItems: () => Promise<void>
  readItem: () => Promise<void>
  setShowConfirm: (open: boolean) => void
  confirmOpen: boolean
  deleteItem: () => Promise<void>
}

export const useContactsStore = create<ContactStoreInterface>((set, get) => ({
  items: [],
  item: {} as Contact,
  filters: { read: false },
  openShowModal: false,
  confirmOpen: false,
  lastFetchedAt: 0,
  lastFilter: '',
  setItem: (item) => {
    set({ item })
  },
  setShowConfirm: (open) => {
    set({ confirmOpen: open })
  },
  toggleOpenShowModal() {
    set({ openShowModal: !get().openShowModal })
  },
  setFilters(filters) {
    set({ filters })
  },
  fetchItems: async () => {
    const { items, lastFetchedAt, lastFilter } = get()
    const currentFilter = get().filters.read ? 'true' : 'false'
    if (items.length > 0 && lastFetchedAt && lastFilter === currentFilter && Date.now() - lastFetchedAt < 60_000) return
    try {
      const res = await api.get(`contacts?read=${currentFilter}`)
      set({ items: res.data, lastFetchedAt: Date.now(), lastFilter: currentFilter })
    } catch {
      // Auth errors handled by AuthWrapper
    }
  },
  readItem: async () => {
    await api.put('contacts/'+get().item.id+'/read')
    set({ lastFetchedAt: 0 })
    get().fetchItems()
  },
  deleteItem: async () => {
    try {
      await api.delete('contacts/'+get().item.id)
    } finally {
      set({ confirmOpen: false, lastFetchedAt: 0, openShowModal: false })
      await get().fetchItems()
    }
  }
}))
