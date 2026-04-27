import api from '@/lib/api'
import { formatLocalDate } from '@/lib/date'
import { create } from 'zustand'

interface Schedule {
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
    status: string
    practitionerId?: string
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
  openShowModal: boolean
  setFetchedDate:(fetchedDate:string)=>void
  setItem: (item: Schedule) => void
  toggleOpenShowModal: () => void
  setFilters: (filters: ScheduleStoreInterface['filters']) => void
  fetchItems: (date: string) => Promise<void>
}

export const useSchedulesStore = create<ScheduleStoreInterface>((set, get) => ({
  items: [],
  item: {} as Schedule,
  filters: { term: '', date: formatLocalDate(new Date()) },
  fetchedDate: '',
  openShowModal: false,
  setFetchedDate(fetchedDate) {
    set({fetchedDate})
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
    const res = await api.get('schedule/' + date)
    set({ items: res.data })
  }
}))
