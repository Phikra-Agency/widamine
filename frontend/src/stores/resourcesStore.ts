import api from '@/lib/api'
import { create } from 'zustand'

interface Resource {
  id?: number
  name: string
}

interface ResourceStoreInterface {
  items: Resource[]
  item: Resource
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: ResourceStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: ResourceStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

export const useResourcesStore = create<ResourceStoreInterface>((set, get) => ({
  items: [],
  item: { name: '' },
  operation: 'create' as ResourceStoreInterface['operation'],
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
    const res = await api.get('resources')
    set({ items: res.data })
  },
  saveItem: async () => {
    if (get().operation === 'edit') {
      await api.put('resources/' + (get().item as Resource).id, get().item)
    } else {
      await api.post('resources', get().item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('resources/' + (get().item as Resource).id)
    get().fetchItems()
    get().closeModal()
  }
}))