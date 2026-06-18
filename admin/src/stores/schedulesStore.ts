import api from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
import {
  appointmentToScheduleLike,
  getAppointmentScheduleDatetime,
  normalizeAppointmentId,
  type PendingCalendarOpen,
} from '@/lib/scheduleNavigation'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Schedule {
  id: string
  datetime: string
  session: {
    id: number
    session: number
    duration: number
    service: {
      id: number
      name: string
    }
  }
  appointment?: {
    id: string
    name?: string
    status: string
    practitionerId?: string
    patient?: {
      id: string
      firstName: string
      lastName: string
    }
    practitioner?: {
      id: string
      name: string
    }
    resource?: {
      id: string
      name: string
    }
    motif?: {
      id: string
      name: string
      color: string
      duration?: number
    }
  }
}

interface Day {
  morning: Schedule[]
  afternoon: Schedule[]
  evening: Schedule[]
}

interface ScheduleStoreInterface {
  items: Day[]
  item: Schedule
  filters: { date: string }
  fetchedDate: string
  lastFetchedAt: number | null
  openShowModal: boolean
  pendingCalendarOpen: PendingCalendarOpen | null
  setFetchedDate:(fetchedDate:string)=>void
  queueOpenFromAppointment: (appointment: {
    id?: string | number
    _id?: string
    schedules?: { id?: string; datetime?: string }[]
    _dt?: number
    [key: string]: unknown
  }) => PendingCalendarOpen | null
  openAppointmentFromPatientDrawer: (appointment: Record<string, unknown>) => boolean
  clearPendingCalendarOpen: () => void
  setItem: (item: Schedule) => void
  openShowSchedule: (item: Schedule) => void
  closeShowSchedule: () => void
  toggleOpenShowModal: () => void
  setFilters: (filters: ScheduleStoreInterface['filters']) => void
  fetchItems: (date: string, options?: { force?: boolean }) => Promise<void>
}

const SCHEDULES_STALE_MS = 60 * 1000

export const useSchedulesStore = create<ScheduleStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: {} as Schedule,
      filters: { date: formatLocalDate(new Date()) },
      fetchedDate: '',
      lastFetchedAt: null,
      openShowModal: false,
      pendingCalendarOpen: null,
      setFetchedDate(fetchedDate) {
        set({ fetchedDate })
      },
      setItem: (item) => {
        set({ item })
      },
      openShowSchedule(item) {
        set({ item, openShowModal: true })
      },
      closeShowSchedule() {
        set({ openShowModal: false })
      },
      toggleOpenShowModal() {
        set({ openShowModal: !get().openShowModal })
      },
      setFilters(filters) {
        set({ filters })
      },
      queueOpenFromAppointment(appointment) {
        const appointmentId = normalizeAppointmentId(appointment as { id?: string; _id?: string })
        const datetime = getAppointmentScheduleDatetime(appointment as { schedules?: { datetime?: string }[]; _dt?: number })
        if (!appointmentId || !datetime) return null

        const pending: PendingCalendarOpen = {
          appointmentId,
          date: formatLocalDate(new Date(datetime)),
          scheduleKey: (appointment.schedules?.[0] as { id?: string } | undefined)?.id ?? null,
        }

        set({
          pendingCalendarOpen: pending,
          filters: { ...get().filters, date: pending.date },
        })

        return pending
      },
      openAppointmentFromPatientDrawer(appointment) {
        const schedule = appointmentToScheduleLike(appointment as Parameters<typeof appointmentToScheduleLike>[0])
        if (!schedule) return false

        const pending: PendingCalendarOpen = {
          appointmentId: schedule.appointment!.id!,
          date: formatLocalDate(new Date(schedule.datetime)),
          scheduleKey: schedule.id ?? null,
        }

        set({
          pendingCalendarOpen: pending,
          filters: { ...get().filters, date: pending.date },
          item: schedule as Schedule,
          openShowModal: true,
        })

        return true
      },
      clearPendingCalendarOpen() {
        set({ pendingCalendarOpen: null })
      },
      fetchItems: async (date: string, options?: { force?: boolean }) => {
        const { fetchedDate, lastFetchedAt, items } = get()
        const isFresh =
          !options?.force &&
          fetchedDate === date &&
          items.length > 0 &&
          lastFetchedAt &&
          Date.now() - lastFetchedAt < SCHEDULES_STALE_MS

        if (isFresh) return

        const res = await api.get('schedule/' + date)
        set({ items: res.data, fetchedDate: date, lastFetchedAt: Date.now() })
      }
    }),
    {
      name: 'schedules-storage',
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
)
