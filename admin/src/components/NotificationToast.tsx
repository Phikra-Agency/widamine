import { Bell, X } from '@phosphor-icons/react'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationToast() {
  const { items, markRead, startPolling, stopPolling } = useNotificationsStore()
  const { user } = useAuthStore()
  const [visible, setVisible] = useState<number[]>([])
  const [dismissed, setDismissed] = useState<number[]>([])
  const canPoll = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST'

  useEffect(() => {
    if (!canPoll) return
    startPolling()
    return () => stopPolling()
  }, [canPoll, startPolling, stopPolling])

  useEffect(() => {
    if (items.length === 0) return
    const latest = items[0]
    if (!latest || latest.read) return
    if (visible.includes(latest.id)) return
    if (dismissed.includes(latest.id)) return

    setVisible((prev) => [...prev, latest.id])
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((id) => id !== latest.id))
    }, 5000)

    return () => clearTimeout(timer)
  }, [items, visible, dismissed])

  const toasts = items.filter((item) => visible.includes(item.id) && !item.read)

  return (
    <div className='pointer-events-none fixed bottom-0 right-0 z-[9999] flex flex-col gap-2 p-3'>


      {toasts.map((item) => (
        <div
          key={item.id}
          className='animate-slide-in pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg'
          style={{ maxWidth: 360 }}
        >
            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10'>
              <Bell size={12} className='text-primary' />
            </div>
            <p className='min-w-0 flex-1 truncate text-xs font-medium text-foreground'>
              {item.message}
              <span className='ml-1.5 text-[10px] text-muted-foreground/50'>
                {format(new Date(item.createdAt), 'HH:mm', { locale: fr })}
              </span>
            </p>
            <button
              type='button'
              aria-label='Fermer la notification'
              onClick={() => {
                markRead(item.id)
                setDismissed((prev) => [...prev, item.id])
                setVisible((prev) => prev.filter((id) => id !== item.id))
              }}
              className='flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground'
            >
              <X size={10} />
            </button>
        </div>
      ))}
    </div>
  )
}
