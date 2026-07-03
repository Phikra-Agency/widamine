import api from '@/lib/api'
import { create } from 'zustand'

interface NotificationItem {
  id: number
  type: 'new_booking' | 'cancellation' | 'reminder'
  message: string
  appointmentId: number
  createdAt: string
  read: boolean
}

interface NotificationsStore {
  count: number
  items: NotificationItem[]
  loading: boolean
  lastFetchedAt: number | null
  pollInterval: ReturnType<typeof setInterval> | null
  fetch: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  markRead: (id: number) => void
  markAllRead: () => void
  resetCount: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  count: 0,
  items: [],
  loading: false,
  lastFetchedAt: null,
  pollInterval: null,

  fetch: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const res = await api.get<{ id: number; name: string; createdAt: string }[]>('appointments/queue')
      const now = Date.now()
      const last = get().lastFetchedAt ?? now
      const items: NotificationItem[] = res.data
        .filter((a) => new Date(a.createdAt).getTime() > last)
        .map((a) => ({
          id: a.id,
          type: 'new_booking' as const,
          message: `Nouvelle réservation de ${a.name}`,
          appointmentId: a.id,
          createdAt: a.createdAt,
          read: false,
        }))
      set((s) => ({
        items: [...items, ...s.items].slice(0, 50),
        count: s.count + items.length,
        lastFetchedAt: now,
        loading: false,
      }))
    } catch {
      set({ loading: false })
    }
  },

  startPolling: () => {
    const existing = get().pollInterval
    if (existing) return
    const interval = setInterval(() => get().fetch(), 30000)
    set({ pollInterval: interval })
    get().fetch()
  },

  stopPolling: () => {
    const existing = get().pollInterval
    if (existing) clearInterval(existing)
    set({ pollInterval: null })
  },

  markRead: (id) => {
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
    }))
  },

  markAllRead: () => {
    set((s) => ({
      items: s.items.map((i) => ({ ...i, read: true })),
      count: 0,
    }))
  },

  resetCount: () => set({ count: 0 }),
}))
