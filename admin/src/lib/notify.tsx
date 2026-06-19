import toast from 'react-hot-toast'
import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react'

type NotifyVariant = 'error' | 'success' | 'info' | 'warning'

const VARIANT_ICON = {
  error: WarningCircle,
  success: CheckCircle,
  info: Info,
  warning: Warning,
} as const

const VARIANT_ICON_CLASS: Record<NotifyVariant, string> = {
  error: 'text-destructive',
  success: 'text-success',
  info: 'text-primary',
  warning: 'text-warning',
}

function showToast(message: string, variant: NotifyVariant) {
  const Icon = VARIANT_ICON[variant]

  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-surface border border-border bg-card px-4 py-3 shadow-bo-elevated ring-1 ring-border/60 transition-all duration-200 ${
          t.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        role='alert'
      >
        <Icon
          size={20}
          weight='fill'
          className={`mt-0.5 shrink-0 ${VARIANT_ICON_CLASS[variant]}`}
          aria-hidden
        />
        <p className='min-w-0 flex-1 text-sm leading-snug text-foreground'>{message}</p>
      </div>
    ),
    { duration: variant === 'error' ? 5000 : 3500 },
  )
}

export const notify = {
  error: (message: string) => showToast(message, 'error'),
  success: (message: string) => showToast(message, 'success'),
  info: (message: string) => showToast(message, 'info'),
  warning: (message: string) => showToast(message, 'warning'),
}
