import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function DataTableRoot({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('min-h-0', className)}>{children}</div>
}

function DataTableToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-border-subtle bg-background px-4 py-2.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

function DataTableDesktop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('hidden lg:block', className)}>{children}</div>
}

function DataTableMobile({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('lg:hidden', className)}>{children}</div>
}

function DataTableMobileList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-2 p-3', className)}>{children}</div>
}

function DataTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader className={cn('bg-background', className)} {...props} />
}

function DataTableHead({
  className,
  align = 'left',
  width,
  ...props
}: React.ComponentProps<typeof TableHead> & {
  align?: 'left' | 'right' | 'center'
  width?: 'actions' | 'narrow' | 'wide'
}) {
  return (
    <TableHead
      className={cn(
        'h-9 px-4 text-xs font-medium text-muted-foreground',
        width === 'actions' && 'w-[1%] whitespace-nowrap',
        width === 'narrow' && 'w-[1%] whitespace-nowrap',
        width === 'wide' && 'w-[40%]',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  )
}

function DataTableRow({ className, interactive, ...props }: React.ComponentProps<typeof TableRow> & { interactive?: boolean }) {
  return (
    <TableRow
      className={cn(
        'border-border-subtle',
        interactive && 'cursor-pointer hover:bg-primary/[0.04]',
        className,
      )}
      {...props}
    />
  )
}

function DataTableCell({
  className,
  align = 'left',
  truncate,
  ...props
}: React.ComponentProps<typeof TableCell> & {
  align?: 'left' | 'right' | 'center'
  truncate?: boolean
}) {
  return (
    <TableCell
      className={cn(
        'px-4 py-2.5 text-foreground',
        truncate && 'max-w-0 truncate',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  )
}

function DataTableRowActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('inline-flex items-center justify-end gap-0.5', className)}>{children}</div>
}

function DataTableMobileCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      className={cn(
        'rounded-xl border border-border-subtle bg-background px-4 py-3',
        onClick && 'cursor-pointer hover:bg-primary/[0.04]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function DataTableEmpty({
  icon: IconComponent,
  title,
  description,
  colSpan,
  className,
}: {
  icon: Icon
  title: string
  description?: string
  colSpan?: number
  className?: string
}) {
  const content = (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted'>
        <IconComponent size={24} className='text-muted-foreground/50' />
      </div>
      <div className='space-y-1'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
      </div>
    </div>
  )

  if (colSpan !== undefined) {
    return (
      <TableRow className='hover:bg-transparent'>
        <TableCell colSpan={colSpan} className='p-0'>
          {content}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className='rounded-xl border border-dashed border-border bg-background/80'>
      {content}
    </div>
  )
}

function DataTableLoading({ colSpan, rows = 5 }: { colSpan: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className='hover:bg-transparent'>
          <TableCell colSpan={colSpan} className='px-4 py-2.5'>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-8 shrink-0 rounded-lg bg-muted' />
              <div className='flex-1 space-y-1.5'>
                <div className='h-3 w-1/3 rounded bg-muted' />
                <div className='h-2.5 w-1/4 rounded bg-muted/70' />
              </div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const DataTable = {
  Root: DataTableRoot,
  Toolbar: DataTableToolbar,
  Desktop: DataTableDesktop,
  Mobile: DataTableMobile,
  MobileList: DataTableMobileList,
  MobileCard: DataTableMobileCard,
  Table,
  Header: DataTableHeader,
  Head: DataTableHead,
  Body: TableBody,
  Row: DataTableRow,
  Cell: DataTableCell,
  RowActions: DataTableRowActions,
  Empty: DataTableEmpty,
  Loading: DataTableLoading,
}

export default DataTable
