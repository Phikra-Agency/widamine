import { create } from 'zustand'

interface BmiResult {
  bmi: number
  category: string
  gender: 'FEMME' | 'HOMME'
  age: number
}

interface BmiPopupStore {
  isOpen: boolean
  result: BmiResult | null
  open: () => void
  close: () => void
  setResult: (result: BmiResult) => void
  clearResult: () => void
}

export const useBmiPopupStore = create<BmiPopupStore>((set) => ({
  isOpen: false,
  result: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}))
