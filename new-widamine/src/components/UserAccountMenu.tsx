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
import { GearSix, SignOut as LogOut, CaretUp } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface UserAccountMenuProps {
  onNavigate?: () => void
  className?: string
  variant?: 'sidebar' | 'compact'
}

function UserAvatar({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        dim,
      )}
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export default function UserAccountMenu({
  onNavigate,
  className,
  variant = 'sidebar',
}: UserAccountMenuProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const canAccessSettings = user.role === 'ADMIN' || user.role === 'RECEPTIONIST'

  const handleLogout = () => {
    onNavigate?.()
    void logout().then(() => navigate('/login', { replace: true }))
  }

  const handleSettings = () => {
    onNavigate?.()
    navigate('/back-office/settings')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'outline-none',
          variant === 'sidebar'
            ? 'flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left hover:bg-secondary/[0.03]'
            : 'flex min-w-0 items-center gap-3 rounded-lg px-1 py-1 hover:bg-secondary/[0.04]',
          className,
        )}
      >
        <UserAvatar name={user.name} size={variant === 'compact' ? 'sm' : 'md'} />
        <div className='min-w-0 flex-1'>
          <p className={cn('truncate font-medium text-secondary', variant === 'compact' ? 'text-sm' : 'text-xs')}>
            {user.name}
          </p>
          <p className='truncate text-[10px] uppercase tracking-wide text-secondary/45'>{user.role}</p>
        </div>
        {variant === 'sidebar' && <CaretUp size={14} className='shrink-0 text-secondary/35' />}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        align='start'
        className='w-56'
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <p className='truncate text-sm font-medium text-secondary'>{user.name}</p>
            <p className='text-[10px] uppercase text-muted-foreground'>{user.role}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {canAccessSettings && (
          <DropdownMenuItem onClick={handleSettings}>
            <GearSix size={16} />
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
