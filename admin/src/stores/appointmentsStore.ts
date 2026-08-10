import api from '@/lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Appointment {
  id?: number
  name: string
  email: string
  phone: string
  context: string
  motifId?: string
  sessionNumber?: number
  status?: string
  timezone?: string
  expiresAt?: string | null
  confirmedAt?: string | null
  motif?: {
    id?: string
    name: string
    color?: string
    duration?: number
    sessions?: { id: string; session: number; duration: number }[]
  }
  practitioner?: {
    id: number
    name: string
  } | null
  resource?: {
    id: number
    name: string
  } | null
  schedules?: {
    id: string
    datetime: string
    sessionId: string
    session?: { id: string; session: number }
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
  filters: { status: string }
  lastFetchedAt: number | null
  openShowModal: boolean
  loadingItem: boolean
  savingScheduleSessionId: string | null
  setItem: (item: Appointment) => void
  toggleOpenShowModal: () => void
  setOpenShowModal: (open: boolean) => void
  setFilters: (filters: AppointmentStoreInterface['filters']) => void
  fetchItems: () => Promise<void>
  fetchItem: (id: number) => Promise<void>
  saveScheduleDate: (payload: { sessionId: string; datetime: string }) => Promise<void>
}

const APPOINTMENTS_STALE_MS = 60 * 1000

export const useAppointmentsStore = create<AppointmentStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: {} as Appointment,
      filters: { status: '' },
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

        try {
          const res = await api.get('appointments')
          set({ items: res.data, lastFetchedAt: Date.now() })
        } catch {
          // Auth errors handled by AuthWrapper
        }
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
      version: 2,
      partialize: (state) => ({
        items: state.items,
        filters: state.filters,
      }),
      migrate: (persisted: any) => ({ ...persisted, lastFetchedAt: null }),
    }
  )
)
