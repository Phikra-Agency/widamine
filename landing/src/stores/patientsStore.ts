import api from '@/lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Gender = 'MALE' | 'FEMALE' | 'OTHER'

interface PatientAppointment {
  id: string
  name: string
  status: string
  createdAt: string
  practitionerId?: string
  practitioner?: { id: string; name: string }
  service?: { name: string }
  motif?: { name: string; color: string }
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
  lastFetchedAt: number | null
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  filters: { term: string; gender: string; city: string; practitionerOnly: boolean }
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
const PATIENTS_STALE_MS = 60 * 1000

export const usePatientStore = create<PatientStoreInterface>()(
  persist(
    (set, get) => ({
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
      lastFetchedAt: null,
      operation: 'create' as PatientStoreInterface['operation'],
      modalOpen: false,
      filters: { term: '', gender: '', city: 'null', practitionerOnly: true },
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
            firstName: patient.firstName ?? '',
            lastName: patient.lastName ?? '',
            email: patient.email ?? '',
            phone: patient.phone ?? '',
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
            gender: patient.gender ?? 'MALE',
            address: patient.address ?? '',
            city: patient.city ?? '',
            postalCode: patient.postalCode ?? '',
            country: patient.country ?? 'Maroc',
            medicalHistory: patient.medicalHistory ?? '',
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
        const { items, lastFetchedAt } = get()
        const isFresh = items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < PATIENTS_STALE_MS
        if (isFresh) return

        const res = await api.get('patients')
        set({ items: res.data, lastFetchedAt: Date.now() })
      },
      saveItem: async () => {
        try {
          const raw = get().item as any
          const payload = { ...raw }
          Object.keys(payload).forEach(k => { if (payload[k] === '' || payload[k] === null) delete payload[k] })
          delete payload.id
          if (get().operation === 'edit') {
            await api.put('patients/' + (get().item as any).id, payload)
          } else {
            await api.post('patients', payload)
          }
          set({ lastFetchedAt: null })
          await get().fetchItems()
          get().closeModal()
        } catch (e: any) {
          console.error('Save failed:', e?.response?.data || e)
        }
      },
      deleteItem: async () => {
        await api.delete('patients/' + (get().item as any).id)
        set({ lastFetchedAt: null })
        await get().fetchItems()
        get().closeModal()
      },
    }),
    {
      name: 'patients-storage',
      partialize: (state) => ({
        items: state.items,
        filters: state.filters,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
