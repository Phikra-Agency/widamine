import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CaretDown as ChevronDown, List as Menu, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { SERVICE_PAGES } from '@/lib/siteContent'
import { ServiceIcon } from '@/components/ServiceIcon'
import { C } from '@/lib/theme'

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
    slug: p.slug,
  })),
}))

export default function PublicNavbar({ theme = 'light' }: PublicNavbarProps) {
  const { pathname } = useLocation()
  const { open } = useScheduleModalStore()
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)

  const isLight = theme === 'light'
  const isContact = pathname === '/contact'

  const isServicesActive =
    pathname === '/category/visage' ||
    pathname === '/category/corps' ||
    pathname === '/category/techniques' ||
    MEGA_CATEGORIES.some((cat) => cat.items.some((item) => pathname === item.href))

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsServicesOpen(false)
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
        setIsServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsServicesOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleServicesClick = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setIsServicesOpen((current) => !current)
  }

  const handleServicesEnter = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setIsServicesOpen(true)
  }

  const handleServicesLeave = () => {
    megaTimeout.current = setTimeout(() => setIsServicesOpen(false), 150)
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
            <div
              className='relative'
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                type='button'
                onClick={handleServicesClick}
                className={`inline-flex cursor-pointer items-center gap-1.5 capitalize transition-colors duration-150 ${isServicesActive ? activeClass : hoverClass}`}
                aria-haspopup='menu'
                aria-expanded={isServicesOpen}
              >
                Services
                <ChevronDown size={13} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isServicesOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ type: 'spring', visualDuration: 0.3, bounce: 0 }}
                    className='absolute left-1/2 top-full z-[999] mt-6 hidden w-[min(92vw,800px)] -translate-x-1/2 lg:block'
                  >
                    <div className='relative overflow-hidden rounded-3xl border border-secondary/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl'>
                      <div className='grid grid-cols-3 gap-6'>
                        {MEGA_CATEGORIES.map((cat) => (
                          <div key={cat.slug} className='space-y-3'>
                            <Link
                              to={`/category/${cat.slug}`}
                              onClick={() => setIsServicesOpen(false)}
                              className='group mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all hover:bg-primary/5'
                              style={{ color: C.primary }}
                            >
                              {cat.label}
                              <svg className='h-4 w-4 transition-transform group-hover:translate-x-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 5l7 7-7 7' />
                              </svg>
                            </Link>
                            <div className='space-y-1'>
                              {cat.items.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.href}
                                  onClick={() => setIsServicesOpen(false)}
                                  className='group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all hover:bg-primary/6 hover:pl-5'
                                  style={{ color: C.secondary }}
                                >
                                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110' style={{ background: `${C.primary}08` }}>
                                    <ServiceIcon slug={item.slug} size={22} color={C.primary} />
                                  </div>
                                  <span className='truncate font-medium opacity-85 transition-opacity group-hover:opacity-100'>{item.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bottom CTA bar */}
                      <div className='mt-6 flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/5 px-6 py-4'>
                        <div>
                          <div className='text-sm font-semibold' style={{ color: C.secondary }}>Besoin d'aide pour choisir ?</div>
                          <div className='text-xs opacity-70' style={{ color: C.secondary }}>Contactez-nous pour une consultation gratuite</div>
                        </div>
                        <Link
                          to='/contact'
                          onClick={() => setIsServicesOpen(false)}
                          className='inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95'
                          style={{ background: C.primary }}
                        >
                          Contactez-nous
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            <Link
              to='/about'
              className={`hidden cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-[color,background-color,transform,border-color] duration-300 hover:-translate-y-0.5 md:inline-flex ${isLight ? 'border-secondary/70 text-secondary hover:bg-white/40' : 'border-white/35 text-white hover:bg-white/10'} ${pathname === '/about' ? activeClass : ''}`}
            >
              À propos
            </Link>
            <Link
              to='/contact'
              className={`hidden cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-[color,background-color,transform,border-color] duration-300 hover:-translate-y-0.5 md:inline-flex ${isLight ? 'border-secondary/70 text-secondary hover:bg-white/40' : 'border-white/35 text-white hover:bg-white/10'} ${isContact ? activeClass : ''}`}
            >
              Contacter Nous
            </Link>
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-[color,background-color,border-color] duration-300 lg:hidden ${iconButtonClass}`}
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <X size={18} weight='regular' /> : <Menu size={18} weight='regular' />}
            </button>
            <button
              type='button'
              onClick={open}
              aria-label='Prendre rendez-vous'
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform duration-150 active:scale-[0.96] ${ctaClass} ${isLight ? '' : 'hidden md:inline-flex'}`}
            >
              Rendez-vous
            </button>
          </div>
        </nav>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`relative z-[9999] mt-2 overflow-hidden rounded-[1.2rem] border shadow-[0_18px_50px_rgba(0,0,0,0.10)] backdrop-blur-[52px] lg:hidden ${isLight ? 'border-secondary/12 bg-custom-white/98' : 'border-white/14 bg-[rgba(11,28,43,0.82)] text-white'}`}
            >
              <div className='max-h-[78dvh] space-y-1 overflow-y-auto p-2.5 sm:p-4'>
                <Link to='/' className={`block cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Accueil
                </Link>
                {MEGA_CATEGORIES.map((cat) => (
                  <div key={cat.slug}>
                    <div className={`px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-primary/72' : 'text-white/60'}`}>
                      {cat.label}
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-colors ${isLight ? 'text-secondary/72 hover:bg-primary/8 hover:text-secondary' : 'text-white/72 hover:bg-white/10 hover:text-white'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ServiceIcon slug={item.slug} size={20} color={C.secondary} className='opacity-60' />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link to='/about' className={`block cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  À propos
                </Link>
                <Link to='/contact' className={`block cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    open()
                  }}
                  className='mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)]'
                >
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
