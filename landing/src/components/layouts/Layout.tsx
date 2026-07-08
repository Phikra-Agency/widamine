// import { useGSAP } from '@gsap/react'
// import clsx from 'clsx'
// import gsap from 'gsap'
// import { CalendarClock, Menu, X, ChevronRight } from 'lucide-react'
// import { useRef, useState } from 'react'
import {
	// Link,
	Outlet,
	useLocation,
} from 'react-router-dom'
import { useEffect } from 'react'
import Scheduling from '@/components/Scheduling'
import ContactPopup from '@/components/ContactPopup'
import Chatbot from '@/components/Chatbot'
import PublicFooter from '@/components/PublicFooter'

export default function Layout() {
	const location = useLocation()

	useEffect(() => {
		const scrollEl = document.getElementById('app-scroll')
		if (scrollEl) {
			scrollEl.scrollTo({ top: 0, behavior: 'auto' })
			return
		}

		window.scrollTo({ top: 0, behavior: 'auto' })
	}, [location.pathname])

	// const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	return (
		<main className='relative h-dvh overflow-hidden flex flex-col font-raleway text-secondary'>
			{/* <Navbar openSidebar={() => setIsSidebarOpen(true)} /> */}
			{/* <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> */}
			<div id='app-scroll' className='flex-1 overflow-x-hidden overflow-y-auto'>
				<Outlet />
				<PublicFooter />
			</div>
			<Scheduling />
			<ContactPopup />
			<Chatbot />
		</main>
	)
}

// function Navbar({ openSidebar }: { openSidebar: () => void }) {
// 	const [openMenu, setOpenMenu] = useState<string | null>(null)
// 	const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)

// 	const navRef = useRef<HTMLDivElement>(null)
// 	const ulRef = useRef<HTMLUListElement>(null)

// 	useGSAP(() => {
// 		navRef.current && gsap.from(navRef.current?.children, { y: -50, opacity: 0, ease: 'power1.out', stagger: 0.2, duration: 0.5, delay: 0.2 })
// 		ulRef.current && gsap.from(ulRef.current?.children, { y: -50, opacity: 0, ease: 'power1.out', stagger: 0.07, duration: 0.5, delay: 0.2 })
// 	})

// 	return (
// 		<nav ref={navRef} className='padding-x-container h-18 lg:h-22 flex shadow-lg py-2 justify-between lg:justify-start'>
// 			<Link to='/'>
// 				<img src='/logo-text.png' alt='Logo' className='h-full' />
// 			</Link>

// 			<ul ref={ulRef} className='flex-1 items-center justify-around hidden lg:flex'>
// 				<li>
// 					<Link to='/' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Accueil</span>
// 					</Link>
// 				</li>

// 				<li
// 					className='relative'
// 					onMouseEnter={() => {
// 						setOpenMenu('prestations')
// 					}}
// 					onMouseLeave={() => {
// 						setOpenMenu(null)
// 					}}>
// 					<span className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>Prestations</span>

// 					<ul className={clsx('space-y-1 absolute z-100 top-full left-1/2 -translate-x-1/2 bg-white border-muted rounded-lg px-4 w-max duration-400', openMenu === 'prestations' ? 'py-2 shadow-lg border opacity-100' : 'opacity-0 pointer-events-none')}>
// 						<li
// 							className='relative'
// 							onMouseEnter={() => {
// 								setOpenSubMenu('face')
// 							}}
// 							onMouseLeave={() => {
// 								setOpenSubMenu(null)
// 							}}>
// 							<span className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>Visage</span>
// 							<ul className={clsx('space-y-1 absolute -top-2 left-full bg-white rounded-lg border-muted py-2 w-0 whitespace-nowrap overflow-hidden duration-400', openSubMenu === 'face' ? 'w-max px-4 border shadow-lg opacity-100' : 'opacity-0')}>
// 								<li>
// 									<Link to='/lip-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Esthétique des lèvres</span>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link to='/eye-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Esthétique de l’œil</span>
// 									</Link>
// 								</li>
// 							</ul>
// 						</li>
// 						<li
// 							className='relative'
// 							onMouseEnter={() => {
// 								setOpenSubMenu('body')
// 							}}
// 							onMouseLeave={() => {
// 								setOpenSubMenu(null)
// 							}}>
// 							<span className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>Corps</span>
// 							<ul className={clsx('space-y-1 absolute -top-2 left-full bg-white rounded-lg border-muted py-2 w-0 whitespace-nowrap overflow-hidden duration-400', openSubMenu === 'body' ? 'w-max px-4 border shadow-lg opacity-100' : 'opacity-0')}>
// 								<li>
// 									<Link to='/body-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Épilation laser</span>
// 									</Link>
// 								</li>
// 							</ul>
// 						</li>
// 						<li>
// 							<Link to='/techniques' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								<span>Techniques</span>
// 							</Link>
// 						</li>
// 						<li>
// 							<Link to='/all-services' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								<span>tous les services</span>
// 							</Link>
// 						</li>
// 					</ul>
// 				</li>

