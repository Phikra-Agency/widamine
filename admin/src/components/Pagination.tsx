import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useCallback, useRef } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {

  const touchStart = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const delta = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0 && currentPage < totalPages) onPageChange(currentPage + 1)
      if (delta < 0 && currentPage > 1) onPageChange(currentPage - 1)
    }
    touchStart.current = null
  }, [currentPage, totalPages, onPageChange])

  return (
    <div
      className='flex items-center justify-center gap-3 border-t border-border px-4 py-3 select-none'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='h-8 w-8'
      >
        <CaretLeft size={14} />
      </Button>
      <span className='text-xs text-muted-foreground tabular-nums'>
        Page {currentPage} sur {totalPages}
      </span>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='h-8 w-8'
      >
        <CaretRight size={14} />
      </Button>
    </div>
  )
}
