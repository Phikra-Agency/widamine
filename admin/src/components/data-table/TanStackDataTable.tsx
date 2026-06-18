import type { IllustrationProps } from '@/components/illustrations'
import { flexRender, type Row, type Table as TanStackTable } from '@tanstack/react-table'
import DataTable from './DataTable'
import './column-meta'

interface TanStackDataTableProps<TData> {
  table: TanStackTable<TData>
  loading?: boolean
  emptyIllustration: React.ComponentType<IllustrationProps>
  emptyTitle: string
  emptyDescription?: string
  onRowClick?: (row: TData) => void
  stopClickOnColumns?: string[]
  className?: string
}

export function TanStackDataTable<TData>({
  table,
  loading = false,
  emptyIllustration,
  emptyTitle,
  emptyDescription,
  onRowClick,
  stopClickOnColumns = ['actions'],
  className,
}: TanStackDataTableProps<TData>) {
  const colCount = table.getAllColumns().length
  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Desktop className={className}>
      <DataTable.Table>
        <DataTable.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <DataTable.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta
                return (
                  <DataTable.Head
                    key={header.id}
                    align={meta?.align}
                    width={meta?.width}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </DataTable.Head>
                )
              })}
            </DataTable.Row>
          ))}
        </DataTable.Header>
        <DataTable.Body>
          {loading && <DataTable.Loading colSpan={colCount} />}
          {isEmpty && (
            <DataTable.Empty
              colSpan={colCount}
              illustration={emptyIllustration}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
          {!loading &&
            rows.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                onRowClick={onRowClick}
                stopClickOnColumns={stopClickOnColumns}
              />
            ))}
        </DataTable.Body>
      </DataTable.Table>
    </DataTable.Desktop>
  )
}

function DataTableRow<TData>({
  row,
  onRowClick,
  stopClickOnColumns,
}: {
  row: Row<TData>
  onRowClick?: (row: TData) => void
  stopClickOnColumns: string[]
}) {
  return (
    <DataTable.Row
      interactive={!!onRowClick}
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta
        const stopClick = stopClickOnColumns.includes(cell.column.id)

        return (
          <DataTable.Cell
            key={cell.id}
            align={meta?.align}
            truncate={meta?.truncate}
            onClick={stopClick ? (e) => e.stopPropagation() : undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataTable.Cell>
        )
      })}
    </DataTable.Row>
  )
}
