import { X } from '@phosphor-icons/react'
import { FILTER_PILL_COLOR_CLASS, type FilterPillColor } from '@/components/data-table/filter-pills'
import { cn } from '@/lib/utils'

interface FilterTag {
  value: string
  label: string
  color: FilterPillColor
}

interface CalendarFilterTagsProps {
  tags: FilterTag[]
  onRemove: (value: string, color: FilterPillColor) => void
  className?: string
}

export function CalendarFilterTags({ tags, onRemove, className }: CalendarFilterTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <span
          key={`${tag.color}-${tag.value}`}
          className={cn(
            'bo-filter-pill gap-1 py-0.5 pl-2 pr-1 text-[10px]',
            FILTER_PILL_COLOR_CLASS[tag.color],
          )}
          data-active='true'
        >
          <span className='truncate max-w-24'>{tag.label}</span>
          <span
            role='button'
            tabIndex={0}
            onClick={() => onRemove(tag.value, tag.color)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onRemove(tag.value, tag.color)
            }}
            className='flex size-3.5 shrink-0 items-center justify-center rounded-full hover:bg-black/10'
          >
            <X size={8} weight='bold' />
          </span>
        </span>
      ))}
    </div>
  )
}
