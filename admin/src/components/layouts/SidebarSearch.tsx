import { useState, useRef, useEffect, useCallback } from 'react'
import { MagnifyingGlass, X, User, CalendarBlank, Envelope, UserCircle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'
import api from '@/lib/api'

interface SearchResults {
  patients: Array<{ id: string; firstName: string; lastName: string; email?: string; phone: string }>
  appointments: Array<{ id: string; name: string; email: string; phone: string; status: string }>
  contacts: Array<{ id: string; name: string; email: string; context: string; read: boolean }>
  users: Array<{ id: string; name: string; email: string; role: string }>
}

interface SidebarSearchProps {
  collapsed?: boolean
  onExpand?: () => void
}

type ResultItem = { id: string; label: string; subtitle: string; route: string; type: string }

const GROUP_CONFIG = [
  { key: 'patients', icon: UserCircle, label: 'Patients', route: '/patients' },
  { key: 'appointments', icon: CalendarBlank, label: 'Rendez-vous', route: '/calendar' },
  { key: 'contacts', icon: Envelope, label: 'Contacts' },
  { key: 'users', icon: User, label: 'Utilisateurs', route: '/users' },
]

function extractItems(data: SearchResults): ResultItem[] {
  const items: ResultItem[] = []
  for (const { key, route } of GROUP_CONFIG) {
    const list = data[key as keyof SearchResults] as any[]
    if (!list || !list.length) continue
    for (const item of list) {
      items.push({
        id: item.id,
        label: key === 'patients' ? `${item.firstName} ${item.lastName}` : item.name,
        subtitle: key === 'patients' ? item.phone || item.email || '' : key === 'appointments' ? `${item.phone} · ${item.status}` : key === 'contacts' ? item.email : item.email || item.role,
        route: route ? `${route}` : '',
        type: key,
      })
    }
  }
  return items
}

export default function SidebarSearch({ collapsed = false, onExpand }: SidebarSearchProps) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const navigate = useNavigate()

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await api.get('/search', { params: { q } })
      setResults(data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useDebouncedCallback(doSearch, 300)

  const handleChange = (value: string) => {
    setTerm(value)
    setActiveIndex(-1)
    if (value.trim()) {
      setOpen(true)
      debouncedSearch(value)
    } else {
      setResults(null)
      setOpen(false)
    }
  }

  const clear = () => {
    setTerm('')
    setResults(null)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const items = results ? extractItems(results) : []
  const hasResults = items.length > 0

  const handleSelect = (item: ResultItem) => {
    setOpen(false)
    navigate(item.route, { state: { sh: `${item.type}:${item.id}` } })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !hasResults) {
      if (e.key === 'Escape') setOpen(false)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < items.length) {
          handleSelect(items[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    return () => clearTimeout(blurTimeoutRef.current)
  }, [])

  if (collapsed) {
    return (
      <div className='bo-sidebar-search-collapsed'>
        <button
          type='button'
          onClick={onExpand}
          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-white/10 hover:text-foreground'
          aria-label='Rechercher'
          title='Rechercher'
        >
          <MagnifyingGlass size={16} />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className='bo-sidebar-search-wrapper relative px-3'>
      <div className='flex items-center gap-1'>
        <div className='bo-sidebar-search-field flex-1'>
          <MagnifyingGlass size={14} className='shrink-0 text-muted-foreground/40' />
          <input
            ref={inputRef}
            type='search'
            value={term}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => { clearTimeout(blurTimeoutRef.current); if (term.trim()) setOpen(true) }}
            onBlur={() => { blurTimeoutRef.current = setTimeout(() => setOpen(false), 200) }}
            onKeyDown={handleKeyDown}
            placeholder='Rechercher…'
            className='bo-sidebar-search-input'
            autoComplete='off'
            spellCheck={false}
          />
        </div>
        {term && (
          <button
            type='button'
            onClick={clear}
            className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted/50 hover:text-foreground'
            aria-label='Effacer la recherche'
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className='absolute left-3 right-3 top-full mt-1 z-50 overflow-hidden rounded-xl border border-border-subtle bg-white shadow-lg'
        >
          {loading && (
            <div className='flex items-center justify-center px-3 py-8'>
              <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            </div>
          )}

          {!loading && !hasResults && (
            <div className='px-3 py-8 text-center'>
              <p className='text-xs text-muted-foreground/60'>Aucun résultat</p>
            </div>
          )}

          {!loading && hasResults && (
            <div className='max-h-[60vh] overflow-y-auto py-1'>
              {GROUP_CONFIG.map((group) => {
                const list = results?.[group.key as keyof SearchResults] as any[] | undefined
                if (!list || !list.length) return null
                const groupStartIndex = items.findIndex((i) => i.type === group.key)
                return (
                  <div key={group.key}>
                    <div className='flex items-center gap-2 px-3 py-1.5'>
                      <group.icon size={12} className='text-muted-foreground/40' />
                      <span className='text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/50'>{group.label}</span>
                      <span className='ml-auto text-[10px] text-muted-foreground/30'>{list.length}</span>
                    </div>
                    {list.map((item: any, idx: number) => {
                      const globalIdx = groupStartIndex + idx
                      const isActive = globalIdx === activeIndex
                      const label = group.key === 'patients' ? `${item.firstName} ${item.lastName}` : item.name
                      const subtitle = group.key === 'patients' ? item.phone || item.email || '' : group.key === 'appointments' ? `${item.phone} · ${item.status}` : group.key === 'contacts' ? item.email : item.email || item.role
                      return (
                        <button
                          key={item.id}
                          type='button'
                          onMouseDown={(e) => { e.preventDefault(); handleSelect({ id: item.id, label, subtitle, route: group.route || '', type: group.key }) }}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={cn(
                            'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                            isActive ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/40'
                          )}
                        >
                          <group.icon size={16} className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/40')} />
                          <div className='min-w-0 flex-1'>
                            <p className={cn('truncate text-xs', isActive ? 'text-foreground' : 'text-foreground/85')}>{label}</p>
                            <p className='truncate text-[10px] text-muted-foreground/50'>{subtitle}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
