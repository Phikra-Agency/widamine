import api from '@/lib/api'
import { create } from 'zustand'

interface Service {
  id?: string
  name: string
  price: number
  _count?: { sessions: number }
  category?: { category: string }
  categoryId?: string
  doctor?: { name: string }
  doctorId?: string
  primaryDoctor?: { name: string }
  primaryDoctorId?: string
  allowedDoctorIds?: string[]
  allowedSalleIds?: string[]
  sessions?: { id: string; session: number; duration: number }[]
}

interface Doctor {
	id: string
	name: string
}

interface Resource {
  id: string
  name: string
}

interface ServiceStoreInterface {
  items: Service[]
  item: Service,
	doctors: Doctor[]
  resources: Resource[]
  operation: 'create' | 'edit' | 'show' | 'delete'
  modalOpen: boolean
  filters: { term: string; categoryId: string }
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
  saveSession: (session: { id?: string; session: number; duration: number }, editing: boolean) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
}

export const useServicesStore = create<ServiceStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', price: 0, categoryId: undefined, primaryDoctorId: undefined, allowedDoctorIds: [], allowedSalleIds: [] },
  doctors: [],
  resources: [],
  operation: 'create' as ServiceStoreInterface['operation'],
  modalOpen: false,
  filters: { term: '', categoryId: '' },
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
    const { doctorId, ...rest } = updated as any
    set({ item: { ...rest, primaryDoctorId: rest.primaryDoctorId || doctorId } })
  },
  clearItem: () => {
    set({ item: { name: '', price: 0, categoryId: undefined, primaryDoctorId: undefined, allowedDoctorIds: [], allowedSalleIds: [] } })
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
    const { doctorId, ...rest } = item as any
    const payload = {
      ...rest,
      primaryDoctorId: rest.primaryDoctorId || doctorId,
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
  saveSession: async (session: { id?: string; session: number; duration: number }, editing: boolean) => {
    const serviceId = (get().item as Service).id
    if (!serviceId) return

    if (editing) {
      await api.put(`sessions/${session.id}`, { duration: session.duration })
    } else {
      await api.post(`sessions`, { duration: session.duration, serviceId })
    }
    get().fetchItem()
  },
  deleteSession: async (sessionId: string) => {
    await api.delete(`sessions/${sessionId}`)
    get().fetchItem()
  }
}))
