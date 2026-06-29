import api from '@/lib/api'
import { notify } from '@/lib/notify'
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
  lastFetchedAt: number
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
  lastFetchedAt: 0,
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
    const { items, lastFetchedAt } = get()
    if (items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < 60_000) return
    const res = await api.get('users')
    set({ items: res.data, lastFetchedAt: Date.now() })
  },
  saveItem: async () => {
    const item = get().item
    const isEdit = get().operation === 'edit'
    try {
      if (isEdit) {
        const payload = { ...item }
        if (!payload.password) delete (payload as any).password
        await api.put('users/' + (item as User).id, payload)
      } else {
        await api.post('users', item)
      }
      notify.success(isEdit ? 'Utilisateur modifié.' : 'Utilisateur créé.')
      set({ lastFetchedAt: 0 })
      get().fetchItems()
      get().closeModal()
    } catch {
      notify.error('Erreur lors de la sauvegarde.')
    }
  },
  deleteItem: async () => {
    try {
      await api.delete('users/' + (get().item as User).id)
      notify.success('Utilisateur supprimé.')
    } catch {
      notify.error('Erreur lors de la suppression.')
    }
    set({ lastFetchedAt: 0 })
    get().fetchItems()
    get().closeModal()
  }
}))
