import { Bell } from '@phosphor-icons/react'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationToast() {
  const { items } = useNotificationsStore()
  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    if (items.length === 0) return
    const latest = items[0]
    if (!latest || latest.read) return
    if (visible.includes(latest.id)) return

    setVisible((prev) => [...prev, latest.id])
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((id) => id !== latest.id))
    }, 5000)

    return () => clearTimeout(timer)
  }, [items, visible])

  const toasts = items.filter((item) => visible.includes(item.id) && !item.read)

  return (
    <div className='pointer-events-none fixed bottom-0 right-0 z-[9999] flex flex-col gap-2 p-3'>


      {toasts.map((item) => (
        <div
          key={item.id}
          className='animate-slide-in pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-popover p-2.5 shadow-lg'
          style={{ minHeight: 150, maxWidth: 360 }}
        >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
              <Bell size={16} className='text-primary' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-foreground'>{item.message}</p>
              <p className='mt-0.5 text-[10px] text-muted-foreground/50'>
                {format(new Date(item.createdAt), 'HH:mm', { locale: fr })}
              </p>
            </div>
        </div>
      ))}
    </div>
  )
}
