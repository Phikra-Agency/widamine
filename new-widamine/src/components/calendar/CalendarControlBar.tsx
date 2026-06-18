import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Funnel,
  ListBullets,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { MotifFamilyKey } from '@/lib/motifFamilies'

interface CalendarControlBarProps {
  weekLabel: string
  slotCount: number
  searchTerm: string
  onSearchChange: (term: string) => void
  showLegend: boolean
  onToggleLegend: () => void
  showFilters: boolean
  onToggleFilters: () => void
  activeFilterCount: number
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  dateValue: string
  onDateChange: (date: string) => void
  children?: React.ReactNode
  compact?: boolean
}

export default function CalendarControlBar({
  weekLabel,
  slotCount,
  searchTerm,
  onSearchChange,
  showLegend,
  onToggleLegend,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onPrevWeek,
  onNextWeek,
  onToday,
  dateValue,
  onDateChange,
  children,
  compact = false,
}: CalendarControlBarProps) {
  return (
    <div className='space-y-3 border-b border-border bg-card px-4 py-3 sm:px-5 lg:px-6'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onToggleLegend}
          className={cn(
            'h-9 rounded-xl text-[11px]',
            showLegend && 'border-primary/25 bg-primary/8 text-primary hover:bg-primary/8',
          )}
        >
          <ListBullets size={14} />
          Légende
        </Button>

        <div className='relative min-w-[10rem] flex-1 sm:max-w-xs'>
          <MagnifyingGlass
            size={14}
            className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-secondary/35'
          />
          <Input
            type='search'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Motif, patient, salle…'
            className='h-9 pl-9 text-[12px]'
          />
        </div>

        <div className='relative'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onToggleFilters}
            className='h-9 rounded-xl text-[11px]'
          >
            <Funnel size={14} />
            Filtres
            {activeFilterCount > 0 && (
              <Badge className='h-[18px] min-w-[18px] rounded-full px-1 text-[10px]'>{activeFilterCount}</Badge>
            )}
          </Button>
          {showFilters && children}
        </div>

        <Button type='button' variant='outline' size='sm' onClick={onToday} className='h-9 rounded-xl text-[11px]'>
          Aujourd&apos;hui
        </Button>

        <div className='inline-flex items-center gap-1'>
          <Button type='button' variant='outline' size='icon-sm' onClick={onPrevWeek} className='h-9 w-9 rounded-xl'>
            <CaretLeft size={16} />
          </Button>
          <Button type='button' variant='outline' size='icon-sm' onClick={onNextWeek} className='h-9 w-9 rounded-xl'>
            <CaretRight size={16} />
          </Button>
        </div>

        {!compact && (
          <label className='inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-[12px] text-secondary/70'>
            <CalendarBlank size={14} className='text-secondary/40' />
            <input
              type='date'
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className='bg-transparent text-[12px] outline-none'
            />
          </label>
        )}
      </div>

      <div className='flex flex-wrap items-end justify-between gap-2'>
        <p className='text-sm font-medium text-secondary'>{weekLabel}</p>
        <p className='text-[11px] text-secondary/45'>{slotCount} créneaux</p>
      </div>
    </div>
  )
}

export type { MotifFamilyKey }
