import { useCallback, useRef, useState } from 'react'
import type { Column } from '@tanstack/react-table'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DataTableColumnSearchProps<TData, TValue> {
  column: Column<TData, TValue>
}

export function DataTableColumnSearch<TData, TValue>({
  column,
}: DataTableColumnSearchProps<TData, TValue>) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState((column.getFilterValue() as string) ?? '')
  const commitRef = useRef<() => void>(undefined)

  const syncFilter = useCallback((value: string) => {
    column.setFilterValue(value || undefined)
  }, [column])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (next) {
      setInputValue((column.getFilterValue() as string) ?? '')
    }
  }, [column])

  const hasValue = inputValue.length > 0

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          'inline-flex h-6 cursor-pointer items-center gap-1 rounded-element border px-1.5 text-[10px] font-medium transition-colors',
          hasValue
            ? 'border-border-strong bg-card/80 text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border-subtle hover:bg-muted/40 hover:text-foreground',
        )}
        title='Rechercher'
      >
        <MagnifyingGlass
          size={11}
          className={cn('shrink-0', hasValue && 'text-primary/80')}
          weight={hasValue ? 'bold' : 'regular'}
        />
        <span className='truncate'>{hasValue ? `«${inputValue}»` : 'Rechercher'}</span>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={4}
        className='min-w-48 overflow-hidden p-0 duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'
      >
        <div className='relative'>
          <MagnifyingGlass
            size={14}
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40'
          />
          <input
            type='text'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
            onBlur={() => syncFilter(inputValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                syncFilter(inputValue)
              }
            }}
            placeholder='Rechercher...'
            autoFocus
            className='h-9 w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground/30'
          />
          {hasValue && (
            <button
              type='button'
              onClick={() => {
                setInputValue('')
                column.setFilterValue(undefined)
                setOpen(false)
              }}
              className='absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-full text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground'
            >
              <X size={12} weight='bold' />
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
