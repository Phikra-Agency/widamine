import { CaretLeft, CaretRight } from '@phosphor-icons/react'

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
    <div className='flex items-center justify-between px-6 py-4 border-t border-secondary/10'>
      <span className='text-xs text-secondary/50'>
        Page {currentPage} sur {totalPages}
      </span>
      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-1.5 rounded-lg text-secondary/50 hover:text-secondary hover:bg-secondary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <CaretLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className='px-2 text-xs text-secondary/40'>...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary/60 hover:bg-secondary/5 hover:text-secondary'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-1.5 rounded-lg text-secondary/50 hover:text-secondary hover:bg-secondary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  )
}
