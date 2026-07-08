import { create } from 'zustand'

interface ContactPopupStore {
  isOpen: boolean
  open: () => void
  close: () => void
  submitted: 'contact' | null
  setSubmitted: (v: 'contact' | null) => void
}

export const useContactPopupStore = create<ContactPopupStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, submitted: null }),
  submitted: null,
  setSubmitted: (v) => set({ submitted: v }),
}))
