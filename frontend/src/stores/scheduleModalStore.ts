import { create } from 'zustand'
import api from '@/lib/api'

interface ScheduleModalStoreInterface {
  isOpen: boolean
  date: Date | null
  mode: 'create' | 'edit' | 'view'
  appointmentId?: number
  openModal: (date?: Date, mode?: 'create' | 'edit' | 'view', appointmentId?: number) => void
  closeModal: () => void

  open: () => void
  close: () => void
  reset: () => void
  restart: () => void
  loadMotifs: () => Promise<void>

  motifs: any[]
  isLoadingMotifs: boolean
  motifsError: string | null

  selectedMotif: any
  setSelectedMotif: (motif: any) => void

  selectedPractitionerId: number | null
  setSelectedPractitionerId: (id: number | null) => void

  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void

  selectedHour: string | null
  setSelectedHour: (hour: string | null) => void

  availability: { morning: any[]; afternoon: any[]; evening: any[] }
  isLoadingAvailability: boolean
  availabilityError: string | null
  loadAvailability: () => Promise<void>

  step: number
  setStep: (step: number) => void

  userData: { prenom: string; nom: string; email: string; phone: string; note: string }
  setUserData: (data: any) => void

  isSubmitting: boolean
  submitError: string | null
  submitSuccess: boolean
  submit: () => Promise<void>
}

export const useScheduleModalStore = create<ScheduleModalStoreInterface>((set, get) => ({
  isOpen: false,
  date: null,
  mode: 'create',
  openModal: (date = new Date(), mode = 'create', appointmentId) => {
    set({ isOpen: true, date, mode, appointmentId, step: 1 })
  },
  closeModal: () => {
    set({ isOpen: false, date: null, mode: 'create', appointmentId: undefined })
  },

  loadMotifs: async () => {
    set({ isLoadingMotifs: true, motifsError: null })
    try {
      const res = await api.get('services') 
      let data = res.data.map((item: any) => ({
         ...item,
         practitioners: item.doctor ? [{ ...item.doctor, id: item.doctorId || item.doctor.name || 'doctor-1' }] : [],
         requiresPractitionerChoice: !!item.doctor
      }))
      set({ motifs: data })
    } catch (e: any) {
      set({ motifsError: 'Erreur lors du chargement' })
    } finally {
      set({ isLoadingMotifs: false })
    }
  },
  open: async () => {
    set({ isOpen: true, step: 1, submitSuccess: false })
    await get().loadMotifs()
  },
  close: () => set({ isOpen: false }),
  reset: () => get().restart(),
  restart: () => {
    set({
      selectedMotif: null,
      selectedPractitionerId: null,
      selectedDate: null,
      selectedHour: null,
      availability: { morning: [], afternoon: [], evening: [] },
      step: 1,
      submitSuccess: false,
      submitError: null,
      userData: { prenom: '', nom: '', email: '', phone: '', note: '' }
    })
  },

  motifs: [],
  isLoadingMotifs: false,
  motifsError: null,

  selectedMotif: null,
  setSelectedMotif: (motif) => set({ selectedMotif: motif, selectedPractitionerId: null }),

  selectedPractitionerId: null,
  setSelectedPractitionerId: (id) => set({ selectedPractitionerId: id }),

  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedHour: null,
  setSelectedHour: (hour, doctorId?: number) => set({ 
    selectedHour: hour,
    selectedPractitionerId: doctorId || null
  }),

  availability: { morning: [], afternoon: [], evening: [] },
  isLoadingAvailability: false,
  availabilityError: null,
  loadAvailability: async () => {
    const { selectedDate, selectedMotif, selectedHour } = get()
    if (!selectedDate || !selectedMotif) return

    set({ isLoadingAvailability: true, availabilityError: null })
    try {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const res = await api.get('appointments/availability', {
        params: {
          date: dateStr,
          serviceId: selectedMotif.id
        }
      })
      
      const slots = Array.isArray(res.data) ? res.data : []
      const morning: any[] = []
      const afternoon: any[] = []
      const evening: any[] = []

      let hourStillAvailable = false
      slots.forEach((slot: any) => {
        const dateObj = new Date(slot.time)
        const hour = dateObj.getHours()
        const min = dateObj.getMinutes()
        const slotData = {
          label: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          startsAt: slot.time,
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          doctorImage: slot.doctorImage,
          available: true,
          capacity: 1
        }
        if (slot.time === selectedHour) hourStillAvailable = true
        if (hour < 12) morning.push(slotData)
        else if (hour < 17) afternoon.push(slotData)
        else evening.push(slotData)
      })

      set({ 
        availability: { morning, afternoon, evening },
        selectedHour: hourStillAvailable ? selectedHour : null
      })
    } catch (e: any) {
      set({ availabilityError: 'Erreur de disponibilité' })
    } finally {
      set({ isLoadingAvailability: false })
    }
  },

  step: 1,
  setStep: (step) => set({ step }),

  userData: { prenom: '', nom: '', email: '', phone: '', note: '' },
  setUserData: (data) => set({ userData: data }),

  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
  submit: async () => {
    const { selectedDate, selectedHour, selectedMotif, selectedPractitionerId, userData } = get()
    if (!selectedDate || !selectedHour || !selectedMotif) return
    
    set({ isSubmitting: true, submitError: null })
    try {
      await api.post('appointments', {
        name: `${userData.prenom} ${userData.nom}`,
        email: userData.email,
        phone: userData.phone,
        context: userData.note,
        serviceId: selectedMotif.id,
        practitionerId: selectedPractitionerId || undefined,
        datetime: selectedHour 
      })
      set({ submitSuccess: true })
    } catch (e: any) {
      set({ submitError: 'Erreur lors de la réservation' })
    } finally {
      set({ isSubmitting: false })
    }
  }
}))