// 				<li>
// 					<Link to='/gallery' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Photothèque</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/blog' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Actualités</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/about-us' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>À propos</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/contact' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Contact</span>
// 					</Link>
// 				</li>
// 			</ul>

// 			<div className='my-auto hidden lg:flex'>
// 				<Link to='/appointment/' className='flex gap-2 items-center font-bold text-primary border-2 rounded-full border-primary p-4'>
// 					<CalendarClock />
// 					<span>Prendre rendez-vous</span>
// 				</Link>
// 			</div>

// 			<button onClick={openSidebar} className='lg:hidden border border-gray-300 rounded-lg aspect-square flex justify-center items-center'>
// 				<Menu />
// 			</button>
// 		</nav>
// 	)
// }

// function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
// 	const [openMenu, setOpenMenu] = useState<string | null>(null)
// 	const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
// 	return (
// 		<div className={clsx('absolute z-100 flex flex-col gap-6 p-2 top-0 right-0 w-2/3 h-dvh bg-white border-muted lg:hidden duration-400', open ? 'translate-x-0 border-l shadow-lg' : 'translate-x-full')}>
// 			<div className='flex justify-end'>
// 				<div onClick={onClose} className='flex justify-center items-center aspect-square h-14 border border-gray-300 rounded-lg'>
// 					<X />
// 				</div>
// 			</div>

// 			<ul className='flex-1 flex flex-col gap-2 px-8'>
// 				<li>
// 					<Link to='/' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Accueil</span>
// 					</Link>
// 				</li>

// 				<li className='flex flex-col'>
// 					<span
// 						onClick={() => {
// 							setOpenMenu(openMenu === null ? 'prestations' : null)
// 						}}
// 						className='cursor-pointer flex w-fit gap-2 font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						Prestations <ChevronRight className={clsx('duration-300', openMenu === 'prestations' && 'rotate-90')} />
// 					</span>
// 					<ul className={clsx('flex flex-col gap-2 pl-3 overflow-hidden duration-400', openMenu === 'prestations' ? '' : 'h-0 pointer-events-none')}>
// 						<li className='flex flex-col mt-2'>
// 							<span
// 								onClick={() => {
// 									setOpenSubMenu(openSubMenu === 'face' ? null : 'face')
// 								}}
// 								className='cursor-pointer flex w-fit gap-2 font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								Visage <ChevronRight className={clsx('duration-300', openSubMenu === 'face' && 'rotate-90')} />
// 							</span>

// 							<ul className={clsx('flex flex-col gap-2 pl-3 overflow-hidden duration-400', openSubMenu === 'face' ? '' : 'h-0 pointer-events-none')}>
// 								<li className='mt-2'>
// 									<Link to='/lip-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Esthétique des lèvres</span>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link to='/eye-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Esthétique de l’œil</span>
// 									</Link>
// 								</li>
// 							</ul>
// 						</li>
// 						<li className='flex flex-col'>
// 							<span
// 								onClick={() => {
// 									setOpenSubMenu(openSubMenu === 'body' ? null : 'body')
// 								}}
// 								className='cursor-pointer flex w-fit gap-2 font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								Corps <ChevronRight className={clsx('duration-300', openSubMenu === 'body' && 'rotate-90')} />
// 							</span>

// 							<ul className={clsx('flex flex-col gap-2 pl-3 overflow-hidden duration-400', openSubMenu === 'body' ? '' : 'h-0 pointer-events-none')}>
// 								<li className='mt-2'>
// 									<Link to='/body-aesthetics' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 										<span>Épilation laser</span>
// 									</Link>
// 								</li>
// 							</ul>
// 						</li>
// 						<li>
// 							<Link to='/techniques' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								<span>Techniques</span>
// 							</Link>
// 						</li>
// 						<li>
// 							<Link to='/all-services' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 								<span>tous les services</span>
// 							</Link>
// 						</li>
// 					</ul>
// 				</li>

// 				<li>
// 					<Link to='/gallery' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Photothèque</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/blog' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Actualités</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/about-us' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>À propos</span>
// 					</Link>
// 				</li>
// 				<li>
// 					<Link to='/contact' className='cursor-pointer font-semibold hover:text-primary border-b-2 border-transparent hover:border-primary duration-400'>
// 						<span>Contact</span>
// 					</Link>
// 				</li>
// 			</ul>

// 			<div className='flex'>
// 				<Link to='/appointment' className='flex gap-2 items-center font-bold text-primary border-2 rounded-full border-primary w-full justify-center py-2'>
// 					<CalendarClock />
// 					<span>Prendre rendez-vous</span>
// 				</Link>
// 			</div>
// 		</div>
// 	)
// }

// function Footer() {
// 	return (
// 		<footer className='bg-primary w-full text-white py-4 padding-container'>
// 			<div className='flex justify-center w-full'>
// 				<span className='text-center text-sm lg:text-md'>© 2026 Widamine Aesthetic Center - Tous les droits sont réservés.</span>
// 			</div>
// 		</footer>
// 	)
// }
