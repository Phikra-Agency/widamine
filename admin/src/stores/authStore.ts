import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_BASE_URL } from '@/lib/api'

interface LoginData {
  email: string
  password: string
}

interface User {
  id: number
  name: string
  email?: string
  role: Role
}

export type Role = 'USER' | 'ADMIN' | 'DOCTOR' | 'PRACTITIONER' | 'RECEPTIONIST'

interface IdentifiedUser {
  name: string
  email: string
  role: Role
  image?: string | null
}

interface AuthStoreInterface {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  identify: (email: string) => Promise<IdentifiedUser>
  login: (data: LoginData) => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStoreInterface>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({ user })
      },
      token: null,
      setToken: (token) => {
        set({ token })
      },
      identify: async (email) => {
        const res = await axios.post<{ user: IdentifiedUser }>(
          API_BASE_URL + '/check-email',
          { email },
          { withCredentials: true },
        )
        return res.data.user
      },
      login: async (data) => {
        const res = await axios.post<{ user: User; token: string }>(API_BASE_URL + '/login', data, { withCredentials: true })
        set({ token: res.data.token, user: res.data.user })
      },
      refresh: async () => {
        try {
          const res = await axios.post(API_BASE_URL + '/refresh', {}, { withCredentials: true })
          set({ token: res.data.token, user: res.data.user })
        } catch {
          // Only clear if we actually had credentials (avoid flashing logged-out state)
          const { token } = useAuthStore.getState()
          if (token) {
            set({ token: null, user: null })
          }
        }
      },
      logout: async () => {
        try {
          await axios.post(API_BASE_URL + '/logout', {}, { withCredentials: true })
        } catch (e) {
          // Ignore logout API errors - just clear local state
        }
        set({ user: null, token: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
