import api from '@/lib/api'
import { create } from 'zustand'

type Gender = 'MALE' | 'FEMALE' | 'OTHER'

interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: Gender
  address: string
  city: string
  postalCode: string
  country: string
  medicalHistory?: string
  createdAt: string
  updatedAt: string
}

interface PatientStoreInterface {
  items: Patient[]
  item: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  filters: { term: string }
  setFilters: (filters: PatientStoreInterface['filters']) => void
  setItem: (item: PatientStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: PatientStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

export const usePatientStore = create<PatientStoreInterface>((set, get) => ({
  items: [],
  item: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    medicalHistory: '',
  },
  operation: 'create' as PatientStoreInterface['operation'],
  modalOpen: false,
  filters: { term: '' },
  setFilters(filters) {
    set({ filters })
  },
  setItem: (item) => {
    set({ item: item })
  },
  clearItem: () => {
    set({
      item: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        medicalHistory: '',
      },
    })
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
    const res = await api.get('patients')
    set({ items: res.data })
  },
  saveItem: async () => {
    if (get().operation === 'edit') {
      await api.put('patients/' + (get().item as any).id, get().item)
    } else {
      await api.post('patients', get().item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('patients/' + (get().item as any).id)
    get().fetchItems()
    get().closeModal()
  },
}))
