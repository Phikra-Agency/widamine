import api from '@/lib/api'
import axios from 'axios'
import { EnvelopeSimple, Bell, WhatsappLogo, X, CaretLeft } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type NotificationType = 'confirmation' | 'reminder' | 'cancellation'
type EnabledKey = 'smsEnabled' | 'emailEnabled' | 'inAppEnabled' | 'whatsappEnabled'
type TypesKey = 'smsTypes' | 'emailTypes' | 'inAppTypes' | 'whatsappTypes'

interface ChannelTypes {
  confirmation: boolean
  reminder: boolean
  cancellation: boolean
}

interface NotificationSettings {
  smsEnabled: boolean
  emailEnabled: boolean
  inAppEnabled: boolean
  whatsappEnabled: boolean
  smsTypes: ChannelTypes
  emailTypes: ChannelTypes
  inAppTypes: ChannelTypes
  whatsappTypes: ChannelTypes
}

const DEFAULT_SETTINGS: NotificationSettings = {
  smsEnabled: false,
  emailEnabled: true,
  inAppEnabled: true,
  whatsappEnabled: false,
  smsTypes: { confirmation: true, reminder: true, cancellation: false },
  emailTypes: { confirmation: true, reminder: true, cancellation: true },
  inAppTypes: { confirmation: true, reminder: true, cancellation: false },
  whatsappTypes: { confirmation: false, reminder: false, cancellation: false },
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const pendingRef = useRef<NotificationSettings | null>(null)

  useEffect(() => {
    if (!open) return

    setLoading(true)
    api
      .get<NotificationSettings>('settings/notifications')
      .then((res) => {
        setSettings(res.data)
      })
      .catch(() => {
        // Use defaults on error
      })
      .finally(() => setLoading(false))
  }, [open])

  const persistSettings = async (next: NotificationSettings) => {
    if (savingRef.current) {
      pendingRef.current = next
      return
    }
    savingRef.current = true
    setSaving(true)

    try {
      const res = await api.put<NotificationSettings>('settings/notifications', next)
      setSettings(res.data)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      savingRef.current = false
      setSaving(false)
      if (pendingRef.current) {
        const pending = pendingRef.current
        pendingRef.current = null
        void persistSettings(pending)
      }
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
        [channel]: {
          ...prev[channel],
          [type]: !prev[channel][type],
        },
      }
      scheduleSave(next)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="fixed bottom-0 left-0 right-0 top-auto translate-y-0 max-w-full w-full rounded-t-3xl border-t border-border bg-background data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[85vh] overflow-hidden flex flex-col p-0"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Retour"
              className="h-10 w-10 rounded-xl -ml-2"
            >
              <CaretLeft size={20} weight="bold" />
            </Button>
            <h2 className="text-lg font-semibold">Retour</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <p className='text-sm text-muted-foreground'>Chargement...</p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  NOTIFICATIONS
                </h3>
              </div>

              <div className='space-y-4'>
                <ChannelRow
                  name='Email'
                  icon={EnvelopeSimple}
                  enabled={settings.emailEnabled}
                  disabled={saving}
                  onToggleEnabled={(checked) => setChannelEnabled('emailEnabled', checked)}
                  types={settings.emailTypes}
                  onToggleType={(type) => toggleType('emailTypes', type)}
                />
                <ChannelRow
                  name='In-App'
                  icon={Bell}
                  enabled={settings.inAppEnabled}
                  disabled={saving}
                  onToggleEnabled={(checked) => setChannelEnabled('inAppEnabled', checked)}
                  types={settings.inAppTypes}
                  onToggleType={(type) => toggleType('inAppTypes', type)}
                />
                <ChannelRow
                  name='WhatsApp'
                  icon={WhatsappLogo}
                  enabled={settings.whatsappEnabled}
                  disabled={saving}
                  onToggleEnabled={(checked) => setChannelEnabled('whatsappEnabled', checked)}
                  types={settings.whatsappTypes}
                  onToggleType={(type) => toggleType('whatsappTypes', type)}
                />
              </div>

              {/* Auto-save indicator */}
              <div className='mt-6 pt-4 border-t border-border/50'>
                <p className='text-xs text-muted-foreground text-center'>
                  {saving ? 'Enregistrement...' : 'Auto-sauvegarde'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer with user info - matching your screenshot */}
        <div className="border-t border-border/50 px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">AW</span>
              </div>
              <div>
                <p className="text-sm font-medium">Admin Wida...</p>
                <p className="text-xs text-muted-foreground">ADMIN</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-muted-foreground"
            >
              <Bell size={18} weight="duotone" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ChannelRow({
  name,
  icon: IconComponent,
  enabled,
  disabled,
  onToggleEnabled,
  types,
  onToggleType,
}: {
  name: string
  icon: typeof EnvelopeSimple
  enabled: boolean
  disabled?: boolean
  onToggleEnabled: (checked: boolean) => void
  types: ChannelTypes
  onToggleType: (type: NotificationType) => void
}) {
  const enabledId = `${name}-enabled`

  return (
    <div className='rounded-2xl border border-border bg-card p-4'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 flex items-center justify-center'>
            <IconComponent size={20} className='text-foreground' weight='duotone' />
          </div>
          <p className='text-sm font-medium'>{name}</p>
        </div>
        <Switch
          id={enabledId}
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onToggleEnabled}
        />
      </div>

      <div className='flex gap-2'>
        {(['confirmation', 'reminder', 'cancellation'] as NotificationType[]).map((type) => {
          const typeId = `${name}-${type}`
          const labels = {
            confirmation: 'Confirmation',
            reminder: 'Rappel',
            cancellation: 'Annulation'
          }
          return (
            <div
              key={type}
              className={cn(
                'flex-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors',
                types[type] && enabled
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-muted/30 border-border',
                !enabled && 'opacity-50 pointer-events-none',
              )}
            >
              <Checkbox
                id={typeId}
                checked={types[type]}
                disabled={disabled || !enabled}
                onCheckedChange={() => onToggleType(type)}
                className="rounded-md"
              />
              <Label 
                htmlFor={typeId} 
                className='text-xs font-normal cursor-pointer flex-1'
              >
                {labels[type]}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
