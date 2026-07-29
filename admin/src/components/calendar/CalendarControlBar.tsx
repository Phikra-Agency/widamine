import {
  CaretLeft,
  CaretRight,
  Funnel,
  X as XIcon,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
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
  isAnalytics?: boolean
  onToggleAnalytics?: () => void
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
  isAnalytics = false,
  onToggleAnalytics,
}: CalendarControlBarProps) {
  const pickerLabel = formatCalendarPickerLabel(dateValue, viewMode)
  const todayButtonSide = getTodayButtonPlacement(viewMode, dateValue)
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const todayLabel = 'Aujourd\'hui'

  const navGroup = (
    <div className='bo-segment inline-flex items-center gap-0.5'>
      <button
        type='button'
        onClick={onPrev}
        className='flex shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-2px)] p-1.5 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground'
        aria-label='Période précédente'
      >
        <CaretLeft size={16} weight='bold' />
      </button>

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
            triggerClassName='hidden sm:inline-flex min-w-[190px]'
          />
        </>
      )}

      <button
        type='button'
        onClick={onNext}
        className='flex shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-2px)] p-1.5 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground'
        aria-label='Période suivante'
      >
        <CaretRight size={16} weight='bold' />
      </button>
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
        {onToggleAnalytics && (
          <>
            <span className='mx-0.5 h-4 w-px bg-border' aria-hidden />
            <button
              type='button'
              onClick={() => isAnalytics && onToggleAnalytics()}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-[calc(var(--radius)-2px)] px-2 py-1 text-[10px] font-medium leading-none transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px]',
                !isAnalytics
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Calendrier
            </button>
            <button
              type='button'
              onClick={() => !isAnalytics && onToggleAnalytics()}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-[calc(var(--radius)-2px)] px-2 py-1 text-[10px] font-medium leading-none transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px]',
                isAnalytics
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Tableau
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className='shrink-0 border-b border-border-subtle bg-card px-2.5 py-1.5 sm:px-6 sm:py-3'>
      {/* Mobile layout - single row */}
      <div className='flex items-center justify-between gap-1 sm:hidden'>
        {/* Left: nav controls */}
        <div className='flex items-center min-w-0 flex-1'>
          {navGroup}
        </div>

        {/* Right: filters + view selector + analytics */}
        <div className='flex items-center gap-0.5 shrink-0'>
          <Sheet open={filterModalOpen} onOpenChange={setFilterModalOpen}>
            <button
              type='button'
              onClick={() => setFilterModalOpen(true)}
              className='flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors active:bg-muted'
              aria-label='Filtres'
            >
              <Funnel size={17} weight='duotone' />
            </button>
            <SheetContent side='bottom' className='rounded-t-2xl border-t-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))]'>
              <div className='mx-auto mb-5 h-1 w-12 shrink-0 rounded-full bg-border' />
              <div className='flex items-center justify-between mb-5'>
                <p className='bo-label text-muted-foreground'>Filtres</p>
                <SheetClose className='min-h-touch min-w-touch flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors'>
                  <XIcon size={18} weight='bold' />
                </SheetClose>
              </div>
              <div className='space-y-3 [&_.bo-filter-pill]:flex [&_.bo-filter-pill]:w-full [&_.flex-wrap]:flex-col [&_.flex-wrap]:w-full [&_.flex-wrap]:gap-2'>
                {filters}
              </div>
            </SheetContent>
          </Sheet>

          {onToggleAnalytics && (
            <button
              type='button'
              onClick={onToggleAnalytics}
              className='flex items-center justify-center rounded-lg px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap text-muted-foreground hover:bg-muted/50 transition-colors active:bg-muted'
            >
              {isAnalytics ? 'Cal' : 'Tab'}
            </button>
          )}

          {children}
          
          <Select value={viewMode} onValueChange={(v) => onViewModeChange(v as CalendarViewMode)}>
            <SelectTrigger size='sm' className='h-8 shrink-0 gap-1 rounded-lg border-border bg-card px-2 py-1.5 text-[12px] font-medium text-foreground hover:bg-muted/50 transition-colors'>
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

        {/* Today button — just outside nav group's right edge */}
        {showTodayButton && (
          <div
            className='absolute top-1/2 -translate-y-1/2'
            style={todayButtonSide === 'left'
              ? { right: 'calc(50% + 130px)' }
              : { left: 'calc(50% + 130px)' }
            }
          >
            <Button
              type='button'
              variant='link'
              onClick={onToday}
              className='max-sm:hidden items-center px-0 text-[13px] font-medium whitespace-nowrap sm:h-9'
            >
              {todayLabel}
            </Button>
          </div>
        )}

        {/* Right wing: view switcher */}
        <div className='flex shrink-0 items-center gap-3'>
          <div className='flex items-center gap-1'>
            {children}
            {viewSwitcher}
          </div>
        </div>
      </div>
    </div>
  )
}
