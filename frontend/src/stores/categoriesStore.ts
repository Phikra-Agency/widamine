import api from '@/lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Category {
  id: number
  category: string
  _count?: { services: number }
}

interface CategoryStoreInterface {
  items: Category[]
  item: Category | Omit<Category, 'id'>
  lastFetchedAt: number | null
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

const CATEGORIES_STALE_MS = 5 * 60 * 1000

export const useCategoriesStore = create<CategoryStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: { category: '' },
      lastFetchedAt: null,
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
      },
      setOperation: (operation) => {
        set({ operation })
      },
      fetchItems: async () => {
        const { items, lastFetchedAt } = get()
        const isFresh = items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < CATEGORIES_STALE_MS
        if (isFresh) return

        const res = await api.get('categories')
        set({ items: res.data, lastFetchedAt: Date.now() })
      },
      saveItem: async () => {
        if (get().operation === 'edit') {
          await api.put('categories/' + (get().item as Category).id, get().item)
        } else {
          await api.post('categories', get().item)
        }
        set({ lastFetchedAt: null })
        await get().fetchItems()
        get().closeModal()
      },
      deleteItem: async () => {
        await api.delete('categories/' + (get().item as Category).id)
        set({ lastFetchedAt: null })
        await get().fetchItems()
        get().closeModal()
      }
    }),
    {
      name: 'categories-storage',
      partialize: (state) => ({ items: state.items, lastFetchedAt: state.lastFetchedAt }),
    }
  )
)
