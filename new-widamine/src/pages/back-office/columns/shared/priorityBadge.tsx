import { Star } from '@phosphor-icons/react'
import clsx from 'clsx'

export const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Basse', color: 'bg-gray-50 text-gray-600' },
  2: { label: 'Normale', color: 'bg-blue-50 text-blue-600' },
  3: { label: 'Haute', color: 'bg-amber-50 text-amber-600' },
  4: { label: 'Urgente', color: 'bg-red-50 text-red-600' },
}

export const SALLES_PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Basse', color: 'bg-gray-50/60 text-gray-500 border-gray-100' },
  2: { label: 'Normale', color: 'bg-blue-50/60 text-blue-500 border-blue-100' },
  3: { label: 'Haute', color: 'bg-amber-50/60 text-amber-500 border-amber-100' },
  4: { label: 'Urgente', color: 'bg-red-50/60 text-red-500 border-red-100' },
}

export function PriorityBadge({
  priority,
  variant = 'default',
}: {
  priority: number
  variant?: 'default' | 'salles'
}) {
  const config = variant === 'salles' ? SALLES_PRIORITY_CONFIG : PRIORITY_CONFIG
  const prioConf = config[priority] || config[1]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium',
        prioConf.color,
        variant === 'salles' && 'rounded-lg border text-[11px] font-bold',
      )}
    >
      <Star size={variant === 'salles' ? 11 : 12} weight={priority >= 3 ? 'fill' : 'regular'} />
      {prioConf.label}
    </span>
  )
}
