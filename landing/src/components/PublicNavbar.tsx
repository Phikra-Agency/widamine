import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarBlank as CalendarDays, CaretDown as ChevronDown, List as Menu, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { SERVICE_PAGES } from '@/lib/siteContent'

type PublicNavbarProps = {
  theme?: 'light' | 'dark'
}

const ICON_MAP: Record<string, string> = {
  'facial-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66a3622bd361eeb686e5034c_traitement-epilation-visage-icon.svg',
  'lip-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e85a039533e71f235fffa1_Injection%20de%20Botox%20icon.svg',
  'eye-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e2e13d2bbbea8545df4cea_Paupie%CC%80res%20tombantes%20icon.svg',
  'eyebrow-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e2f8a83b4c68bcc2fc3cf3_Traitement%20du%20teint%20icon.svg',
  'consultation': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e2f4b991b4497731bc170c_Trucs%20Dermato%20icon.svg',
  'body-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e3f23957bc7998591fc3c3_Rela%CC%82chement%20cutane%CC%81%20icon.svg',
  'breast-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e3f943a2b8cdaf468486d7_Bourrelets%20graisseux%20icon.svg',
  'butt-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e85815a6cbdeeff7508b77_Cryolipolyse%20icon.svg',
  'arm-aesthetics': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e5b7a236c29ae5705095d6_Cicatrices%20autres%20icon.svg',
  'liposuction': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e84fad266e707a821af1b7_Radiofre%CC%81quence%20icon.svg',
  'vaser-liposuction': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e84f08672a3a9177d49088_Ultrasons%20icon.svg',
  'epilation-laser': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e3ef40b0429e8f2bebc5c3_Epilation%20laser%20icon.svg',
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
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(MEGA_CATEGORIES[0].slug)
  const [isScrolled, setIsScrolled] = useState(false)
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLight = theme === 'light'
  const isHome = pathname === '/'
  const isAppointment = pathname === '/appointment'
  const isContact = pathname === '/contact'
  const isServiceRoute = pathname.startsWith('/services/') || pathname.startsWith('/traitements/') || pathname.startsWith('/techniques/')

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMegaOpen(false)
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

  const handleMouseEnter = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setIsMegaOpen(true)
  }

  const handleMouseLeave = () => {
    megaTimeout.current = setTimeout(() => setIsMegaOpen(false), 150)
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
  const logoRingClass = isLight ? 'border-secondary/15 bg-custom-white/80' : 'border-white/16 bg-white/92'
  const iconButtonClass = isLight
    ? 'border-secondary/15 bg-custom-white/80 text-secondary/80 hover:bg-custom-white'
    : 'border-white/16 bg-white/10 text-white'
  const ctaClass = isLight
    ? 'border-secondary/15 bg-custom-white/80 text-secondary/80 hover:bg-custom-white hover:shadow-sm'
    : 'bg-primary text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)] hover:bg-primary/90'

  const activeCategoryData = useMemo(
    () => MEGA_CATEGORIES.find((c) => c.slug === activeCategory) ?? MEGA_CATEGORIES[0],
    [activeCategory]
  )

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
          <Link to='/' className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-sm sm:h-10 sm:w-10 ${logoRingClass}`}>
              <img src='/logo.png' alt='Widamine' className='h-5 w-5 object-contain sm:h-6 sm:w-6' />
            </div>
            {!isLight ? (
              <div className='hidden min-w-0 sm:block'>
                <p className='truncate font-amoria text-base tracking-[0.18em] text-white lg:text-lg'>WIDAMINE</p>
                <p className='text-[10px] uppercase tracking-[0.3em] text-white/56'>Sobriété Esthétique</p>
              </div>
            ) : null}
          </Link>

          <div className={`hidden items-center gap-6 text-sm lg:flex ${textClass}`}>
            <Link to='/' className={`transition-colors ${isHome ? activeClass : hoverClass}`}>
              Accueil
            </Link>
            <div className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button
                type='button'
                className={`inline-flex items-center gap-2 transition-colors ${isServiceRoute ? activeClass : hoverClass}`}
                aria-haspopup='menu'
                aria-expanded={isMegaOpen}
              >
                Traitements
                <ChevronDown size={14} className={`transition-transform duration-200 ${isMegaOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMegaOpen ? (
                  <motion.div
                    key='mega'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ type: 'spring', visualDuration: 0.42, bounce: 0.16 }}
                    className='absolute left-1/2 top-full z-[999] mt-5 hidden w-[min(92vw,900px)] -translate-x-1/2 lg:block'
                  >
                    <div className='relative overflow-hidden rounded-[24px] border border-secondary/12 bg-custom-white/96 shadow-[0_30px_80px_rgba(0,0,0,0.14)] backdrop-blur-[56px]'>
                      <div className='pointer-events-none absolute inset-0 opacity-[0.24] mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.28)_1px,transparent_0)] [background-size:7px_7px]' />
                      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-custom-white/80 via-custom-white/35 to-custom-white/80' />

                      {/* Category tabs */}
                      <div className='relative flex border-b border-secondary/8'>
                        {MEGA_CATEGORIES.map((cat) => (
                          <button
                            key={cat.slug}
                            type='button'
                            onMouseEnter={() => setActiveCategory(cat.slug)}
                            className={`flex-1 px-5 py-3.5 text-sm font-medium transition-colors ${
                              activeCategory === cat.slug
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-secondary/55 hover:text-secondary'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Sub-items */}
                      <div className='relative p-4'>
                        <AnimatePresence mode='wait'>
                          <motion.div
                            key={activeCategoryData.slug}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.08 }}
                          >
                            <div className='grid grid-cols-2 gap-x-3 gap-y-1'>
                              {activeCategoryData.items.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.href}
                                  className='group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-secondary/70 transition-colors hover:bg-primary/8 hover:text-secondary'
                                >
                                  {item.icon ? (
                                    <img src={item.icon} alt='' className='h-6 w-6 object-contain opacity-70 group-hover:opacity-100' loading='lazy' />
                                  ) : null}
                                  <span>{item.label}</span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <Link to='/appointment' className={`transition-colors ${isAppointment ? activeClass : hoverClass}`}>
              Rendez-vous
            </Link>
            <Link to='/contact' className={`transition-colors ${isContact ? activeClass : hoverClass}`}>
              Contact
            </Link>
          </div>

          <div className='flex items-center gap-1.5 sm:gap-2'>
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10 lg:hidden ${iconButtonClass}`}
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              type='button'
              onClick={open}
              aria-label='Réserver une consultation'
              className={`flex items-center justify-center rounded-full border transition-all duration-300 active:scale-[0.98] ${isLight ? 'h-8 w-11 sm:h-10 sm:w-14' : 'px-3 py-2 text-sm font-medium md:inline-flex md:px-4'} ${ctaClass} ${isLight ? 'border-secondary/15' : 'hidden border-transparent md:inline-flex'}`}
            >
              {isLight ? (
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M7 7h10v10H7V7Z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
                  <path d='M9 5h6' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
                </svg>
              ) : (
                <>
                  <CalendarDays size={16} />
                  Réserver
                </>
              )}
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
                <Link to='/' className={`block rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
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
                        className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${isLight ? 'text-secondary/70 hover:bg-primary/7 hover:text-secondary' : 'text-white/72 hover:bg-white/10 hover:text-white'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon ? <img src={item.icon} alt='' className='h-5 w-5 object-contain opacity-60' loading='lazy' /> : null}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link to='/appointment' className={`block rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Rendez-vous
                </Link>
                <Link to='/contact' className={`block rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    open()
                  }}
                  className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)]'
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
