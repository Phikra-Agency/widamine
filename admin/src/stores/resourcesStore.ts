import api from '@/lib/api'
import { notify } from '@/lib/notify'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Resource {
  id?: string
  name: string
  priority: number
  motifIds: string[]
  motifs?: { id: string; name: string }[]
  motifAssignments?: { motifId: string }[]
}

interface ResourceStoreInterface {
  items: Resource[]
  item: Omit<Resource, 'motifs'>
  lastFetchedAt: number | null
  operation: 'create' | 'edit' | 'delete'
  modalOpen: boolean
  setItem: (item: ResourceStoreInterface['item']) => void
  clearItem: () => void
  openModal: () => void
  closeModal: () => void
  setOperation: (operation: ResourceStoreInterface['operation']) => void
  openCreateModal: () => void
  openEditModal: (resource: Resource) => void
  openDeleteModal: (resource: Resource) => void
  fetchItems: () => Promise<void>
  saveItem: () => Promise<void>
  deleteItem: () => Promise<void>
}

let _closeTimer: ReturnType<typeof setTimeout> | null = null
const RESOURCES_STALE_MS = 5 * 60 * 1000

export const useResourcesStore = create<ResourceStoreInterface>()(
  persist(
    (set, get) => ({
      items: [],
      item: { name: '', priority: 1, motifIds: [] },
      lastFetchedAt: null,
      operation: 'create' as ResourceStoreInterface['operation'],
      modalOpen: false,
      setItem: (item) => set({ item }),
      clearItem: () => set({ item: { name: '', priority: 1, motifIds: [] } }),
      openModal: () => {
        if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
        set({ modalOpen: true })
      },
      closeModal: () => {
        set({ modalOpen: false })
        _closeTimer = setTimeout(() => {
          get().clearItem()
          get().setOperation('create')
          _closeTimer = null
        }, 300)
      },
      setOperation: (operation) => set({ operation }),
      openCreateModal: () => {
        if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
        set({ operation: 'create', modalOpen: true, item: { name: '', priority: 1, motifIds: [] } })
      },
      openEditModal: (resource: Resource) => {
        if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
        const motifIds = resource.motifAssignments
          ? (resource.motifAssignments as any).map((a: any) => a.motifId)
          : resource.motifIds || [];
        set({
          operation: 'edit',
          modalOpen: true,
          item: { id: resource.id, name: resource.name, priority: resource.priority, motifIds }
        })
      },
      openDeleteModal: (resource: Resource) => {
        if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null }
        set({
          operation: 'delete',
          modalOpen: true,
          item: { id: resource.id, name: resource.name, priority: resource.priority, motifIds: resource.motifIds || [] }
        })
      },
      fetchItems: async () => {
        const { items, lastFetchedAt } = get()
        const isFresh = items.length > 0 && lastFetchedAt && Date.now() - lastFetchedAt < RESOURCES_STALE_MS
        if (isFresh) return

        const res = await api.get('resources')
        set({ items: res.data, lastFetchedAt: Date.now() })
      },
      saveItem: async () => {
        const { item, operation } = get()
        const isEdit = operation === 'edit'
        try {
          if (isEdit) {
            await api.put('resources/' + item.id, item)
          } else {
            await api.post('resources', item)
          }
          notify.success(isEdit ? 'Ressource modifiée.' : 'Ressource créée.')
          set({ lastFetchedAt: null })
          await get().fetchItems()
          get().closeModal()
        } catch {
          notify.error('Erreur lors de la sauvegarde.')
        }
      },
      deleteItem: async () => {
        try {
          await api.delete('resources/' + get().item.id)
          notify.success('Ressource supprimée.')
        } catch {
          notify.error('Erreur lors de la suppression.')
        }
        set({ lastFetchedAt: null })
        await get().fetchItems()
        get().closeModal()
      }
    }),
    {
      name: 'resources-storage',
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted: any) => ({ ...persisted, lastFetchedAt: null }),
    }
  )
)
