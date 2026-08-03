import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CaretDown as ChevronDown, List as Menu, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { ServiceIcon } from '@/components/ServiceIcon'
import { C } from '@/lib/theme'
import { useServices } from '@/hooks/useServices'

type PublicNavbarProps = {
  theme?: 'light' | 'dark'
}

const CATEGORY_LABELS: Record<string, string> = { visage: 'Visage', corps: 'Corps', techniques: 'Techniques' }

export default function PublicNavbar({ theme = 'light' }: PublicNavbarProps) {
  const { pathname } = useLocation()
  const { open } = useScheduleModalStore()
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaRef = useRef<HTMLDivElement>(null)

  // Fetch services dynamically from API
  const { byCategory, loading } = useServices()

  // Build dynamic categories - filter out empty ones
  const MEGA_CATEGORIES = [
    {
      slug: 'visage',
      label: 'Visage',
      items: byCategory.visage.map(s => ({
        label: s.name,
        href: `/services/${s.slug}`,
        slug: s.slug,
      }))
    },
    {
      slug: 'corps',
      label: 'Corps',
      items: byCategory.corps.map(s => ({
        label: s.name,
        href: `/services/${s.slug}`,
        slug: s.slug,
      }))
    },
    {
      slug: 'techniques',
      label: 'Techniques',
      items: byCategory.techniques.map(s => ({
        label: s.name,
        href: `/services/${s.slug}`,
        slug: s.slug,
      }))
    },
  ].filter(cat => cat.items.length > 0) // Hide empty categories

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
            background: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: `1px solid ${C.primary}15`,
          }}
        >
          <Link to='/' className='flex shrink-0 cursor-pointer items-center'>
            <img src='/logo.svg' alt='Widamine' className='h-10 w-auto object-contain' />
          </Link>

          {/* Desktop Nav Links - Centered */}
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-8 lg:flex'>
            <div
              ref={megaRef}
              className='relative'
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                type='button'
                onClick={handleServicesClick}
                className='inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium transition-all duration-300 ease-out'
                style={{ color: isServicesActive ? C.primary : C.secondary, opacity: isServicesActive ? 1 : 0.85 }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => { 
                  if (!isServicesActive) e.currentTarget.style.opacity = '0.85'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                aria-haspopup='menu'
                aria-expanded={isServicesOpen}
              >
                Services
                <ChevronDown size={14} weight='bold' className={`transition-all duration-300 ease-out ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isServicesOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                      scale: { duration: 0.25 }
                    }}
                    className='absolute left-1/2 top-[calc(100%+8px)] z-[999] hidden -translate-x-1/2 lg:block'
                    style={{ 
                      width: MEGA_CATEGORIES.length === 1 ? '320px' : MEGA_CATEGORIES.length === 2 ? '580px' : '850px',
                      transformOrigin: 'top center'
                    }}
                  >
                    <div 
                      className='relative overflow-hidden rounded-3xl bg-white p-8' 
                      style={{ 
                        boxShadow: '0 20px 70px rgba(0,0,0,0.15), 0 4px 20px rgba(0,159,214,0.08)',
                        border: `1px solid ${C.primary}12`
                      }}
                    >
                      {/* Top connecting line effect */}
                      <div 
                        className='absolute top-0 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full'
                        style={{ 
                          background: `linear-gradient(90deg, transparent, ${C.primary}30, transparent)`,
                          top: '-4px'
                        }}
                      />
                      
                      <div className={`grid gap-8 ${MEGA_CATEGORIES.length === 1 ? 'grid-cols-1' : MEGA_CATEGORIES.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {MEGA_CATEGORIES.map((cat, catIndex) => (
                          <motion.div 
                            key={cat.slug} 
                            className='space-y-3'
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: catIndex * 0.05,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1]
                            }}
                          >
                            <Link
                              to={`/category/${cat.slug}`}
                              onClick={() => setIsServicesOpen(false)}
                              className='group mb-5 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:bg-primary/5'
                              style={{ color: C.primary }}
                            >
                              {cat.label}
                              <svg className='h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 5l7 7-7 7' />
                              </svg>
                            </Link>
                            <div className='space-y-1'>
                              {cat.items.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.href}
                                  onClick={() => setIsServicesOpen(false)}
                                  className='group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 hover:bg-primary/6 hover:pl-4'
                                  style={{ color: C.secondary }}
                                >
                                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3' style={{ background: `${C.primary}10` }}>
                                    <ServiceIcon slug={item.slug} size={20} color={C.primary} />
                                  </div>
                                  <span className='truncate font-medium opacity-85 transition-opacity duration-200 group-hover:opacity-100'>{item.label}</span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Bottom CTA bar */}
                      <motion.div 
                        className='mt-8 flex items-center justify-between rounded-2xl px-6 py-4' 
                        style={{ background: `${C.primary}08`, border: `1px solid ${C.primary}15` }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div>
                          <div className='text-sm font-semibold' style={{ color: C.secondary }}>Besoin d'aide pour choisir ?</div>
                          <div className='text-xs opacity-70' style={{ color: C.secondary }}>Contactez-nous pour une consultation gratuite</div>
                        </div>
                        <Link
                          to='/contact'
                          onClick={() => setIsServicesOpen(false)}
                          className='inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:scale-95'
                          style={{ background: C.primary, boxShadow: '0 4px 16px rgba(0,159,214,0.25)' }}
                        >
                          Contactez-nous
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <Link
              to='/about'
              className='text-[15px] font-medium transition-all duration-300 ease-out'
              style={{ color: pathname === '/about' ? C.primary : C.secondary, opacity: pathname === '/about' ? 1 : 0.85 }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => { 
                if (pathname !== '/about') e.currentTarget.style.opacity = '0.85'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              À propos
            </Link>

            <Link
              to='/contact'
              className='text-[15px] font-medium transition-all duration-300 ease-out'
              style={{ color: isContact ? C.primary : C.secondary, opacity: isContact ? 1 : 0.85 }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => { 
                if (!isContact) e.currentTarget.style.opacity = '0.85'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Contact
            </Link>
          </div>

          {/* Right Side - CTA */}
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-out lg:hidden'
              style={{ color: C.secondary, background: `${C.primary}08` }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = `${C.primary}15`
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = `${C.primary}08`
                e.currentTarget.style.transform = 'scale(1)'
              }}
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <X size={20} weight='regular' /> : <Menu size={20} weight='regular' />}
            </button>

            <button
              type='button'
              onClick={open}
              aria-label='Prendre rendez-vous'
              className='hidden cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-semibold text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:scale-95 lg:inline-flex'
              style={{ background: C.primary, boxShadow: '0 4px 16px rgba(0,159,214,0.25)' }}
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
              className='relative z-[9999] mt-3 overflow-hidden rounded-3xl shadow-xl lg:hidden'
              style={{ background: 'white', border: `1px solid ${C.primary}15` }}
            >
              <div className='max-h-[78dvh] space-y-1 overflow-y-auto p-4'>
                <Link 
                  to='/' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors' 
                  style={{ color: C.secondary, opacity: 0.85 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.primary}08`; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.85' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                {MEGA_CATEGORIES.map((cat) => (
                  <div key={cat.slug}>
                    <div className='px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide' style={{ color: C.primary, opacity: 0.7 }}>
                      {cat.label}
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className='flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors'
                        style={{ color: C.secondary, opacity: 0.85 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${C.primary}08`; e.currentTarget.style.opacity = '1' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.85' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ServiceIcon slug={item.slug} size={20} color={C.primary} className='opacity-70' />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link 
                  to='/about' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors' 
                  style={{ color: C.secondary, opacity: 0.85 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.primary}08`; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.85' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </Link>
                <Link 
                  to='/contact' 
                  className='block cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors' 
                  style={{ color: C.secondary, opacity: 0.85 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.primary}08`; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.85' }}
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
                  className='mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition-all active:scale-95'
                  style={{ background: C.primary, boxShadow: '0 4px 16px rgba(0,159,214,0.25)' }}
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
