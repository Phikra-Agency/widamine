import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarBlank as CalendarDays, CaretDown as ChevronDown, List as Menu, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { SERVICE_PAGES } from '@/lib/siteContent'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

type PublicNavbarProps = {
	theme?: 'light' | 'dark'
}

export default function PublicNavbar({ theme = 'light' }: PublicNavbarProps) {
	const { pathname } = useLocation()
	const { open } = useScheduleModalStore()
	const [isMegaOpen, setIsMegaOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [activeMega, setActiveMega] = useState(SERVICE_PAGES[0]?.slug ?? 'consultation')
	const [isScrolled, setIsScrolled] = useState(false)

	const activeItem = useMemo(
		() => SERVICE_PAGES.find((item) => item.slug === activeMega) ?? SERVICE_PAGES[0],
		[activeMega]
	)
	const isLight = theme === 'light'
	const isHome = pathname === '/'
	const isAppointment = pathname === '/appointment'
	const isContact = pathname === '/contact'
	const isServiceRoute = pathname.startsWith('/services/')

	useEffect(() => {
		setIsMobileMenuOpen(false)
		setIsMegaOpen(false)
	}, [pathname])

	useEffect(() => {
		if (!SERVICE_PAGES.some((item) => item.slug === activeMega) && SERVICE_PAGES[0]) {
			setActiveMega(SERVICE_PAGES[0].slug)
		}
	}, [activeMega])

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
						<div className='relative' onMouseEnter={() => setIsMegaOpen(true)} onMouseLeave={() => setIsMegaOpen(false)}>
							<button
								type='button'
								className={`inline-flex items-center gap-2 transition-colors ${isServiceRoute ? activeClass : hoverClass}`}
								aria-haspopup='menu'
								aria-expanded={isMegaOpen}
							>
								Soins & expertises
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
										className='absolute left-1/2 top-full z-[999] mt-5 hidden w-[min(92vw,1080px)] -translate-x-1/2 lg:block'
									>
										<div className='relative overflow-hidden rounded-[28px] border border-secondary/12 bg-custom-white/96 shadow-[0_30px_80px_rgba(0,0,0,0.14)] backdrop-blur-[56px]'>
											<div className='pointer-events-none absolute inset-0 opacity-[0.24] mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.28)_1px,transparent_0)] [background-size:7px_7px]' />
											<div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-custom-white/80 via-custom-white/35 to-custom-white/80' />
											<div className='relative grid min-h-[258px] grid-cols-[1.18fr_0.82fr]'>
												<div className='p-5 xl:p-6'>
													<div className='flex items-center justify-between gap-4'>
														<p className='text-[10px] uppercase tracking-[0.26em] text-secondary/48'>Expertises de la clinique</p>
														<p className='text-[11px] text-secondary/42'>Protocoles, consultations et technologies</p>
													</div>
													<div className='mt-4 grid grid-cols-2 gap-2.5'>
														{SERVICE_PAGES.map((item) => {
															const isActive = activeMega === item.slug
															return (
																<Link
																	key={item.slug}
																	to={`/services/${item.slug}`}
																	onMouseEnter={() => setActiveMega(item.slug)}
																	className={`group rounded-[1.15rem] border px-4 py-3 transition-colors ${isActive ? 'border-primary/18 bg-primary/10' : 'border-secondary/8 bg-white/42 hover:bg-primary/7'}`}
																>
																	<p className='text-[10px] uppercase tracking-[0.24em] text-primary/72'>{item.eyebrow}</p>
																	<div className='mt-2 flex items-start justify-between gap-3'>
																		<p className='text-[15px] leading-5 text-secondary'>{item.title}</p>
																		<span className={`text-sm text-secondary/50 transition-transform duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>↗</span>
																	</div>
																	<p className='mt-2 text-[12px] leading-5 text-secondary/55'>{item.heroDescription}</p>
																</Link>
															)
														})}
													</div>
												</div>

												<div className='relative hidden bg-secondary/8 p-5 lg:block xl:p-6'>
													<div className='absolute inset-0 bg-gradient-to-br from-custom-white/28 via-transparent to-primary/8' />
													<AnimatePresence mode='wait'>
														<motion.div
															key={activeItem.slug}
															initial={{ opacity: 0, x: 12 }}
															animate={{ opacity: 1, x: 0 }}
															exit={{ opacity: 0, x: -8 }}
															transition={{ type: 'spring', visualDuration: 0.26, bounce: 0.08 }}
															className='relative h-full overflow-hidden rounded-[1.35rem] border border-secondary/10 shadow-[0_18px_40px_rgba(0,0,0,0.12)]'
														>
															<img src={activeItem.image} alt={activeItem.title} className='h-full w-full object-cover' />
															<div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(10,23,37,0.08),rgba(10,23,37,0.45))]' />
															<div className='absolute inset-x-0 bottom-0 p-5 text-white'>
																<p className='text-[10px] uppercase tracking-[0.24em] text-white/60'>{activeItem.eyebrow}</p>
																<p className='mt-2 text-xl'>{activeItem.title}</p>
															</div>
														</motion.div>
													</AnimatePresence>
												</div>
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
								<div className='px-4 pt-3 text-[10px] uppercase tracking-[0.26em] text-primary/72'>Soins & expertises</div>
								{SERVICE_PAGES.map((item) => (
									<Link
										key={item.slug}
										to={`/services/${item.slug}`}
										className={`block rounded-xl px-4 py-3 transition-colors ${isLight ? 'text-secondary/80 hover:bg-primary/7 hover:text-secondary' : 'text-white/82 hover:bg-white/10 hover:text-white'}`}
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<div className='text-sm'>{item.title}</div>
										<div className={`mt-1 text-xs ${isLight ? 'text-secondary/52' : 'text-white/56'}`}>{item.eyebrow}</div>
									</Link>
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
