import { cn } from '@/lib/utils'

export const PRIORITY_CONFIG: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  1: { label: 'Basse', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
  2: { label: 'Normale', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  3: { label: 'Haute', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  4: { label: 'Urgente', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

export function PriorityBadge({ priority }: { priority: number }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[1]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', config.bg, config.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
