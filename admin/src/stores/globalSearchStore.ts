import { create } from 'zustand'

interface GlobalSearchStore {
  term: string
  setTerm: (term: string) => void
  clearTerm: () => void
}

export const useGlobalSearchStore = create<GlobalSearchStore>((set) => ({
  term: '',
  setTerm: (term) => set({ term }),
  clearTerm: () => set({ term: '' }),
}))
