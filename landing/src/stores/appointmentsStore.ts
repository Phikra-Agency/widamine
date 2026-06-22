import api from '@/lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Appointment {
  id?: number
  name: string
  email: string
  phone: string
  context: string
  serviceId: number
  status?: string
  timezone?: string
  expiresAt?: string | null
  confirmedAt?: string | null
  motif?: {
    name: string
    bookingType?: string
  }
  practitioner?: {
    id: number
    name: string
  } | null
  resource?: {
    id: number
    name: string
  } | null
  service?: {
    name: string
    sessions?: { id: number; session: number; duration: number }[]
  }
  schedules?: {
    id: number
    datetime: string
    sessionId: number
    session?: { id: number; session: number }
  }[]
  notifications?: {
    id: number
    channel: string
    recipientType: string
    status: string
    createdAt: string
  }[]
}

interface AppointmentStoreInterface {
  items: Appointment[]
  item: Appointment
  filters: { term: string; status: string }
  lastFetchedAt: number | null
  openShowModal: boolean
  loadingItem: boolean
  savingScheduleSessionId: number | null
  setItem: (item: Appointment) => void
  toggleOpenShowModal: () => void
  setOpenShowModal: (open: boolean) => void
  setFilters: (filters: AppointmentStoreInterface['filters']) => void
  fetchItems: () => Promise<void>
  fetchItem: (id: number) => Promise<void>
  saveScheduleDate: (payload: { sessionId: number; datetime: string }) => Promise<void>
}

const APPOINTMENTS_STALE_MS = 60 * 1000

export const useAppointmentsStore = create<AppointmentStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: {} as Appointment,
      filters: { term: '', status: '' },
      lastFetchedAt: null,
      openShowModal: false,
      loadingItem: false,
      savingScheduleSessionId: null,
      setItem: (item) => {
        set({ item })
      },
      toggleOpenShowModal() {
        set({ openShowModal: !get().openShowModal })
      },
      setOpenShowModal(open) {
        set({ openShowModal: open })
      },
      setFilters(filters) {
        set({ filters })
      },
      fetchItems: async () => {
        const { items, lastFetchedAt } = get()
        const isFresh = items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < APPOINTMENTS_STALE_MS
        if (isFresh) return

        const res = await api.get('appointments')
        set({ items: res.data, lastFetchedAt: Date.now() })
      },
      fetchItem: async (id: number) => {
        set({ loadingItem: true })
        try {
          const res = await api.get(`appointments/${id}`)
          set({ item: res.data })
        } finally {
          set({ loadingItem: false })
        }
      },
      saveScheduleDate: async ({ sessionId, datetime }) => {
        const appointment = get().item
        if (!appointment.id) return

        set({ savingScheduleSessionId: sessionId })
        try {
          const existingSchedule = appointment.schedules?.find((schedule) => schedule.sessionId === sessionId)

          if (existingSchedule) {
            await api.put(`schedule/${existingSchedule.id}`, { datetime })
          } else {
            await api.post('schedule', { datetime, sessionId, appointmentId: appointment.id })
          }

          set({ lastFetchedAt: null })
          await get().fetchItem(appointment.id)
        } finally {
          set({ savingScheduleSessionId: null })
        }
      },
    }),
    {
      name: 'appointments-storage',
      partialize: (state) => ({
        items: state.items,
        filters: state.filters,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
