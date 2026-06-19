import { type Column } from '@tanstack/react-table'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DataTableColumnSearchProps<TData, TValue> {
  column: Column<TData, TValue>
}

export function DataTableColumnSearch<TData, TValue>({
  column,
}: DataTableColumnSearchProps<TData, TValue>) {
  const filterValue = (column.getFilterValue() as string) ?? ''
  const hasValue = filterValue.length > 0

  return (
    <button
      type='button'
      onClick={() => {
        if (hasValue) {
          column.setFilterValue('')
        } else {
          const input = prompt('Rechercher:')
          if (input !== null) column.setFilterValue(input || '')
        }
      }}
      className={cn(
        'flex size-5 items-center justify-center rounded-element transition-colors',
        hasValue
          ? 'text-primary/80'
          : 'text-muted-foreground/40 hover:bg-muted/40 hover:text-foreground',
      )}
      title='Rechercher'
    >
      <MagnifyingGlass size={12} weight={hasValue ? 'bold' : 'regular'} />
    </button>
  )
}
