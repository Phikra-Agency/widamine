import api from '@/lib/api'
import { create } from 'zustand'

interface Resource {
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

export const useResourcesStore = create<ResourceStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', priority: 1, motifIds: [] },
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
    const res = await api.get('resources')
    set({ items: res.data })
  },
  saveItem: async () => {
    const { item, operation } = get()
    if (operation === 'edit') {
      await api.put('resources/' + item.id, item)
    } else {
      await api.post('resources', item)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('resources/' + get().item.id)
    get().fetchItems()
    get().closeModal()
  }
}))