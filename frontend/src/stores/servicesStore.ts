import api from '@/lib/api'
import { create } from 'zustand'

interface Service {
  id?: number
  name: string
  price: number
  _count?: { sessions: number }
  category?: { category: string }
  categoryId?: number
	doctor?: { name: string }
	doctorId?: number
  allowedDoctorIds?: number[]
  allowedSalleIds?: number[]
  sessions?: { id: number; session: number; duration: number }[]
}

interface Doctor {
	id:number
	name: string
}

interface Resource {
  id: number
  name: string
}

interface ServiceStoreInterface {
  items: Service[]
  item: Service,
	doctors: Doctor[]
  resources: Resource[]
  operation: 'create' | 'edit' | 'show' | 'delete'
  modalOpen: boolean
  filters: { term: string; categoryId: number }
  setFilters: (filters: ServiceStoreInterface['filters']) => void
  setItem: (item: ServiceStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: ServiceStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  fetchDoctors: () => Promise<void>
  fetchResources: () => Promise<void>
  fetchItem: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
  saveSession: (session: { id?: number; session: number; duration: number }, editing: boolean) => Promise<void>
  deleteSession: (sessionId: number) => Promise<void>
}

export const useServicesStore = create<ServiceStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', price: 0, categoryId: undefined, doctorId: undefined, allowedDoctorIds: [], allowedSalleIds: [] },
  doctors: [],
  resources: [],
  operation: 'create' as ServiceStoreInterface['operation'],
  modalOpen: false,
  filters: { term: '', categoryId: 0 },
  setFilters(filters) {
    set({ filters })
  },
  setItem: (item) => {
    // Parse JSON strings to arrays when setting item
    const updated = {
      ...item,
      allowedDoctorIds: item.allowedDoctorIds,
      allowedSalleIds: item.allowedSalleIds,
    }
    set({ item: updated })
  },
  clearItem: () => {
    set({ item: { name: '', price: 0, categoryId: undefined, doctorId: undefined, allowedDoctorIds: [], allowedSalleIds: [] } })
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
    const res = await api.get('services')
    set({ items: res.data })
  },
  fetchDoctors: async () => {
    const res = await api.get('users/doctors')
    set({ doctors: res.data })
  },
  fetchResources: async () => {
    const res = await api.get('resources')
    set({ resources: res.data })
  },
  fetchItem: async () => {
    const res = await api.get('services/' + (get().item as Service).id)
    set({ item: res.data })
  },
  saveItem: async () => {
    const item = get().item
    // Convert arrays to JSON strings for API
    const payload = {
      ...item,
      allowedDoctorIds: item.allowedDoctorIds?.length ? JSON.stringify(item.allowedDoctorIds) : undefined,
      allowedSalleIds: item.allowedSalleIds?.length ? JSON.stringify(item.allowedSalleIds) : undefined,
    }
    if (get().operation === 'edit') {
      await api.put('services/' + (get().item as Service).id, payload)
    } else {
      await api.post('services', payload)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('services/' + (get().item as Service).id)
    get().fetchItems()
    get().closeModal()
  },
  saveSession: async (session: { id?: number; session: number; duration: number }, editing: boolean) => {
    const serviceId = (get().item as Service).id
    if (!serviceId) return

    if (editing) {
      await api.put(`sessions/${session.id}`, { duration: session.duration })
    } else {
      await api.post(`sessions`, { duration: session.duration, serviceId })
    }
    get().fetchItem()
  },
  deleteSession: async (sessionId: number) => {
    await api.delete(`sessions/${sessionId}`)
    get().fetchItem()
  }
}))
