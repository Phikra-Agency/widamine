import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function UnauthWrapper() {
  const { user } = useAuthStore()
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    !!user && navigate('/back-office')
    setReady(true)
  }, [])
  return ready && <Outlet />
}
