import api from '@/lib/api'
import axios from 'axios'
import { EnvelopeSimple, Phone } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

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

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
}

const DEFAULT_SETTINGS: NotificationSettings = {
  smsEnabled: false,
  emailEnabled: true,
  inAppEnabled: true,
  smsTypes: { confirmation: true, reminder: true, cancellation: false },
  emailTypes: { confirmation: true, reminder: true, cancellation: true },
  inAppTypes: { confirmation: true, reminder: true, cancellation: false },
}

export default function Settings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    setLoading(true)
    api
      .get<NotificationSettings>('settings/notifications')
      .then((res) => {
        setSettings(res.data)
      })
      .catch(() => {
        setError('Impossible de charger la configuration des notifications.')
      })
      .finally(() => setLoading(false))
  }, [])

  const persistSettings = async (next: NotificationSettings) => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)

    try {
      const res = await api.put<NotificationSettings>('settings/notifications', next)
      setSettings(res.data)
      setError('')
      setSuccess('Enregistré automatiquement.')
    } catch (err) {
      setSuccess('')
      const detail =
        axios.isAxiosError(err) && err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message
          : "Échec d'enregistrement de la configuration."
      setError(detail)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const scheduleSave = (next: NotificationSettings) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSuccess('')
    setError('')
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className='bo-page'
    >
      <div className='bo-page-inner bo-page-stack'>
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <motion.div {...reveal} className='w-full'>
          <h3 className='bo-title'>Paramètres — Notifications</h3>
          <p className='bo-subtitle'>Activez/désactivez les canaux et choisissez les types de notifications</p>
        </motion.div>

        <div className='w-full flex-1 min-h-0 overflow-auto'>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.04 }}>
            <div className='bo-surface p-6'>
              {loading ? (
                <p className='text-sm text-secondary/50'>Chargement...</p>
              ) : (
                <>
                  <div className='mb-4 flex items-end justify-between border-b border-black/[0.04] pb-4'>
                    <div>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Canaux de notification</p>
                      <p className='mt-1 text-sm text-secondary/70'>Confirmation: patient + docteur. Rappel: patient uniquement.</p>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <ChannelRow
                      name='SMS'
                      enabled={settings.smsEnabled}
                      disabled={saving}
                      onToggleEnabled={(checked) => setChannelEnabled('smsEnabled', checked)}
                      types={settings.smsTypes}
                      onToggleType={(type) => toggleType('smsTypes', type)}
                    />
                    <ChannelRow
                      name='Email'
                      enabled={settings.emailEnabled}
                      disabled={saving}
                      onToggleEnabled={(checked) => setChannelEnabled('emailEnabled', checked)}
                      types={settings.emailTypes}
                      onToggleType={(type) => toggleType('emailTypes', type)}
                    />
                  </div>

                  {(error || success) && (
                    <p className={`mt-4 text-xs ${error ? 'text-red-600' : 'text-emerald-600'}`}>{error || success}</p>
                  )}

                  <div className='mt-6 flex justify-end border-t border-black/[0.04] pt-4'>
                    <p className='text-xs text-secondary/45'>{saving ? 'Enregistrement...' : 'Modifications enregistrées automatiquement'}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function ChannelRow({
  name,
  enabled,
  disabled,
  onToggleEnabled,
  types,
  onToggleType,
}: {
  name: string
  enabled: boolean
  disabled?: boolean
  onToggleEnabled: (checked: boolean) => void
  types: ChannelTypes
  onToggleType: (type: NotificationType) => void
}) {
  const channelMeta = {
    SMS: { icon: Phone, subtitle: 'Canal SMS' },
    Email: { icon: EnvelopeSimple, subtitle: 'Canal email' },
  } as const

  const meta = channelMeta[name as keyof typeof channelMeta] || channelMeta.Email
  const ChannelIcon = meta.icon

  return (
    <div className='rounded-xl border border-black/[0.06] bg-secondary/[0.01] p-4'>
      <div className='flex items-start gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-black/[0.05]'>
          <ChannelIcon size={16} className='text-secondary/60' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-secondary'>{name}</p>
          <p className='text-xs text-secondary/40'>{meta.subtitle}</p>
        </div>
      </div>

      <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3'>
        <label className='inline-flex items-center gap-2 rounded-md border border-black/[0.04] bg-secondary/[0.02] px-3 py-2 text-xs'>
          <input disabled={disabled} type='checkbox' checked={enabled} onChange={(e) => onToggleEnabled(e.target.checked)} className='h-4 w-4 disabled:cursor-not-allowed' />
          <span>Activer le canal</span>
        </label>
        {(['confirmation', 'reminder', 'cancellation'] as NotificationType[]).map((type) => (
          <label
            key={type}
            className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md border ${types[type] ? 'bg-primary/10 border-primary' : 'bg-secondary/[0.02] border-black/[0.04]'} ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input disabled={disabled} type='checkbox' checked={types[type]} onChange={() => onToggleType(type)} className='w-4 h-4 disabled:cursor-not-allowed' />
            <span className='capitalize'>{type}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
