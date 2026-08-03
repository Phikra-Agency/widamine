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
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)

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

  return (
    <motion.header
      className='fixed left-0 right-0 top-6 z-[180]'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className='mx-auto w-full max-w-6xl px-4'>
        <nav
          className='relative flex items-center justify-between rounded-full px-6 py-4 transition-all duration-300'
          style={{
            background: C.secondary,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          <Link to='/' className='flex shrink-0 cursor-pointer items-center'>
            <img src='/logo.svg' alt='Widamine' className='h-10 w-auto object-contain brightness-0 invert' />
          </Link>

          {/* Desktop Nav Links */}
          <div ref={megaRef} className='hidden items-center gap-8 lg:flex'>
            <div
              className='relative'
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                type='button'
                onClick={handleServicesClick}
                className={`inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium text-white/90 transition-colors duration-200 hover:text-white ${isServicesActive ? 'text-white' : ''}`}
                aria-haspopup='menu'
                aria-expanded={isServicesOpen}
              >
                Services
                <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
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

            <Link
              to='/about'
              className={`text-[15px] font-medium transition-colors duration-200 ${pathname === '/about' ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              À propos
            </Link>

            <Link
              to='/contact'
              className={`text-[15px] font-medium transition-colors duration-200 ${isContact ? 'text-white' : 'text-white/90 hover:text-white'}`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side - CTA */}
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden'
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <X size={20} weight='regular' /> : <Menu size={20} weight='regular' />}
            </button>

            <button
              type='button'
              onClick={open}
              aria-label='Prendre rendez-vous'
              className='hidden cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-[15px] font-semibold transition-all hover:scale-105 active:scale-95 lg:inline-flex'
              style={{ color: C.primary }}
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
              className='relative z-[9999] mt-3 overflow-hidden rounded-3xl shadow-xl backdrop-blur-xl lg:hidden'
              style={{ background: C.secondary, border: `1px solid ${C.secondary}` }}
            >
              <div className='max-h-[78dvh] space-y-1 overflow-y-auto p-4'>
                <Link 
                  to='/' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white' 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                {MEGA_CATEGORIES.map((cat) => (
                  <div key={cat.slug}>
                    <div className='px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-white/60'>
                      {cat.label}
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className='flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ServiceIcon slug={item.slug} size={20} color='white' className='opacity-70' />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link 
                  to='/about' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white' 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link 
                  to='/contact' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white' 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    open()
                  }}
                  className='mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold transition-all active:scale-95'
                  style={{ color: C.primary }}
                >
                  Réserver un rendez-vous
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
