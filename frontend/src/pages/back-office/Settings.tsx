import api from '@/lib/api'
import axios from 'axios'
import { Bell, EnvelopeSimple, Phone } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type NotificationType = 'confirmation' | 'reminder' | 'cancellation'
type EnabledKey = 'smsEnabled' | 'emailEnabled' | 'inAppEnabled'
type TypesKey = 'smsTypes' | 'emailTypes' | 'inAppTypes'

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

  const toggleChannel = (key: EnabledKey) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
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
                      <p className='mt-1 text-sm text-secondary/70'>Configurez les canaux et les types envoyés</p>
                    </div>
                    <span className='rounded-md border border-black/[0.06] bg-secondary/[0.02] px-2 py-1 text-[11px] font-medium text-secondary/60'>3 canaux</span>
                  </div>

                  <div className='space-y-3'>
                    <ChannelRow
                      name='SMS'
                      enabled={settings.smsEnabled}
                      disabled={saving}
                      onToggle={() => toggleChannel('smsEnabled')}
                      types={settings.smsTypes}
                      onToggleType={(type) => toggleType('smsTypes', type)}
                    />
                    <ChannelRow
                      name='Email'
                      enabled={settings.emailEnabled}
                      disabled={saving}
                      onToggle={() => toggleChannel('emailEnabled')}
                      types={settings.emailTypes}
                      onToggleType={(type) => toggleType('emailTypes', type)}
                    />
                    <ChannelRow
                      name='In-app'
                      enabled={settings.inAppEnabled}
                      disabled={saving}
                      onToggle={() => toggleChannel('inAppEnabled')}
                      types={settings.inAppTypes}
                      onToggleType={(type) => toggleType('inAppTypes', type)}
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
  onToggle,
  types,
  onToggleType,
}: {
  name: string
  enabled: boolean
  disabled?: boolean
  onToggle: () => void
  types: ChannelTypes
  onToggleType: (type: NotificationType) => void
}) {
  const channelMeta = {
    SMS: { icon: Phone, subtitle: 'Canal SMS' },
    Email: { icon: EnvelopeSimple, subtitle: 'Canal email' },
    'In-app': { icon: Bell, subtitle: 'Canal interne' },
  } as const

  const meta = channelMeta[name as keyof typeof channelMeta] || channelMeta['In-app']
  const ChannelIcon = meta.icon

  return (
    <div className='rounded-xl border border-black/[0.06] bg-secondary/[0.01] p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-black/[0.05]'>
            <ChannelIcon size={16} className='text-secondary/60' />
          </div>
          <div>
            <p className='text-sm font-medium text-secondary'>{name}</p>
            <p className='text-xs text-secondary/40'>{meta.subtitle} · activer/désactiver les envois</p>
          </div>
        </div>
        <button disabled={disabled} onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-primary' : 'bg-secondary/20'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3'>
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
