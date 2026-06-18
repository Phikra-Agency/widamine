import type { Row } from '@tanstack/react-table'

export function globalSearchFilter<TData>(
  row: Row<TData>,
  _columnId: string,
  filterValue: unknown,
  fields: (keyof TData)[],
): boolean {
  const term = String(filterValue ?? '').trim().toLowerCase()
  if (!term) return true
  return fields.some((field) => {
    const value = row.original[field]
    return value != null && String(value).toLowerCase().includes(term)
  })
}

export function equalsOrAllFilter(
  filterValue: unknown,
  rowValue: unknown,
  allSentinels: unknown[] = ['all', '', null, undefined],
): boolean {
  if (allSentinels.includes(filterValue)) return true
  return rowValue === filterValue
}
