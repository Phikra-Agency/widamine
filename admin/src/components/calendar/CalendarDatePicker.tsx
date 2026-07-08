import { useMemo, useState } from 'react'
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getMonthGridDates } from '@/lib/calendarView'
import { formatLocalDate, parseLocalDate } from '@/lib/date'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

interface CalendarPickerPanelProps {
  value: string
  onSelect: (date: string) => void
}

function CalendarPickerPanel({ value, onSelect }: CalendarPickerPanelProps) {
  const [viewDate, setViewDate] = useState(() => parseLocalDate(value))
  const today = formatLocalDate(new Date())
  const viewMonth = viewDate.getMonth()
  const viewYear = viewDate.getFullYear()

  const cells = useMemo(
    () => getMonthGridDates(formatLocalDate(viewDate)),
    [viewDate],
  )

  const shiftMonth = (direction: -1 | 1) => {
    setViewDate((current) => {
      const next = new Date(current)
      next.setMonth(next.getMonth() + direction)
      return next
    })
  }

  return (
    <div className='w-[17.5rem] p-3'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={() => shiftMonth(-1)}
          className='h-8 w-8 rounded-[calc(var(--radius)-2px)]'
          aria-label='Mois précédent'
        >
          <CaretLeft size={16} />
        </Button>
        <p className='text-sm font-medium capitalize text-foreground'>
          {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={() => shiftMonth(1)}
          className='h-8 w-8 rounded-[calc(var(--radius)-2px)]'
          aria-label='Mois suivant'
        >
          <CaretRight size={16} />
        </Button>
      </div>

      <div className='mb-1 grid grid-cols-7'>
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className='py-1 text-center text-[10px] font-medium lowercase text-muted-foreground'
          >
            {label}
          </span>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-0.5'>
        {cells.map((cell) => {
          const dateKey = formatLocalDate(cell)
          const inMonth = cell.getMonth() === viewMonth && cell.getFullYear() === viewYear
          const isToday = dateKey === today
          const isSelected = dateKey === value

          return (
            <button
              key={dateKey}
              type='button'
              onClick={() => onSelect(dateKey)}
              className={cn(
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors',
                !inMonth && 'text-muted-foreground/35 hover:bg-muted/40',
                inMonth && !isSelected && 'text-foreground hover:bg-muted',
                isToday && !isSelected && 'text-primary ring-1 ring-inset ring-primary/25',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {cell.getDate()}
            </button>
          )
        })}
      </div>

      <div className='mt-3 flex justify-center border-t border-border-subtle pt-2'>
        <Button
          type='button'
          variant='link'
          size='sm'
          onClick={() => onSelect(today)}
          className='h-auto px-0 text-xs font-medium'
        >
          Aujourd&apos;hui
        </Button>
      </div>
    </div>
  )
}

interface CalendarDatePickerProps {
  value: string
  label: string
  onChange: (date: string) => void
  triggerClassName?: string
  compact?: boolean
}

export default function CalendarDatePicker({
  value,
  label,
  onChange,
  triggerClassName,
  compact = false,
}: CalendarDatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          compact ? (
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              aria-label={`Choisir une date, ${label}`}
              className={cn('text-secondary/50', triggerClassName)}
            >
              <CalendarBlank size={14} />
            </Button>
          ) : (
            <Button
              type='button'
              variant='ghost'
              aria-label={`Choisir une date, ${label}`}
              className={cn(
                'h-auto rounded-[calc(var(--radius)-2px)] px-3 py-1 text-[10px] font-medium capitalize leading-none sm:px-4 sm:py-1.5 sm:text-[11px]',
                triggerClassName,
              )}
            >
              {label}
            </Button>
          )
        }
      />
      <PopoverContent align='center' side='bottom' sideOffset={8} collisionPadding={16}>
        {open ? (
          <CalendarPickerPanel
            value={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export { CalendarPickerPanel }
