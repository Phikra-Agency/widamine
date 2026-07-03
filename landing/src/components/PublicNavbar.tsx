import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarBlank as CalendarDays, CaretDown as ChevronDown, List as Menu, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { SERVICE_PAGES, ICON_MAP } from '@/lib/siteContent'

type PublicNavbarProps = {
  theme?: 'light' | 'dark'
}

const CATEGORY_LABELS: Record<string, string> = { visage: 'Visage', corps: 'Corps', techniques: 'Techniques' }

const MEGA_CATEGORIES = (['visage', 'corps', 'techniques'] as const).map((cat) => ({
  slug: cat,
  label: CATEGORY_LABELS[cat],
  items: SERVICE_PAGES.filter((p) => p.category === cat).map((p) => ({
    label: p.title,
    href: `/services/${p.slug}`,
    icon: ICON_MAP[p.slug] || '',
  })),
}))

export default function PublicNavbar({ theme = 'light' }: PublicNavbarProps) {
  const { pathname } = useLocation()
  const { open } = useScheduleModalStore()
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)

  const isLight = theme === 'light'
  const isContact = pathname === '/contact'

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setOpenCategory(null)
  }, [pathname])

  useEffect(() => {
    const scrollEl = document.getElementById('app-scroll')
    const getY = () => (scrollEl ? scrollEl.scrollTop : window.scrollY)
    const onScroll = () => setIsScrolled(getY() > 12)
    onScroll()

    if (scrollEl) {
      scrollEl.addEventListener('scroll', onScroll, { passive: true })
      return () => scrollEl.removeEventListener('scroll', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setOpenCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenCategory(null)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleCategoryClick = (slug: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setOpenCategory((current) => current === slug ? null : slug)
  }

  const handleMouseEnter = (slug: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setOpenCategory(slug)
  }

  const handleMouseLeave = () => {
    megaTimeout.current = setTimeout(() => setOpenCategory(null), 150)
  }

  const navShellClass = isLight
    ? isScrolled
      ? 'border-secondary/12 bg-custom-white/98 shadow-[0_18px_50px_rgba(0,0,0,0.10)] backdrop-blur-[52px]'
      : 'border-secondary/10 bg-custom-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl'
    : isScrolled
      ? 'border-white/16 bg-[rgba(11,28,43,0.72)] shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-xl'
      : 'border-white/14 bg-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-xl'
  const textClass = isLight ? 'text-secondary/80' : 'text-white/82'
  const hoverClass = isLight ? 'hover:text-secondary' : 'hover:text-white'
  const activeClass = isLight ? 'text-secondary' : 'text-white'
  const iconButtonClass = isLight
    ? 'border-secondary/15 bg-custom-white/80 text-secondary/80 hover:bg-custom-white'
    : 'border-white/16 bg-white/10 text-white'
  const ctaClass = isLight
    ? 'bg-primary text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl'
    : 'bg-primary text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)] hover:bg-primary/90 hover:-translate-y-0.5'

  return (
    <motion.header
      className='fixed left-0 right-0 top-2 z-[180] sm:top-4 lg:top-6'
      initial={{ opacity: 0, y: -14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.22 }}
    >
      <div className='mx-auto w-full max-w-5xl px-2.5 sm:px-6'>
        <nav
          className={`relative flex items-center justify-between rounded-full border px-2.5 py-2 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 sm:px-5 sm:py-3 lg:px-6 ${navShellClass}`}
        >
          <Link to='/' className='flex shrink-0 cursor-pointer items-center'>
            <img src='/logo.svg' alt='Widamine' className='h-8 w-auto object-contain sm:hidden' />
            <img src='/logo-widamine.svg' alt='Widamine' className='hidden h-8 w-auto object-contain sm:block sm:h-10' />
          </Link>

          <div ref={megaRef} className={`hidden items-center gap-5 text-sm lg:flex ${textClass}`}>
            {MEGA_CATEGORIES.map((cat) => {
              const isCategoryActive = pathname === `/category/${cat.slug}` || cat.items.some((item) => pathname === item.href)
              const isOpen = openCategory === cat.slug

              return (
                <div key={cat.slug} className='relative' onMouseEnter={() => handleMouseEnter(cat.slug)} onMouseLeave={handleMouseLeave}>
                  <button
                    type='button'
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 capitalize transition-colors ${isCategoryActive ? activeClass : hoverClass}`}
                    aria-haspopup='menu'
                    aria-expanded={isOpen}
                  >
                    {cat.label}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen ? (
                      <motion.div
                        key={cat.slug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ type: 'spring', visualDuration: 0.38, bounce: 0.14 }}
                        className='absolute left-1/2 top-full z-[999] mt-5 hidden w-[min(84vw,430px)] -translate-x-1/2 lg:block'
                      >
                        <div className='relative overflow-hidden rounded-[22px] border border-secondary/12 bg-custom-white/98 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.13)] backdrop-blur-[56px]'>
                          <Link
                            to={`/category/${cat.slug}`}
                            onClick={() => setOpenCategory(null)}
                            className='mb-2 block rounded-2xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/7'
                          >
                            Tous les traitements {cat.label}
                          </Link>
                          <div className='grid gap-1'>
                            {cat.items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setOpenCategory(null)}
                                className='group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-secondary/72 transition-colors hover:bg-primary/8 hover:text-secondary'
                              >
                                {item.icon ? (
                                  <img src={item.icon} alt='' className='h-7 w-7 object-contain opacity-70 group-hover:opacity-100' loading='lazy' />
                                ) : null}
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            <Link
              to='/contact'
              className={`hidden cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 md:inline-flex ${isLight ? 'border-secondary/70 text-secondary hover:bg-white/40' : 'border-white/35 text-white hover:bg-white/10'} ${isContact ? activeClass : ''}`}
            >
              contacter nous
            </Link>
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10 lg:hidden ${iconButtonClass}`}
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              type='button'
              onClick={open}
              aria-label='Réserver une consultation'
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${ctaClass} ${isLight ? '' : 'hidden md:inline-flex'}`}
            >
              <CalendarDays size={16} className='hidden sm:block' />
              Réserver
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`relative z-[9999] mt-2 overflow-hidden rounded-[1.2rem] border shadow-[0_18px_50px_rgba(0,0,0,0.10)] backdrop-blur-[52px] lg:hidden ${isLight ? 'border-secondary/12 bg-custom-white/98' : 'border-white/14 bg-[rgba(11,28,43,0.82)] text-white'}`}
            >
              <div className='max-h-[78dvh] space-y-1 overflow-y-auto p-2.5 sm:p-4'>
                <Link to='/' className={`block cursor-pointer rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Accueil
                </Link>
                {MEGA_CATEGORIES.map((cat) => (
                  <div key={cat.slug}>
                    <div className={`px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.26em] ${isLight ? 'text-primary/72' : 'text-white/60'}`}>
                      {cat.label}
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${isLight ? 'text-secondary/70 hover:bg-primary/7 hover:text-secondary' : 'text-white/72 hover:bg-white/10 hover:text-white'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon ? <img src={item.icon} alt='' className='h-5 w-5 object-contain opacity-60' loading='lazy' /> : null}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link to='/appointment' className={`block cursor-pointer rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Rendez-vous
                </Link>
                <Link to='/contact' className={`block cursor-pointer rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    open()
                  }}
                  className='mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)]'
                >
                  <CalendarDays size={16} />
                  Réserver
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
