import {
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import CalendarDatePicker from '@/components/calendar/CalendarDatePicker'
import { cn } from '@/lib/utils'
import {
  CALENDAR_VIEW_OPTIONS,
  formatCalendarPickerLabel,
  getTodayButtonPlacement,
  getTodayLinkLabel,
  type CalendarViewMode,
} from '@/lib/calendarView'

interface CalendarControlBarProps {
  viewMode: CalendarViewMode
  onViewModeChange: (mode: CalendarViewMode) => void
  filters?: ReactNode
  showTodayButton?: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  dateValue: string
  onDateChange: (date: string) => void
  children?: React.ReactNode
  compact?: boolean
}

export default function CalendarControlBar({
  viewMode,
  onViewModeChange,
  filters,
  showTodayButton = false,
  onPrev,
  onNext,
  onToday,
  dateValue,
  onDateChange,
  compact = false,
}: CalendarControlBarProps) {
  const pickerLabel = formatCalendarPickerLabel(dateValue, viewMode)
  const todayButtonSide = getTodayButtonPlacement(viewMode, dateValue)

  const todayLink = showTodayButton ? (
    <Button
      type='button'
      variant='link'
      onClick={onToday}
      className='inline-flex h-11 items-center px-0 text-[13px] font-medium whitespace-nowrap'
    >
      {getTodayLinkLabel(todayButtonSide)}
    </Button>
  ) : null

  const navGroup = (
    <div className='bo-segment inline-flex h-11 items-center'>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={onPrev}
        className='h-9 w-9 shrink-0 rounded-[calc(var(--radius)-2px)]'
        aria-label='Période précédente'
      >
        <CaretLeft size={18} />
      </Button>

      {!compact && (
        <CalendarDatePicker
          value={dateValue}
          label={pickerLabel}
          onChange={onDateChange}
        />
      )}

      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={onNext}
        className='h-9 w-9 shrink-0 rounded-[calc(var(--radius)-2px)]'
        aria-label='Période suivante'
      >
        <CaretRight size={18} />
      </Button>
    </div>
  )

  const viewSwitcher = (
    <div className='flex min-w-0 items-center justify-end'>
      <div className='bo-segment'>
        {CALENDAR_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => onViewModeChange(option.value)}
            title={option.hintTitle}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-2.5 py-1.5 text-[11px] font-medium leading-none transition-colors',
              viewMode === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{option.label}</span>
            <span
              className={cn(
                'bo-view-hint',
                viewMode === option.value && 'bo-view-hint-active',
              )}
              aria-hidden
            >
              {option.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className='grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-x-3 border-b border-border bg-muted/35 px-4 py-2 sm:px-5'>
      <div className='flex min-w-0 flex-wrap items-center justify-start gap-x-3 gap-y-2'>
        {filters}
      </div>

      <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-x-2'>
        <div className='flex h-11 items-center justify-end'>
          {todayButtonSide === 'left' && todayLink}
        </div>
        {navGroup}
        <div className='flex h-11 items-center justify-start'>
          {todayButtonSide === 'right' && todayLink}
        </div>
      </div>

      {viewSwitcher}
    </div>
  )
}
