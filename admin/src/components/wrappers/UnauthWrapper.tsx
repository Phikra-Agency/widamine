import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function UnauthWrapper() {
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const { user } = useAuthStore.getState()
    if (user) {
      navigate('/calendar', { replace: true })
    } else {
      setReady(true)
    }
  }, [])

  return ready && <Outlet />
}
