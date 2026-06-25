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
      className='hidden items-center px-0 text-[13px] font-medium whitespace-nowrap sm:inline-flex sm:h-11'
    >
      {getTodayLinkLabel(todayButtonSide)}
    </Button>
  ) : null

  const navGroup = (
    <div className='bo-segment inline-flex items-center'>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={onPrev}
        className='h-8 w-8 shrink-0 rounded-[calc(var(--radius)-2px)] sm:h-9 sm:w-9'
        aria-label='Période précédente'
      >
        <CaretLeft size={16} className='sm:hidden' />
        <CaretLeft size={18} className='hidden sm:block' />
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
        className='h-8 w-8 shrink-0 rounded-[calc(var(--radius)-2px)] sm:h-9 sm:w-9'
        aria-label='Période suivante'
      >
        <CaretRight size={16} className='sm:hidden' />
        <CaretRight size={18} className='hidden sm:block' />
      </Button>
    </div>
  )

  const viewSwitcher = (
    <div className='flex min-w-0 items-center'>
      <div className='bo-segment'>
        {CALENDAR_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => onViewModeChange(option.value)}
            title={option.hintTitle}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1 rounded-[calc(var(--radius)-2px)] px-2 py-1 text-[10px] font-medium leading-none transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px]',
              viewMode === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{option.label}</span>
            <span
              className={cn(
                'hidden sm:inline bo-view-hint',
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
    <div className='shrink-0 border-b border-border bg-muted/35 px-3 py-1.5 sm:px-5 sm:py-2'>
      {/* Mobile layout */}
      <div className='flex items-center justify-between gap-2 sm:hidden'>
        <div className='flex items-center gap-1.5'>
          {todayButtonSide === 'left' && todayLink}
          {navGroup}
          {todayButtonSide === 'right' && todayLink}
        </div>
        {viewSwitcher}
      </div>

      {/* Desktop layout */}
      <div className='hidden grid-cols-[1fr_auto_1fr] items-center gap-x-3 sm:grid'>
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
    </div>
  )
}
