import type { Column } from '@tanstack/react-table'
import { Funnel } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ColumnFilterOption } from './column-meta'

interface DataTableColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>
  filterColumnId?: string
  options: ColumnFilterOption[]
  placeholder?: string
}

export function DataTableColumnFilter<TData, TValue>({
  column,
  filterColumnId,
  options,
  placeholder = 'Tous',
}: DataTableColumnFilterProps<TData, TValue>) {
  if (!column) return null
  const table = column.table
  if (!table) return null
  const targetColumn = filterColumnId ? table.getColumn(filterColumnId) : column
  if (!targetColumn) return null

  const filterValue = (targetColumn.getFilterValue() as string | undefined) ?? 'all'
  const isActive = filterValue !== 'all' && filterValue !== '' && filterValue != null
  const activeLabel = options.find((option) => option.value === filterValue)?.label ?? placeholder

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-6 max-w-full cursor-pointer items-center gap-1 rounded-element border px-1.5 text-[10px] font-medium transition-colors',
          isActive
            ? 'border-border-strong bg-card/80 text-foreground'
            : 'border-transparent text-muted-foreground hover:border-border-subtle hover:bg-muted/40 hover:text-foreground',
        )}
        title={`Filtrer : ${activeLabel}`}
      >
        <Funnel size={11} className={cn('shrink-0', isActive && 'text-primary/80')} />
        <span className='truncate'>{isActive ? activeLabel : placeholder}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='max-h-64 min-w-[10rem] overflow-y-auto'>
        <DropdownMenuItem onClick={() => targetColumn.setFilterValue('all')}>
          {placeholder}
        </DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => targetColumn.setFilterValue(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
