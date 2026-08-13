import api from '@/lib/api'
import { create } from 'zustand'

interface NotificationItem {
  id: string | number
  type: 'new_booking' | 'new_contact' | 'cancellation' | 'reminder'
  message: string
  appointmentId?: number
  contactId?: string
  createdAt: string
  read: boolean
}

type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PRACTITIONER'

interface NotificationsStore {
  count: number
  items: NotificationItem[]
  loading: boolean
  inAppEnabled: boolean
  inAppConfirmation: boolean
  lastFetchedAt: number | null
  pollInterval: ReturnType<typeof setInterval> | null
  userRole: UserRole | null
  setUserRole: (role: UserRole | null) => void
  fetchSettings: () => Promise<void>
  fetch: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  markRead: (id: string | number) => void
  markAllRead: () => void
  resetCount: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  count: 0,
  items: [],
  loading: false,
  inAppEnabled: true,
  inAppConfirmation: true,
  lastFetchedAt: null,
  pollInterval: null,
  userRole: null,

  setUserRole: (role) => {
    set({ userRole: role })
    // Fetch settings only once for ADMIN users
    if (role === 'ADMIN') {
      get().fetchSettings()
    }
  },

  fetchSettings: async () => {
    try {
      const settingsRes = await api.get<{ inAppEnabled?: boolean; inAppTypes?: { confirmation?: boolean } }>('settings/notifications')
      const inAppEnabled = settingsRes.data.inAppEnabled ?? true
      const inAppConfirmation = settingsRes.data.inAppTypes?.confirmation ?? true
      set({ inAppEnabled, inAppConfirmation })
    } catch (err) {
      // Silently use defaults if settings fetch fails
    }
  },

  fetch: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      // ponytail: in-app channel gated by settings; reminder/cancellation have no in-app surface yet
      if (!get().inAppEnabled || !get().inAppConfirmation) {
        set({ count: 0, items: [], lastFetchedAt: Date.now(), loading: false })
        return
      }

      const now = Date.now()
      const last = get().lastFetchedAt ?? now
      const role = get().userRole

      const appointmentItems: NotificationItem[] = []
      const contactItems: NotificationItem[] = []

      // Only ADMIN and RECEPTIONIST can access appointments queue
      if (role === 'ADMIN' || role === 'RECEPTIONIST') {
        try {
          const appointmentsRes = await api.get<{ id: number; name: string; createdAt: string }[]>('appointments/queue')
          appointmentItems.push(
            ...appointmentsRes.data
              .filter((a) => new Date(a.createdAt).getTime() > last)
              .map((a) => ({
                id: `appointment-${a.id}`,
                type: 'new_booking' as const,
                message: `Nouvelle réservation de ${a.name}`,
                appointmentId: a.id,
                createdAt: a.createdAt,
                read: false,
              }))
          )
        } catch (err: any) {
          // Silently ignore 403 - role might have changed
          if (err?.response?.status !== 403) {
            console.error('[Notifications] ❌ Error fetching appointments:', err)
          }
        }
      }

      // All roles can access contacts
      try {
        const contactsRes = await api.get<{ id: string; name: string; email: string; createdAt: string }[]>('contacts?read=false')
        contactItems.push(
          ...contactsRes.data
            .filter((c) => new Date(c.createdAt).getTime() > last)
            .map((c) => ({
              id: `contact-${c.id}`,
              type: 'new_contact' as const,
              message: `Nouveau message de ${c.name} (${c.email})`,
              contactId: c.id,
              createdAt: c.createdAt,
              read: false,
            }))
        )
      } catch (err: any) {
        console.error('[Notifications] ❌ Error fetching contacts:', err)
      }

      const allItems = [...appointmentItems, ...contactItems]
      
      set((s) => ({
        items: [...allItems, ...s.items].slice(0, 50),
        count: s.count + allItems.length,
        lastFetchedAt: now,
        loading: false,
      }))
      
      console.log(`[Notifications] 🔔 Fetched ${appointmentItems.length} new appointments, ${contactItems.length} new contacts`)
    } catch (err) {
      console.error('[Notifications] ❌ Error fetching:', err)
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
      items: s.items.map((i) => (i.id === id || String(i.id) === String(id) ? { ...i, read: true } : i)),
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
