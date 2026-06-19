import type { Column } from '@tanstack/react-table'
import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DataTableColumnFilter } from './DataTableColumnFilter'
import { DataTableColumnSearch } from './DataTableColumnSearch'

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sorted = column.getCanSort() ? column.getIsSorted() : false
  const filterMeta = column.columnDef.meta?.filterOptions
  const filterColumnId = column.columnDef.meta?.filterColumnId

  const titleNode = column.getCanSort() ? (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className='-ml-2 h-7 max-w-full px-2 font-medium hover:bg-muted/60'
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      <span className='truncate'>{title}</span>
      {sorted === 'asc' ? (
        <CaretUp size={14} className='shrink-0 text-muted-foreground' />
      ) : sorted === 'desc' ? (
        <CaretDown size={14} className='shrink-0 text-muted-foreground' />
      ) : (
        <CaretUpDown size={14} className='shrink-0 text-muted-foreground/50' />
      )}
    </Button>
  ) : (
    <span className={cn('text-xs font-medium', className)}>{title}</span>
  )

  if (!filterMeta?.length) {
    return <div className={cn('min-w-0', className)}>{titleNode}</div>
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {titleNode}
      <DataTableColumnFilter
        column={column}
        filterColumnId={filterColumnId}
        options={filterMeta}
        placeholder={column.columnDef.meta?.filterPlaceholder}
      />
    </div>
  )
}
