import api from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
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
  filters: { term: string; date: string }
  fetchedDate: string
  lastFetchedAt: number | null
  openShowModal: boolean
  setFetchedDate:(fetchedDate:string)=>void
  setItem: (item: Schedule) => void
  toggleOpenShowModal: () => void
  setFilters: (filters: ScheduleStoreInterface['filters']) => void
  fetchItems: (date: string) => Promise<void>
}

const SCHEDULES_STALE_MS = 60 * 1000

export const useSchedulesStore = create<ScheduleStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: {} as Schedule,
      filters: { term: '', date: formatLocalDate(new Date()) },
      fetchedDate: '',
      lastFetchedAt: null,
      openShowModal: false,
      setFetchedDate(fetchedDate) {
        set({ fetchedDate })
      },
      setItem: (item) => {
        set({ item })
      },
      toggleOpenShowModal() {
        set({ openShowModal: !get().openShowModal })
      },
      setFilters(filters) {
        set({ filters })
      },
      fetchItems: async (date: string) => {
        const { fetchedDate, lastFetchedAt, items } = get()
        const isFresh =
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
        items: state.items,
        filters: state.filters,
        fetchedDate: state.fetchedDate,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
