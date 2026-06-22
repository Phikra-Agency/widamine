import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CaretRight as ChevronRight } from '@phosphor-icons/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import PublicNavbar from '@/components/PublicNavbar'

const PAGE_COPY: Record<string, { eyebrow: string; description: string }> = {
	Contact: {
		eyebrow: 'Widamine Aesthetic Center',
		description: 'Notre équipe reste disponible pour répondre à vos questions, organiser votre consultation et vous orienter vers le soin le plus adapté à votre besoin.',
	},
	'Rendez-vous': {
		eyebrow: 'Prendre rendez-vous',
		description: 'Réservez votre consultation générale, votre protocole de dermatologie esthétique, vos séances laser ou votre programme sur mesure dans une expérience plus claire et plus fluide.',
	},
}

export default function Header({ page }: { page: string }) {
	const textRef = useRef<HTMLDivElement>(null)
	const pageCopy = PAGE_COPY[page] ?? {
		eyebrow: 'Widamine Aesthetic Center',
		description: 'Une expérience plus cohérente, plus premium et plus lisible sur toutes les pages publiques du site.',
	}

	useGSAP(() => {
		gsap.from(textRef.current, { y: 22, opacity: 0, ease: 'power2.out', duration: 0.65, delay: 0.12 })
	})

	return (
		<header className='relative z-[220] isolate overflow-hidden bg-custom-white'>
			<div className='absolute inset-0'>
				<img src='/page-header.jpg' alt='header image' className='absolute inset-0 h-full w-full object-cover' />
				<div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(9,25,39,0.62),rgba(9,25,39,0.34)_42%,rgba(9,25,39,0.5))]' />
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_84%_72%,rgba(46,144,192,0.18),transparent_34%)]' />
			</div>

			<PublicNavbar theme='dark' />

			<div className='relative mx-auto flex min-h-[18rem] max-w-7xl items-center px-4 pb-8 pt-20 sm:px-6 sm:pb-14 sm:pt-28 md:min-h-[28rem] md:pb-18 md:pt-32'>
				<div ref={textRef} className='max-w-3xl text-white'>
					<p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/58'>{pageCopy.eyebrow}</p>
					<h2 className='mt-3 font-amoria text-[2.05rem] leading-[0.98] text-white sm:text-5xl md:mt-5 md:text-7xl'>{page}</h2>
					<p className='mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base md:mt-5 md:text-lg md:leading-8'>
						{pageCopy.description}
					</p>
					<div className='mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-[11px] text-white/82 backdrop-blur-md sm:px-4 sm:text-sm'>
						<Link to='/' className='transition hover:text-white'>Accueil</Link>
						<ChevronRight size={16} />
						<span>{page}</span>
					</div>
				</div>
			</div>
		</header>
	)
}
