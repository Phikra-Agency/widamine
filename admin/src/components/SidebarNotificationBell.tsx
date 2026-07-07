import { Bell } from '@phosphor-icons/react'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  collapsed?: boolean
}

export default function SidebarNotificationBell({ collapsed = false }: Props) {
  const { count, items, markRead, markAllRead, resetCount } = useNotificationsStore()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = useCallback(() => {
    if (!open) {
      const rect = btnRef.current?.getBoundingClientRect()
      if (rect) setPos({ top: rect.bottom, left: rect.left, right: rect.right })
    }
    setOpen(!open)
    if (!open) resetCount()
  }, [open, resetCount])

  return (
    <>
      <button
        ref={btnRef}
        type='button'
        onClick={toggle}
        title='Notifications'
        className={cn(
          'relative flex shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors',
          collapsed ? 'mx-auto h-6 w-6' : 'h-8 w-8',
        )}
        aria-label='Notifications'
      >
        <Bell size={collapsed ? 18 : 16} weight='duotone' />
        {count > 0 && (
          <span
            className={cn(
              'absolute flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none',
              '-top-0.5 -right-0.5',
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && createPortal(
        <>
          <div
            className='fixed z-[9999] w-72 overflow-hidden rounded-xl bg-popover shadow-lg ring-1 ring-border'
            style={{ bottom: window.innerHeight - pos.top + 20, left: collapsed ? pos.left - 8 : Math.max(pos.right - 288, 8) }}
          >
            <div className='flex items-center justify-between border-b border-border/50 px-3 py-2'>
              <p className='text-xs font-medium text-foreground'>Notifications</p>
              {items.length > 0 && (
                <button type='button' onClick={markAllRead} className='text-[10px] text-primary hover:underline'>
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
                      'flex cursor-pointer items-start gap-2 border-b border-border/30 px-3 py-2 text-xs transition-colors hover:bg-muted/30 last:border-0',
                      !item.read && 'bg-primary/[0.03]',
                    )}
                    onClick={() => markRead(item.id)}
                  >
                    <div
                      className={cn(
                        'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                        item.read ? 'bg-transparent' : 'bg-primary',
                      )}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-foreground'>{item.message}</p>
                      <p className='mt-0.5 text-[10px] text-muted-foreground/50'>
                        {format(new Date(item.createdAt), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
