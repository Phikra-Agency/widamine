import api from '@/lib/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppointmentItem {
  id: string
  name: string
  status: string
  patient?: { firstName: string; lastName: string; phone: string }
  service?: { name: string }
  practitioner?: { id?: string; name: string }
  resource?: { name: string }
  motif?: { name: string; color: string }
  schedules?: { datetime: string }[]
}

interface DashboardStats {
  todayTotal: number
  todayConfirmed: number
  todayPending: number
  todayCompleted: number
  todayCancelled: number
  totalPatients: number
  currentlyRunning: AppointmentItem[]
  nextHour: AppointmentItem[]
  confirmedToday: AppointmentItem[]
  pendingConfirmations: AppointmentItem[]
  tomorrowPreview: AppointmentItem[]
}

interface StatsStore {
  stats: DashboardStats | null
  lastFetchedAt: number | null
  setStats: (stats: DashboardStats) => void
  fetchStats: (options?: { force?: boolean }) => Promise<void>
}

const STATS_STALE_MS = 60 * 1000

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: null,
      lastFetchedAt: null,
      setStats: (stats) => set({ stats, lastFetchedAt: Date.now() }),
      fetchStats: async (options) => {
        const { stats, lastFetchedAt } = get()
        const isFresh = stats && lastFetchedAt && Date.now() - lastFetchedAt < STATS_STALE_MS

        if (!options?.force && isFresh) return

        const res = await api.get('dashboard/stats')
        set({ stats: res.data, lastFetchedAt: Date.now() })
      },
    }),
    {
      name: 'stats-storage',
      partialize: (state) => ({ stats: state.stats, lastFetchedAt: state.lastFetchedAt }),
    }
  )
)
