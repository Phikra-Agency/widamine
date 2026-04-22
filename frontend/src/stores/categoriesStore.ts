import api from '@/lib/api'
import { create } from 'zustand'

interface Category {
  id: number
  category: string
  _count?: { services: number }
}

interface CategoryStoreInterface {
  items: Category[]
  item: Category | Omit<Category, 'id'>
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: CategoryStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: CategoryStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

export const useCategoriesStore = create<CategoryStoreInterface>((set, get) => ({
  items: [],
  item: { category: '' },
  operation: 'create' as CategoryStoreInterface['operation'],
  modalOpen: false,
  setItem: (item) => {
    set({ item: item })
  },
  clearItem: () => {
    set({ item: { category: '' } })
  },
  openModal: () => {
    set({ modalOpen: true })
  },
  closeModal: () => {
    set({ modalOpen: false })
    setTimeout(()=>{
      get().clearItem()
    },300)
  },
  setOperation: (operation) => {
    set({ operation })
  },
  fetchItems: async () => {
    const res = await api.get('categories')
    set({ items: res.data })
  },
  saveItem: async () => {
    if (get().operation === 'edit') {
      await api.put('categories/' + (get().item as Category).id, get().item)
    } else {
      await api.post('categories', get().item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('categories/' + (get().item as Category).id)
    get().fetchItems()
    get().closeModal()
  }
}))
