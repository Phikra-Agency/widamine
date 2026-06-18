import { cn } from '@/lib/utils'
import { FILTER_PILL_COLOR_CLASS, type FilterPillOption } from './filter-pills'

interface DataTableFilterPillsProps {
  options: FilterPillOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DataTableFilterPills({
  options,
  value,
  onChange,
  className,
}: DataTableFilterPillsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} role='group'>
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type='button'
            data-active={isActive}
            onClick={() => onChange(option.value)}
            className={cn('bo-filter-pill', FILTER_PILL_COLOR_CLASS[option.color])}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
