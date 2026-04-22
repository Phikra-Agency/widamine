import axios from 'axios'
import { create } from 'zustand'
import { API_BASE_URL } from '@/lib/api'

interface LoginData {
  email: string
  password: string
}

interface User {
  id: number
  name: string
  role: Role
}

export type Role = 'USER' | 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST'

interface AuthStoreInterface {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (data: LoginData) => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStoreInterface>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user })
  },
  token: null,
  setToken: (token) => {
    set({ token })
  },
  login: async (data) => {
    const res = await axios.post<{ user: User; token: string }>(API_BASE_URL + '/login', data, { withCredentials: true })
    set({ token: res.data.token, user: res.data.user })
  },
  refresh: async () => {
    try {
      const res = await axios.post(API_BASE_URL + '/refresh', {}, { withCredentials: true })
      set({ token: res.data.token, user: res.data.user })
    } catch (e) {
      console.log(e)
    }
  },
  logout: async () => {
    await axios.post(API_BASE_URL + '/logout', {}, { withCredentials: true })
    set({ user: null, token: null })
  }
}))
