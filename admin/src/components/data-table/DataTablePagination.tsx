import type { Table as TanStackTable } from '@tanstack/react-table'
import Pagination from '@/components/Pagination'

interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  return (
    <Pagination
      currentPage={pageIndex + 1}
      totalPages={pageCount}
      onPageChange={(page) => table.setPageIndex(page - 1)}
    />
  )
}
