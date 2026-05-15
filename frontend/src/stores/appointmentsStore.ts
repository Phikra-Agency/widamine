import api from '@/lib/api'
import { create } from 'zustand'

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

export const useAppointmentsStore = create<AppointmentStoreInterface>((set, get) => ({
  items: [],
  item: {} as Appointment,
  filters: { term: '', status: '' },
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
    const res = await api.get('appointments')
    set({ items: res.data })
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

      await get().fetchItem(appointment.id)
    } finally {
      set({ savingScheduleSessionId: null })
    }
  },
}))
