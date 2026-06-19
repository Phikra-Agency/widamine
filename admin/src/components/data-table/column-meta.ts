import '@tanstack/react-table'

export type ColumnFilterOption = {
  value: string
  label: string
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
    width?: 'actions' | 'narrow' | 'wide'
    truncate?: boolean
    filterOptions?: ColumnFilterOption[]
    filterColumnId?: string
    filterPlaceholder?: string
    searchable?: boolean
  }
}
