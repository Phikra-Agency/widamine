import type { Column } from '@tanstack/react-table'
import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>
  }

  const sorted = column.getIsSorted()

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className={cn('-ml-2 h-8 px-2 font-medium hover:bg-muted/60', className)}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'asc' ? (
        <CaretUp size={14} className='text-muted-foreground' />
      ) : sorted === 'desc' ? (
        <CaretDown size={14} className='text-muted-foreground' />
      ) : (
        <CaretUpDown size={14} className='text-muted-foreground/50' />
      )}
    </Button>
  )
}
