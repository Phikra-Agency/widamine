import api from '@/lib/api'
import { create } from 'zustand'
import type { Role } from '@/stores/authStore'

interface User {
  id: number
  name: string
  email: string
  role: Role
}

interface UserStoreInterface {
  items: User[]
  item: (User & { password: string }) | (Omit<User, 'id'> & { password: string })
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: UserStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: UserStoreInterface['operation']) => void
  openCreateModal: () => void
  openEditModal: (user: User) => void
  openDeleteModal: (user: User) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

let _closeTimer: ReturnType<typeof setTimeout> | null = null

export const useUsersStore = create<UserStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', email: '', password: '', role: 'RECEPTIONIST' },
  operation: 'create' as UserStoreInterface['operation'],
  modalOpen: false,
  setItem: (item) => {
    set({ item: item })
  },
  clearItem: () => {
    set({ item: { name: '', email: '', password: '', role: 'RECEPTIONIST' } })
  },
  openModal: () => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({ modalOpen: true })
  },
  closeModal: () => {
    set({ modalOpen: false })
  },
  setOperation: (operation) => {
    set({ operation })
  },
  openCreateModal: () => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({ operation: 'create', modalOpen: true, item: { name: '', email: '', password: '', role: 'RECEPTIONIST' } })
  },
  openEditModal: (user: User) => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({ operation: 'edit', modalOpen: true, item: { ...user, password: '' } })
  },
  openDeleteModal: (user: User) => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({ operation: 'delete', modalOpen: true, item: { ...user, password: '' } })
  },
  fetchItems: async () => {
    const res = await api.get('users')
    set({ items: res.data })
  },
  saveItem: async () => {
    const item = get().item
    if (get().operation === 'edit') {
      const payload = { ...item }
      if (!payload.password) delete (payload as any).password
      await api.put('users/' + (item as User).id, payload)
    } else {
      await api.post('users', item)
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
