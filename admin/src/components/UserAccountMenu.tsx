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
import { GearSix, SignOut as LogOut, CaretUp, CaretLeft, User, EnvelopeSimple, DeviceMobile, Bell } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import NotificationBadge from '@/components/NotificationBadge'
import api from '@/lib/api'
import axios from 'axios'

type NotificationType = 'confirmation' | 'reminder' | 'cancellation'
type EnabledKey = 'smsEnabled' | 'emailEnabled'
type TypesKey = 'smsTypes' | 'emailTypes'

interface ChannelTypes {
  confirmation: boolean
  reminder: boolean
  cancellation: boolean
}

interface NotificationSettings {
  smsEnabled: boolean
  emailEnabled: boolean
  inAppEnabled: boolean
  smsTypes: ChannelTypes
  emailTypes: ChannelTypes
  inAppTypes: ChannelTypes
}

const DEFAULT_SETTINGS: NotificationSettings = {
  smsEnabled: false,
  emailEnabled: true,
  inAppEnabled: true,
  smsTypes: { confirmation: true, reminder: true, cancellation: false },
  emailTypes: { confirmation: true, reminder: true, cancellation: true },
  inAppTypes: { confirmation: true, reminder: true, cancellation: false },
}

const TYPES: { key: NotificationType; label: string }[] = [
  { key: 'confirmation', label: 'Confirmation' },
  { key: 'reminder', label: 'Rappel' },
  { key: 'cancellation', label: 'Annulation' },
]

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
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'main' | 'settings'>('main')
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  if (!user) return null

  const canAccessSettings = user.role === 'ADMIN' || user.role === 'RECEPTIONIST'

  const handleLogout = () => {
    onNavigate?.()
    void logout().then(() => navigate('/login', { replace: true }))
  }

  const loadSettings = () => {
    setLoading(true)
    api.get<NotificationSettings>('settings/notifications')
      .then((res) => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const persistSettings = async (next: NotificationSettings) => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      const res = await api.put<NotificationSettings>('settings/notifications', next)
      setSettings(res.data)
    } catch (_) {
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const scheduleSave = (next: NotificationSettings) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => persistSettings(next), 500)
  }

  const setChannelEnabled = (key: EnabledKey, checked: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: checked }
      scheduleSave(next)
      return next
    })
  }

  const toggleType = (channel: TypesKey, type: NotificationType) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        [channel]: { ...prev[channel], [type]: !prev[channel][type] },
      }
      scheduleSave(next)
      return next
    })
  }

  const openSettings = () => {
    setView('settings')
    loadSettings()
  }

  const iconSize = collapsed || variant === 'compact' ? 16 : 18
  const iconBox = collapsed || variant === 'compact' ? 'h-8 w-8' : 'h-9 w-9'

  const channels = [
    { key: 'sms' as const, label: 'SMS', icon: DeviceMobile },
    { key: 'email' as const, label: 'Email', icon: EnvelopeSimple },
    { key: 'inApp' as const, label: 'In-App', icon: Bell },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (!o) setView('main') }}>
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
            'relative flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
            iconBox,
          )}
        >
          <User size={iconSize} weight={variant === 'sidebar' ? 'duotone' : 'regular'} />
          <NotificationBadge />
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
        className='w-64 p-1.5'
      >
        <div className='relative min-h-[200px] overflow-hidden'>
          <div
            className={cn(
              'transition-all duration-200',
              view === 'main' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-2',
            )}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='px-2 py-2 font-normal'>
                <p className='truncate text-sm font-medium text-foreground'>{user.name}</p>
                <p className='text-[10px] uppercase tracking-wide text-muted-foreground'>{user.role}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {canAccessSettings && (
              <div
                onClick={openSettings}
                className='flex cursor-pointer items-center gap-2 rounded-element px-2 py-1.5 text-sm text-foreground outline-none hover:bg-muted/80'
              >
                <GearSix size={16} className='text-muted-foreground' />
                Paramètres
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onClick={handleLogout}>
              <LogOut size={16} />
              Déconnexion
            </DropdownMenuItem>
          </div>
          <div
            className={cn(
              'transition-all duration-200',
              view === 'settings' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-2',
            )}
          >
          <>
            <button
              type='button'
              onClick={() => setView('main')}
              className='flex w-full cursor-pointer items-center gap-2 rounded-element px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80'
            >
              <CaretLeft size={14} />
              Retour
            </button>

            <div className='mx-2 my-1.5 h-px bg-border' />

            <div className='px-2 py-1'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50'>Notifications</p>
            </div>

            {loading ? (
              <div className='px-2 py-4 text-center text-xs text-muted-foreground/60'>Chargement...</div>
            ) : (
              channels.map((ch) => {
                const enabledKey = `${ch.key}Enabled` as EnabledKey
                const typesKey = `${ch.key}Types` as TypesKey
                const enabled = settings[enabledKey]

                return (
                  <div key={ch.key} className='px-2 py-1.5'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <ch.icon size={14} className='text-muted-foreground' />
                        <span className='text-sm text-foreground'>{ch.label}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(c) => setChannelEnabled(enabledKey, c)}
                      />
                    </div>
                    {enabled && (
                      <div className='mt-1.5 ml-6 flex flex-wrap gap-1'>
                        {TYPES.map((type) => (
                          <label
                            key={type.key}
                            className={cn(
                              'inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                              settings[typesKey][type.key]
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'border-border text-muted-foreground',
                            )}
                          >
                            <Checkbox
                              checked={settings[typesKey][type.key]}
                              onCheckedChange={() => toggleType(typesKey, type.key)}
                              className='size-3'
                            />
                            {type.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            <div className='mx-2 mt-1.5 h-px bg-border' />

            <div className='px-2 py-1.5'>
              <p className='text-[10px] text-muted-foreground/40'>
                {saving ? 'Enregistrement...' : 'Auto-sauvegarde'}
              </p>
            </div>
          </>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
