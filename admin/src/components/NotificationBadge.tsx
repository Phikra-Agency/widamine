import { useNotificationsStore } from '@/stores/notificationsStore'
import { useEffect } from 'react'

export default function NotificationBadge() {
  const { count, startPolling, stopPolling } = useNotificationsStore()

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  if (count === 0) return null

  return (
    <div className='absolute -top-0.5 -right-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none ring-2 ring-sidebar'>
      {count > 99 ? '99+' : count}
    </div>
  )
}
