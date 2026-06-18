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
  setItem: (item: Contact) => void
  toggleOpenShowModal: () => void
  setFilters: (filters: ContactStoreInterface['filters']) => void
  fetchItems: () => Promise<void>
  readItem: () => Promise<void>
}

export const useContactsStore = create<ContactStoreInterface>((set, get) => ({
  items: [],
  item: {} as Contact,
  filters: { read: false },
  openShowModal: false,
  setItem: (item) => {
    set({ item })
  },
  toggleOpenShowModal() {
    set({ openShowModal: !get().openShowModal })
  },
  setFilters(filters) {
    set({ filters })
  },
  fetchItems: async () => {
    const res = await api.get(`contacts?read=${get().filters.read ? 'true' : 'false'}`)
    set({ items: res.data })
  },
  readItem: async () => {
    await api.put('contacts/'+get().item.id+'/read')
    get().fetchItems()
  }
}))
