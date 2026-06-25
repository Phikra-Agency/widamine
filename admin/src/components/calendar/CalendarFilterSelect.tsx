import { useState, type ElementType } from 'react'
import { Check, X } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FILTER_PILL_COLOR_CLASS, type FilterPillColor } from '@/components/data-table/filter-pills'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface CalendarFilterSelectProps {
  placeholder: string
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
  color?: FilterPillColor
  icon?: ElementType
  className?: string
}

export function CalendarFilterSelect({
  placeholder,
  options,
  value,
  onChange,
  color = 'mist',
  icon: Icon,
  className,
}: CalendarFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const hasFilter = value.length > 0

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const clearAll = () => {
    onChange([])
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        data-active={hasFilter}
        className={cn(
          'bo-filter-pill gap-1.5',
          hasFilter && FILTER_PILL_COLOR_CLASS[color],
          className,
        )}
      >
        {Icon && (
          <Icon
            size={11}
            weight={hasFilter ? 'fill' : 'regular'}
            className={cn(
              'shrink-0',
              hasFilter ? 'text-current/70' : 'text-muted-foreground/50',
            )}
          />
        )}
        <span className='truncate max-w-28'>
          {hasFilter
            ? `${placeholder} (${value.length})`
            : placeholder}
        </span>
        {hasFilter && (
          <span
            role='button'
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              clearAll()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                clearAll()
              }
            }}
            className='flex size-4 shrink-0 items-center justify-center rounded-full text-current/40 hover:bg-black/10 hover:text-current'
          >
            <X size={10} weight='bold' />
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' sideOffset={4} className='min-w-56'>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={cn(
              value.includes(option.value) && 'bg-muted/60 font-medium',
            )}
          >
            <span className='flex size-4 shrink-0 items-center justify-center'>
              {value.includes(option.value) && (
                <Check size={13} weight='bold' className='text-primary' />
              )}
            </span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
        {hasFilter && (
          <>
            <div className='-mx-1 my-1 h-px bg-border' />
            <DropdownMenuItem
              onClick={clearAll}
              className='text-muted-foreground'
            >
              <X size={13} />
              <span>Effacer le filtre</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
