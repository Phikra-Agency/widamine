import { useAuthStore } from '@/stores/authStore'
import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function RefreshWrapper() {
  const { refresh } = useAuthStore()
  const [ready, setReady] = useState(false)
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (hasRefreshed.current) return
    hasRefreshed.current = true

    ;(async () => {
      try {
        await refresh()
      } catch (e) {
        // Refresh failed - stale credentials cleared by authStore
      }
      setReady(true)
    })()
  }, [])

  return ready && <Outlet />
}
