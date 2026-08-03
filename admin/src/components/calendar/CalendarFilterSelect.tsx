import { useState, useMemo, type ElementType } from 'react'
import { Check, X, MagnifyingGlass } from '@phosphor-icons/react'
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
  showSearch?: boolean
}

export function CalendarFilterOptions({
  options,
  value,
  onChange,
  showSearch = true,
}: {
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
  showSearch?: boolean
}) {
  const [search, setSearch] = useState('')

  const filteredOptions = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  )

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <>
      {showSearch && (
        <div className='relative mb-1'>
          <MagnifyingGlass size={13} className='pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40' />
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder='Rechercher…'
            autoComplete='off'
            spellCheck={false}
            className='w-full rounded-md border border-border/50 bg-transparent py-1.5 pl-7 pr-2 text-xs outline-none placeholder:text-muted-foreground/30 focus:border-primary/30'
          />
        </div>
      )}
      {filteredOptions.length === 0 ? (
        <div className='px-2 py-4 text-center text-xs text-muted-foreground/50'>Aucun résultat</div>
      ) : (
        filteredOptions.map((option) => (
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
        ))
      )}
      {value.length > 0 && (
        <>
          <div className='-mx-1 my-1 h-px bg-border' />
          <DropdownMenuItem
            onClick={() => onChange([])}
            className='text-muted-foreground'
          >
            <X size={13} />
            <span>Effacer le filtre</span>
          </DropdownMenuItem>
        </>
      )}
    </>
  )
}

export function CalendarFilterSelect({
  placeholder,
  options,
  value,
  onChange,
  color = 'mist',
  icon: Icon,
  className,
  showSearch = true,
}: CalendarFilterSelectProps) {
  const [open, setOpen] = useState(false)
  const hasFilter = value.length > 0

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
              onChange([])
              setOpen(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onChange([])
                setOpen(false)
              }
            }}
            className='flex size-4 shrink-0 items-center justify-center rounded-full text-current/40 hover:bg-black/10 hover:text-current'
          >
            <X size={10} weight='bold' />
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' sideOffset={4} className='min-w-56 p-1'>
        <CalendarFilterOptions options={options} value={value} onChange={onChange} showSearch={showSearch} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
