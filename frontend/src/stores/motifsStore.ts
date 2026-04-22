import api from '@/lib/api'
import { create } from 'zustand'

interface Motif {
  id?: number
  name: string
}

interface MotifStoreInterface {
  items: Motif[]
  item: Motif
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: MotifStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: MotifStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

export const useMotifsStore = create<MotifStoreInterface>((set, get) => ({
  items: [],
  item: { name: '' },
  operation: 'create' as MotifStoreInterface['operation'],
  modalOpen: false,
  setItem: (item) => set({ item }),
  clearItem: () => set({ item: { name: '' } }),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => {
    set({ modalOpen: false })
    setTimeout(() => get().clearItem(), 300)
  },
  setOperation: (operation) => set({ operation }),
  fetchItems: async () => {
    const res = await api.get('motifs')
    set({ items: res.data })
  },
  saveItem: async () => {
    if (get().operation === 'edit') {
      await api.put('motifs/' + (get().item as Motif).id, get().item)
    } else {
      await api.post('motifs', get().item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('motifs/' + (get().item as Motif).id)
    get().fetchItems()
    get().closeModal()
  }
}))