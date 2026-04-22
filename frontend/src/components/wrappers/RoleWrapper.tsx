import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function RoleWrapper({ roles }: { roles: string[] }) {
  const { user } = useAuthStore()
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    !roles.includes(user?.role || '') && navigate('/login')
    setReady(true)
  }, [])

  return ready && <Outlet />
}
