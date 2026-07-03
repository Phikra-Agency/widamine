import {
  CaretLeft,
  CaretRight,
  Funnel,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import CalendarDatePicker from '@/components/calendar/CalendarDatePicker'
import { cn } from '@/lib/utils'
import {
  CALENDAR_VIEW_OPTIONS,
  formatCalendarPickerLabel,
  getTodayButtonPlacement,
  type CalendarViewMode,
} from '@/lib/calendarView'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  children,
}: CalendarControlBarProps) {
  const pickerLabel = formatCalendarPickerLabel(dateValue, viewMode)
  const todayButtonSide = getTodayButtonPlacement(viewMode, dateValue)
  const [filterModalOpen, setFilterModalOpen] = useState(false)

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
        <>
          <CalendarDatePicker
            value={dateValue}
            label={pickerLabel}
            onChange={onDateChange}
            compact
            triggerClassName='sm:hidden'
          />
          <CalendarDatePicker
            value={dateValue}
            label={pickerLabel}
            onChange={onDateChange}
            triggerClassName='hidden sm:inline-flex'
          />
        </>
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
    <div className='shrink-0 border-b border-border bg-muted/35 px-6 py-3 sm:px-6 sm:py-3'>
      {/* Mobile layout */}
      <div className='flex items-center justify-between gap-4 sm:hidden'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          {navGroup}
        </div>
        <div className='flex items-center gap-3 flex-shrink-0'>
          <div className='relative'>
            <button
              onClick={() => setFilterModalOpen(!filterModalOpen)}
              className='bo-filter-pill shrink-0 gap-1 !rounded-full border-transparent bg-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted/35'
            >
              <Funnel size={13} />
              <span>Filtres</span>
            </button>
            {filterModalOpen && (
              <>
                <div className='fixed inset-0 z-40' onClick={() => setFilterModalOpen(false)} />
                <div className='absolute right-0 top-full z-50 mt-1 min-w-56 rounded-control bg-popover p-3 shadow-md ring-1 ring-border'>
                  <div className='flex flex-col gap-2 pb-1'>
                    <p className='text-[13px] font-medium uppercase tracking-wider text-muted-foreground/45 px-1'>Filtres</p>
                  </div>
                  <div className='flex flex-col gap-2 [&_.bo-filter-pill]:flex [&_.bo-filter-pill]:w-full [&_.flex-wrap]:flex-col [&_.flex-wrap]:w-full'>
                    {filters}
                  </div>
                </div>
              </>
            )}
          </div>
<Select value={viewMode} onValueChange={(v) => onViewModeChange(v as CalendarViewMode)}>
            <SelectTrigger size='sm' className='bo-filter-pill shrink-0 gap-1 !rounded-full border-transparent bg-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted/35'>
              <SelectValue placeholder={CALENDAR_VIEW_OPTIONS.find(o => o.value === viewMode)?.label} />
            </SelectTrigger>
            <SelectContent>
              {CALENDAR_VIEW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop layout — nav + today button centered together, filters left, view switcher right */}
      <div className='relative hidden items-center sm:flex'>
        {/* Left wing: filters */}
        <div className='flex min-w-0 flex-1 items-center'>
          <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2'>
            {filters}
          </div>
        </div>

        {/* Nav — absolutely fixed at center, never moves */}
        <div className='absolute left-1/2 -translate-x-1/2'>
          {navGroup}
        </div>

        {/* Today button — absolutely positioned next to nav, doesn't affect nav */}
        {showTodayButton && (
          <div
            className='absolute top-1/2 -translate-y-1/2'
            style={todayButtonSide === 'left'
              ? { right: 'calc(50% + 115px)' }
              : { left: 'calc(50% + 115px)' }
            }
          >
            <Button
              type='button'
              variant='link'
              onClick={onToday}
              className='max-sm:hidden items-center px-0 text-[13px] font-medium whitespace-nowrap sm:h-11'
            >
              {todayButtonSide === 'left'
                ? "Revenir à aujourd'hui"
                : "Aller à aujourd'hui"
              }
            </Button>
          </div>
        )}

        {/* Right wing: view switcher */}
        <div className='flex shrink-0 items-center gap-1'>
          {children}
          {viewSwitcher}
        </div>
      </div>
    </div>
  )
}
