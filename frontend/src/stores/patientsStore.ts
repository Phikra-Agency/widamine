import api from '@/lib/api'
import { create } from 'zustand'

type Gender = 'MALE' | 'FEMALE' | 'OTHER'

interface PatientAppointment {
  id: string
  name: string
  status: string
  createdAt: string
  service?: { name: string }
  schedules?: { id: string; datetime: string }[]
}

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
  appointments?: PatientAppointment[]
}

interface PatientStoreInterface {
  items: Patient[]
  item: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  filters: { term: string; gender: string; city: string }
  setFilters: (filters: PatientStoreInterface['filters']) => void
  setItem: (item: PatientStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: PatientStoreInterface['operation']) => void
  openCreateModal: () => void
  openEditModal: (patient: Patient) => void
  openDeleteModal: (patient: Patient) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

let _closeTimer: ReturnType<typeof setTimeout> | null = null

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
  filters: { term: '', gender: '', city: 'null' },
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
    set({ operation: 'create', modalOpen: true, item: {
      firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
      gender: 'MALE', address: '', city: '', postalCode: '', country: '', medicalHistory: '',
    }})
  },
  openEditModal: (patient: Patient) => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({
      operation: 'edit',
      modalOpen: true,
      item: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        postalCode: patient.postalCode,
        country: patient.country,
        medicalHistory: patient.medicalHistory || '',
        id: patient.id,
      } as any
    })
  },
  openDeleteModal: (patient: Patient) => {
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
    set({
      operation: 'delete',
      modalOpen: true,
      item: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
        city: patient.city,
        postalCode: patient.postalCode,
        country: patient.country,
        medicalHistory: patient.medicalHistory || '',
        id: patient.id,
      } as any
    })
  },
  fetchItems: async () => {
    const res = await api.get('patients')
    set({ items: res.data })
  },
  saveItem: async () => {
    const raw = get().item as any
    const payload = { ...raw }
    if (!payload.dateOfBirth) delete payload.dateOfBirth
    if (!payload.gender) delete payload.gender
    if (!payload.email) delete payload.email
    delete payload.id
    if (get().operation === 'edit') {
      await api.put('patients/' + (get().item as any).id, payload)
    } else {
      await api.post('patients', payload)
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
