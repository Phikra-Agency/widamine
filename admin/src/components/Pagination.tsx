import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className='flex items-center justify-between border-t border-border px-6 py-4'>
      <span className='hidden text-xs text-muted-foreground lg:block'>
        Page {currentPage} sur {totalPages}
      </span>
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <CaretLeft size={16} />
        </Button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className='px-2 text-xs text-muted-foreground'>...</span>
          ) : (
            <Button
              key={p}
              type='button'
              variant={p === currentPage ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onPageChange(p)}
              className={cn('min-w-8', p === currentPage && 'shadow-sm')}
            >
              {p}
            </Button>
          )
        )}
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <CaretRight size={16} />
        </Button>
      </div>
    </div>
  )
}
