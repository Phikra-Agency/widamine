import api from '@/lib/api'
import { create } from 'zustand'

interface User {
  id: number
  name: string
  email: string
  role: Role
}

type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST'

interface UserStoreInterface {
  items: User[]
  item: (User & { password: string }) | (Omit<User, 'id'> & { password: string })
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  filters: { term: string; role: Role | 'null' }
  setFilters: (filters: UserStoreInterface['filters']) => void
  setItem: (item: UserStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: UserStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

export const useUsersStore = create<UserStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', email: '', password: '', role: 'RECEPTIONIST' },
  operation: 'create' as UserStoreInterface['operation'],
  modalOpen: false,
  filters: { term: '', role: 'null' },
  setFilters(filters) {
    set({ filters })
  },
  setItem: (item) => {
    set({ item: item })
  },
  clearItem: () => {
    set({ item: { name: '', email: '', password: '', role: 'RECEPTIONIST' } })
  },
  openModal: () => {
    set({ modalOpen: true })
  },
  closeModal: () => {
    set({ modalOpen: false })
    setTimeout(() => {
      get().clearItem()
    }, 300)
  },
  setOperation: (operation) => {
    set({ operation })
  },
  fetchItems: async () => {
    const res = await api.get('users')
    set({ items: res.data })
  },
  saveItem: async () => {
    if (get().operation === 'edit') {
      await api.put('users/' + (get().item as User).id, get().item)
    } else {
      await api.post('users', get().item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('users/' + (get().item as User).id)
    get().fetchItems()
    get().closeModal()
  }
}))
