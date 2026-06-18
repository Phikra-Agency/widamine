import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGlobalSearchStore } from '@/stores/globalSearchStore'
import { cn } from '@/lib/utils'

interface SidebarSearchProps {
  collapsed?: boolean
  onExpand?: () => void
}

export default function SidebarSearch({ collapsed = false, onExpand }: SidebarSearchProps) {
  const term = useGlobalSearchStore((state) => state.term)
  const setTerm = useGlobalSearchStore((state) => state.setTerm)
  const clearTerm = useGlobalSearchStore((state) => state.clearTerm)

  if (collapsed) {
    return (
      <div className='bo-sidebar-search-collapsed'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={onExpand}
          aria-label='Rechercher'
          title='Rechercher'
        >
          <MagnifyingGlass size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div className='px-3'>
      <div className='relative'>
        <div className={cn('bo-sidebar-search-field', term && 'pr-8')}>
          <MagnifyingGlass size={14} className='shrink-0 text-muted-foreground/40' />
          <Input
            type='search'
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder='Rechercher…'
            className='bo-sidebar-search-input border-0 px-0 py-0'
          />
        </div>
        {term && (
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            onClick={clearTerm}
            className='absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            aria-label='Effacer la recherche'
          >
            <X size={12} />
          </Button>
        )}
      </div>
    </div>
  )
}
