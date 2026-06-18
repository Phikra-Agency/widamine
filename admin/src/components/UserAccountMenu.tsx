import { useAuthStore } from '@/stores/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GearSix, SignOut as LogOut, CaretUp, User } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface UserAccountMenuProps {
  onNavigate?: () => void
  className?: string
  variant?: 'sidebar' | 'compact'
  collapsed?: boolean
}

export default function UserAccountMenu({
  onNavigate,
  className,
  variant = 'sidebar',
  collapsed = false,
}: UserAccountMenuProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!user) return null

  const canAccessSettings = user.role === 'ADMIN' || user.role === 'RECEPTIONIST'
  const isSettingsActive = pathname.startsWith('/settings')

  const handleLogout = () => {
    onNavigate?.()
    void logout().then(() => navigate('/login', { replace: true }))
  }

  const handleSettings = () => {
    onNavigate?.()
    navigate('/settings')
  }

  const iconSize = collapsed || variant === 'compact' ? 16 : 18
  const iconBox = collapsed || variant === 'compact' ? 'h-8 w-8' : 'h-9 w-9'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={collapsed ? user.name : undefined}
        className={cn(
          'outline-none',
          variant === 'sidebar' && collapsed
            ? 'flex w-full cursor-pointer justify-center rounded-control border border-border bg-card p-2 hover:bg-secondary/[0.03]'
            : variant === 'sidebar'
            ? 'flex w-full cursor-pointer items-center gap-2 rounded-surface border border-border bg-card px-3 py-2.5 text-left hover:bg-secondary/[0.03]'
            : 'flex min-w-0 cursor-pointer items-center gap-3 rounded-control px-1 py-1 hover:bg-secondary/[0.04]',
          className,
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
            iconBox,
          )}
        >
          <User size={iconSize} weight={variant === 'sidebar' ? 'duotone' : 'regular'} />
        </div>
        {!collapsed && (
          <>
            <div className='min-w-0 flex-1'>
              <p className={cn('truncate font-medium text-secondary', variant === 'compact' ? 'text-sm' : 'text-xs')}>
                {user.name}
              </p>
              <p className='truncate text-[10px] uppercase tracking-wide text-secondary/45'>{user.role}</p>
            </div>
            {variant === 'sidebar' && <CaretUp size={14} className='shrink-0 text-secondary/35' />}
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        align='start'
        className='w-56 p-1.5'
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='px-2 py-2 font-normal'>
            <p className='truncate text-sm font-medium text-foreground'>{user.name}</p>
            <p className='text-[10px] uppercase tracking-wide text-muted-foreground'>{user.role}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {canAccessSettings && (
          <DropdownMenuItem
            onClick={handleSettings}
            className={cn(isSettingsActive && 'bg-muted/60 font-medium text-foreground')}
          >
            <GearSix size={16} className='text-muted-foreground' />
            Paramètres
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={handleLogout}>
          <LogOut size={16} />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
