import { useAuthStore } from '@/stores/authStore'
import { useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function RoleWrapper({ roles }: { roles: string[] }) {
  const navigate = useNavigate()
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const { user } = useAuthStore.getState()
    if (!roles.includes(user?.role || '')) {
      navigate('/login', { replace: true })
    }
  }, [])

  return <Outlet />
}
