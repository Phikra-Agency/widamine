import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '@/lib/errors'

export const API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

let errorInterceptorRegistered = false

/** Global API error toast — skips 401 (auth wrapper) and per-request opt-out */
export function setupApiErrorHandling() {
  if (errorInterceptorRegistered) return
  errorInterceptorRegistered = true

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config as { skipGlobalErrorHandler?: boolean } | undefined
      const status = error.response?.status

      if (!config?.skipGlobalErrorHandler && status !== 401) {
        toast.error(getApiErrorMessage(error))
      }

      return Promise.reject(error)
    },
  )
}

export default api
