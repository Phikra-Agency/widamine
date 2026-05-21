import api from '@/lib/api'
import { create } from 'zustand'

interface Motif {
  id?: string
  name: string
  duration?: number
  practitionerIds?: string[]
  practitionerAssignments?: { practitionerId: string }[]
}

interface MotifStoreInterface {
  items: Motif[]
  item: Motif
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

export const useMotifsStore = create<MotifStoreInterface>((set, get) => ({
  items: [],
  item: { name: '', duration: 30, practitionerIds: [] },
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
  clearItem: () => set({ item: { name: '', duration: 30, practitionerIds: [] } }),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => {
    set({ modalOpen: false })
  },
  setOperation: (operation) => set({ operation }),
  fetchItems: async () => {
    const res = await api.get('motifs')
    set({ items: res.data })
  },
  saveItem: async () => {
    const { item, operation } = get();
    // Ensure we send practitionerIds to backend
    const payload = {
      ...item,
      practitionerIds: item.practitionerIds || [],
    };
    
    if (operation === 'edit') {
      await api.put('motifs/' + item.id, payload)
    } else {
      await api.post('motifs', payload)
    }
    get().fetchItems()
    get().closeModal()
  },
  deleteItem: async () => {
    await api.delete('motifs/' + (get().item as Motif).id)
    get().fetchItems()
    get().closeModal()
  }
}))