import { Bell } from '@phosphor-icons/react'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CalendarNotificationBell() {
  const { count, items, markRead, markAllRead, resetCount } = useNotificationsStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => { setOpen(!open); if (!open) resetCount() }}
        className='relative flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground hover:bg-muted/60 transition-colors'
        aria-label='Notifications'
      >
        <Bell size={16} />
        {count > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none'>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />
          <div className='absolute right-0 top-full z-50 mt-1.5 w-72 rounded-control bg-popover shadow-md ring-1 ring-border overflow-hidden'>
            <div className='flex items-center justify-between px-3 py-2 border-b border-border/50'>
              <p className='text-xs font-medium text-foreground'>Notifications</p>
              {items.length > 0 && (
                <button
                  type='button'
                  onClick={markAllRead}
                  className='text-[10px] text-primary hover:underline'
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className='max-h-64 overflow-y-auto'>
              {items.length === 0 ? (
                <p className='px-3 py-6 text-center text-xs text-muted-foreground/50'>Aucune notification</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-2 px-3 py-2 text-xs border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer',
                      !item.read && 'bg-primary/[0.03]',
                    )}
                    onClick={() => markRead(item.id)}
                  >
                    <div className={cn(
                      'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                      item.read ? 'bg-transparent' : 'bg-primary',
                    )} />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-foreground'>
                        {item.message}
                        <span className='ml-1.5 text-[10px] text-muted-foreground/50'>
                          {format(new Date(item.createdAt), "HH:mm", { locale: fr })}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
