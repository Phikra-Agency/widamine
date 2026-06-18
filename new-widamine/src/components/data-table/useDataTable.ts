import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type TableOptions,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

type UseDataTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  globalFilter?: string
  columnFilters?: ColumnFiltersState
  sorting?: SortingState
  pagination?: PaginationState
  enableSorting?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  pageSize?: number
  globalFilterFn?: TableOptions<TData>['globalFilterFn']
  onPaginationChange?: OnChangeFn<PaginationState>
  onSortingChange?: OnChangeFn<SortingState>
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  initialColumnVisibility?: Record<string, boolean>
} & Pick<TableOptions<TData>, 'getRowId'>

export function useDataTable<TData>({
  data,
  columns,
  globalFilter: controlledGlobalFilter,
  columnFilters: controlledColumnFilters,
  sorting: controlledSorting,
  pagination: controlledPagination,
  enableSorting = true,
  enableGlobalFilter = true,
  enablePagination = false,
  pageSize = 10,
  globalFilterFn,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  initialColumnVisibility,
  getRowId,
}: UseDataTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  return useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting: controlledSorting ?? sorting,
      columnFilters: controlledColumnFilters ?? columnFilters,
      globalFilter: controlledGlobalFilter ?? globalFilter,
      pagination: controlledPagination ?? pagination,
    },
    onSortingChange: onSortingChange ?? (controlledSorting ? undefined : setSorting),
    onColumnFiltersChange: onColumnFiltersChange ?? (controlledColumnFilters ? undefined : setColumnFilters),
    onGlobalFilterChange: controlledGlobalFilter ? undefined : setGlobalFilter,
    onPaginationChange: onPaginationChange ?? (controlledPagination ? undefined : setPagination),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableSorting,
    enableGlobalFilter,
    globalFilterFn,
    autoResetPageIndex: true,
    initialState: {
      columnVisibility: initialColumnVisibility,
    },
  })
}
