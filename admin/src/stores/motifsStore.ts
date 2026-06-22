import api from '@/lib/api'
import { notify } from '@/lib/notify'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Motif {
  id?: string
  name: string
  duration?: number
  color?: string
  numberOfSessions?: number
  isOnlineBookable?: boolean
  requiresPractitionerChoice?: boolean
  pendingTtlHours?: number
  practitionerIds?: string[]
  practitionerAssignments?: { practitionerId: string }[]
}

interface MotifStoreInterface {
  items: Motif[]
  item: Motif
  lastFetchedAt: number | null
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: MotifStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: MotifStoreInterface['operation']) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

const MOTIFS_STALE_MS = 5 * 60 * 1000

export const useMotifsStore = create<MotifStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: { name: '', duration: 30, color: getRandomMotifColor(), numberOfSessions: 1, isOnlineBookable: false, requiresPractitionerChoice: false, pendingTtlHours: 24, practitionerIds: [] },
      lastFetchedAt: null,
      operation: 'create' as MotifStoreInterface['operation'],
      modalOpen: false,
      setItem: (item: Motif) => {
        const practitionerIds = item.practitionerIds
          ?? (item.practitionerAssignments
            ? item.practitionerAssignments.map(a => a.practitionerId)
            : []);
        const { practitionerAssignments, ...clean } = item;
        set({ item: { ...clean, practitionerIds } });
      },
      clearItem: () => set({ item: { name: '', duration: 30, color: getRandomMotifColor(), numberOfSessions: 1, isOnlineBookable: false, requiresPractitionerChoice: false, pendingTtlHours: 24, practitionerIds: [] } }),
      openModal: () => set({ modalOpen: true }),
      closeModal: () => {
        set({ modalOpen: false })
      },
      setOperation: (operation) => set({ operation }),
      fetchItems: async () => {
        const { items, lastFetchedAt } = get()
        const isFresh = items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < MOTIFS_STALE_MS
        if (isFresh) return

        const res = await api.get('motifs')
        set({ items: res.data, lastFetchedAt: Date.now() })
      },
      saveItem: async () => {
        const { item, operation } = get();
        const isEdit = operation === 'edit'
        const color = normalizeMotifColor(item.color) ?? getRandomMotifColor()
        const payload = {
          ...item,
          color,
          practitionerIds: item.practitionerIds || [],
        };

        if (isEdit) {
          await api.put('motifs/' + item.id, payload)
        } else {
          await api.post('motifs', payload)
        }
        notify.success(isEdit ? 'Motif modifié.' : 'Motif créé.')
        set({ lastFetchedAt: null })
        await get().fetchItems()
        get().closeModal()
      },
      deleteItem: async () => {
        await api.delete('motifs/' + (get().item as Motif).id)
        notify.success('Motif supprimé.')
        await get().fetchItems()
        get().closeModal()
      }
    }),
    {
      name: 'motifs-storage',
      partialize: (state) => ({ items: state.items, lastFetchedAt: state.lastFetchedAt }),
    }
  )
)

function normalizeMotifColor(value?: string) {
  if (!value) return null
  const trimmed = value.trim()
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return /^#[0-9A-Fa-f]{6}$/.test(prefixed) ? prefixed.toUpperCase() : null
}

function getRandomMotifColor() {
  const palette = ['#2E90C0', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#EC4899', '#0EA5E9']
  return palette[Math.floor(Math.random() * palette.length)]
}
