import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import {
	CaretLeft as ChevronLeft,
	CaretRight as ChevronRight,
	CalendarBlank as CalendarDays,
	ClipboardText,
	Clock as Clock3,
	CrosshairSimple as Crosshair,
	Drop as Droplets,
	FileMagnifyingGlass,
	HeartStraight,
	MapPin,
	PhoneCall,
	ScanSmiley as ScanFace,
	ShieldCheck,
	Sparkle as Sparkles,
	Star,
} from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import PublicNavbar from '@/components/PublicNavbar'
import WIDAMINE_ASSETS, { WIDAMINE_CONTENT } from '@/lib/widamineSource'

gsap.registerPlugin(ScrollTrigger)

const marqueeStyle = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes hero-story-marquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

@keyframes services-marquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.services-swiper .swiper-wrapper {
  transition-timing-function: linear !important;
}

.hero-story-track {
  width: max-content;
  animation: hero-story-marquee 24s linear infinite;
}
`

	const SERVICES = [
		{
			iconClass: 'flaticon-arm',
			title: 'Esthétique du visage',
			image: WIDAMINE_ASSETS.pageHeader,
			url: '#',
			eyebrow: 'Visage',
			description: 'Soins orientés éclat, texture et harmonie du teint avec une lecture esthétique précise avant chaque protocole.',
			benefit: 'Peau plus uniforme',
			duration: '30 min',
		},
		{
			iconClass: 'flaticon-eye',
			title: "Esthétique de l'œil",
			image: WIDAMINE_ASSETS.pageHeader,
			url: '#',
			eyebrow: 'Regard',
			description: 'Approche délicate du contour de l’œil pour apporter fraîcheur, précision visuelle et équilibre du regard.',
			benefit: 'Regard reposé',
			duration: '25 min',
		},
		{
			iconClass: 'flaticon-lips',
			title: 'Esthétique des lèvres',
			image: WIDAMINE_ASSETS.pageHeader,
			url: '#',
			eyebrow: 'Lèvres',
			description: 'Travail sur la définition, la proportion et l’élégance du volume pour un rendu naturel et maîtrisé.',
			benefit: 'Contour redéfini',
			duration: '20 min',
		},
	{
		iconClass: 'flaticon-body',
		title: 'Esthétique du corps',
		image: '/services/service_1.png',
		url: '#',
		eyebrow: 'Corps',
		description: 'Protocoles de remodelage et de silhouette inspirés du positionnement clinique du centre.',
		benefit: 'Silhouette affinée',
		duration: '45 min',
	},
	{
		iconClass: 'flaticon-expertise',
		title: 'Liposuccion Vaser',
		image: '/services/service_1.png',
		url: '#',
		eyebrow: 'Expertise',
		description: 'Accompagnement structuré autour du contour corporel avec une approche plus technique et plus ciblée.',
		benefit: 'Zones ciblées',
		duration: 'Consultation',
	},
		{
			iconClass: 'flaticon-brows',
			title: 'Esthétique des sourcils',
			image: WIDAMINE_ASSETS.pageHeader,
			url: '#',
			eyebrow: 'Sourcils',
			description: 'Correction visuelle et relecture de la ligne pour encadrer le visage avec plus de netteté.',
			benefit: 'Ligne équilibrée',
			duration: '20 min',
		},
		{
			iconClass: 'flaticon-breast',
			title: 'Augmentation mammaire',
			image: '/services/service_1.png',
			url: '#',
			eyebrow: 'Silhouette',
			description: 'Prise en charge orientée proportion, projection et cohérence de la silhouette globale.',
			benefit: 'Volume harmonisé',
			duration: 'Consultation',
		},
	{
		iconClass: 'flaticon-booty',
		title: 'Brazilian Butt Lift',
		image: '/services/service_1.png',
		url: '#',
		eyebrow: 'Corps',
		description: 'Lecture esthétique du galbe et du contour postérieur dans un parcours personnalisé et encadré.',
		benefit: 'Courbes redessinées',
		duration: 'Consultation',
	},
]

const MEDICAL_INSIGHTS = [
	{
		icon: ScanFace,
		title: 'Notre Objectif',
		description: "Nous visons à dépasser les attentes en offrant des soins dermatologiques et esthétiques exceptionnels, conçus pour chaque individu. Notre priorité est d'utiliser les techniques les plus avancées pour assurer des résultats optimaux et durables.",
	},
	{
		icon: Droplets,
		title: 'Notre Vision',
		description: 'Être le centre de référence en dermatologie et esthétique médicale, où innovation et qualité se rencontrent. Nous aspirons à créer une expérience unique, où chaque patient se sent valorisé et transformé.',
	},
	{
		icon: Crosshair,
		title: 'Notre Mission',
		description: 'Nous sommes dédiés à améliorer la vie de nos patients par des soins dermatologiques et esthétiques personnalisés. Notre mission est de combiner expertise médicale, technologies avancées et un service personnalisé pour offrir une expérience incomparable.',
	},
]

const JOURNEY_CARDS = [
	{
		icon: FileMagnifyingGlass,
		title: 'Diagnostic précis',
		description: 'Chaque parcours démarre par une lecture précise des besoins du patient et un diagnostic adapté à sa situation.',
		tone: 'bg-secondary text-custom-white',
	},
	{
		icon: ClipboardText,
		title: 'Protocoles sur mesure',
		description: 'Chaque patient bénéficie d’un plan de traitement personnalisé, construit autour de ses attentes et de ses priorités.',
		tone: 'bg-accent/80 text-secondary',
	},
	{
		icon: HeartStraight,
		title: 'Suivi attentif',
		description: 'Notre équipe accompagne chaque étape du parcours avec une présence claire, rassurante et continue.',
		tone: 'bg-primary/85 text-custom-white',
	},
]

const EXPERTISES = [
	{
		name: 'Dr. SLAOUI WIDAD',
		role: 'Plastic Surgery',
		image: '/hero.png',
		description: "Votre bien-être nous est confié. Notre équipe d'experts, pour des résultats à la hauteur de vos attentes.",
	},
	{
		name: 'Équipe Widamine',
		role: 'Accompagnement patient',
		image: '/services/service_1.png',
		description: "Des professionnels dévoués présents à chaque étape pour guider, rassurer et structurer l'expérience patient.",
	},
]

const TRUST_POINTS = [
	{
		icon: ShieldCheck,
		title: 'Fiabilité',
		description: 'Des services précis, fiables et éthiques portés par une équipe experte.',
	},
	{
		icon: Sparkles,
		title: 'Empathie',
		description: 'Une écoute attentive pour comprendre vos besoins médicaux et vos aspirations personnelles.',
	},
	{
		icon: Crosshair,
		title: 'Innovation',
		description: 'Les dernières technologies intégrées à une approche harmonieuse et équilibrée.',
	},
	{
		icon: Droplets,
		title: 'Éthique',
		description: 'Des pratiques transparentes et respectueuses de votre peau, de votre santé et de votre confiance.',
	},
]

const NEWS_POSTS = [
	{
		title: 'Fat Injection',
		category: 'Aesthetic & Plastic Surgery',
		date: '20.05.2022',
		excerpt: "L’injection de graisse permet de redonner volume, équilibre et douceur à certaines zones du visage ou du corps en utilisant la propre graisse du patient.",
	},
	{
		title: 'How to Prevent Jowl Sagging?',
		category: 'Aesthetic & Plastic Surgery',
		date: '20.05.2022',
		excerpt: "Le relâchement du bas du visage peut être anticipé avec une évaluation précoce, des gestes adaptés et une stratégie de soin cohérente.",
	},
	{
		title: 'Liposuction',
		category: 'Aesthetic & Plastic Surgery',
		date: '20.05.2022',
		excerpt: "La liposuccion cible le plus souvent l’abdomen, les hanches, les cuisses, le dos, les bras et certaines zones localisées du visage.",
	},
]

const CARE_UNIVERSES = [
	{
		title: 'Consultation',
		eyebrow: 'Diagnostic',
		description: 'Consultation générale et urgence dermatologique dans un parcours de prise en charge clair et réactif.',
		items: ['Consultation générale', 'Urgence dermatologique'],
	},
	{
		title: 'Dermatologie esthétique',
		eyebrow: 'Esthétique médicale',
		description: 'Des traitements ciblés pour le visage, l’anti-âge et la qualité de peau, portés par une lecture médicale précise.',
		items: ['Injection Botox & acide hyaluronique', 'Peeling', 'Traitement anti-âge', 'Soins du visage'],
	},
	{
		title: 'Séances laser',
		eyebrow: 'Technologies',
		description: 'Des protocoles laser ajustés selon l’indication, la peau et l’objectif thérapeutique ou esthétique.',
		items: ['Épilation laser', 'Traitement des taches', 'Cicatrices / acné', 'Détatouage'],
	},
]

const PROGRAM_GROUPS = [
	{
		title: 'Packs Amincissement & Remodelage',
		label: 'Silhouette',
		description: 'Des protocoles multi-machines à volume élevé pour la silhouette, le raffermissement et le body contouring.',
		items: [
			'Pack renforcement musculaire : 8 séances de I Model, 8 séances de Stimsure, 8 séances de Diasculpt et 8 séances de Lifting colombien.',
			'Pack raffermissement de peau : 5 séances de Tempsure Firm, 10 séances EMS, 10 séances de Diasculpt et 5 séances d’onde de choc.',
			'Pack cellulite : 4 séances de Tempsure Firm, 10 séances de Diasculpt et 10 séances d’onde de choc.',
			'Pack body contouring complet : protocole intensif incluant notamment 16 séances de Diasculpt, 8 séances de Stimsure, 8 séances de I Model et 8 séances de drainage.',
			'Pack I Model seul : forfaits de 8, 20, 30 ou 52 séances.',
		],
	},
	{
		title: 'Soins Thérapeutiques & Post-Opératoires',
		label: 'Suivi',
		description: 'Des intervalles stricts et une organisation précise, particulièrement importants pour le calendrier et le suivi post-opératoire.',
		items: [
			'Liposuccion post-op : 8 séances de Diasculpt espacées de 5 jours, à commencer 2 à 3 jours après l’intervention.',
			'Abdominoplastie post-op : 10 séances de drainage manuel dès le lendemain de l’intervention, accompagnées de 4 séances de LED.',
			'Tendinite : 10 séances de Diasculpt avec 3 jours d’intervalle, plus 3 séances de TECAR.',
			'Fasciite plantaire / Déchirures : 8 séances de Diasculpt avec une semaine d’intervalle.',
			'Transit intestinal : 5 séances espacées d’une semaine.',
			'Kiné sportive : 5 à 10 séances de TECAR avec une fréquence de 1 à 3 séances par semaine.',
		],
	},
	{
		title: 'Soins Visage & Esthétique',
		label: 'Visage',
		description: 'Une offre visage et esthétique qui combine séances unitaires, cures et traitements dépendant du besoin réel du patient.',
		items: [
			'Pack Iface Esthetic : 1 séance ou 12 séances.',
			'Injections : Botox, acide hyaluronique et Skinbooster selon l’indication.',
			'Épilation laser : protocole évolutif selon la pilosité et la zone traitée.',
		],
	},
]

const revealProps = {
	initial: { opacity: 0, y: 34, scale: 0.985, filter: 'blur(16px)' },
	whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
	viewport: { once: true, amount: 0.2 },
	transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
}

function RevealBlock({
	children,
	className,
	delay = 0,
}: {
	children: ReactNode
	className?: string
	delay?: number
}) {
	return (
		<motion.div
			className={className}
			initial={revealProps.initial}
			whileInView={revealProps.whileInView}
			viewport={revealProps.viewport}
			transition={{ ...revealProps.transition, delay }}
		>
			{children}
		</motion.div>
	)
}

function LeafAccent({
	className,
	tone,
	float,
	entrance,
	size = 360,
}: {
	className: string
	tone: string
	float: { y: number[]; rotate: number[]; duration: number }
	entrance: { x: number; delay: number; duration: number; rotate: number }
	size?: number
}) {
	return (
		<motion.div
			className={className}
			aria-hidden='true'
			initial={{ opacity: 0, x: entrance.x, scale: 0.8, rotate: entrance.rotate }}
			animate={{
				opacity: 1,
				x: 0,
				scale: 1,
				rotate: 0,
			}}
			transition={{
				duration: entrance.duration,
				delay: entrance.delay,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
		>
			<motion.div animate={{ y: float.y, rotate: float.rotate }} transition={{ duration: float.duration, repeat: Infinity, ease: 'easeInOut' }}>
				<svg width={size} height={size} viewBox='0 0 260 260' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M52 194c36-52 70-85 114-110 40-24 66-46 88-74-6 56-20 98-46 132-28 38-68 68-118 86-14 5-27 7-38 8Z'
						stroke={tone}
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M74 176c18-18 34-30 52-40 16-10 32-20 48-38-8 24-18 40-32 56-14 16-34 30-60 42'
						stroke={tone}
						strokeWidth='1.6'
						strokeLinecap='round'
						strokeLinejoin='round'
						opacity='0.7'
					/>
				</svg>
			</motion.div>
		</motion.div>
	)
}

export default function Home() {
    return (
        <>
            <style>{marqueeStyle}</style>
            <Hero />
			<Services />
			<ServiceUniverseSection />
			<MedicalAestheticsSection />
			<BeforeAfterSection />
			<PatientJourney />
			<ExpertsSection />
			<TestimonialsSection />
			<TrustSection />
			<NewsSection />
			<ConsultationBanner />
			<ClosingSection />
		</>
	)
}

function Hero() {
	const heroRef = useRef<HTMLElement>(null)
	const { open } = useScheduleModalStore()

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				'[data-hero-anim]',
				{ opacity: 0, y: 22 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					stagger: 0.12,
					ease: 'power3.out',
					delay: 0.15,
				}
			)
		}, heroRef)

		return () => ctx.revert()
	}, [])

	return (
		<section ref={heroRef} className='relative z-[1200] min-h-[100svh] overflow-hidden isolate bg-custom-white'>
            <div className='absolute inset-0'>
                {/* background image removed - restored to source look (logo + overlays only) */}
				<div className='absolute inset-0 bg-radial-[circle_at_30%_25%] from-accent/25 via-custom-white to-custom-white' />
				<div className='absolute inset-0 bg-radial-[circle_at_75%_70%] from-primary/12 via-transparent to-transparent' />
				<div className='absolute -top-48 -left-48 hidden h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-2xl sm:block' />
				<div className='absolute -bottom-56 -right-56 hidden h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-2xl sm:block' />
				<div className='absolute -top-16 -left-16 h-40 w-40 rounded-full bg-accent/12 blur-2xl sm:hidden' />
				<div className='absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-2xl sm:hidden' />
				<div className='absolute top-1/4 -right-12 h-32 w-32 rounded-full bg-accent/8 blur-xl sm:hidden' />
				<div className='pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(26,54,70,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,70,0.08)_1px,transparent_1px)] opacity-[0.22] [background-size:64px_64px] sm:block' />
				<div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(26,54,70,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,70,0.05)_1px,transparent_1px)] opacity-[0.15] [background-size:40px_40px] sm:hidden' />
				<div className='pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.9),transparent_55%)]' />
				<div className='pointer-events-none absolute inset-0 opacity-[0.30] bg-[radial-gradient(circle_at_85%_30%,rgba(46,144,192,0.22),transparent_55%)]' />
				<div className='pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_18%_75%,rgba(232,197,184,0.22),transparent_52%)]' />
				<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(255,255,255,0.92)_92%)]' />
				<div className='pointer-events-none absolute -top-24 right-10 hidden h-56 w-56 rounded-full border border-secondary/10 bg-custom-white/40 backdrop-blur-[2px] sm:block' />
				<div className='pointer-events-none absolute bottom-16 left-10 hidden h-40 w-40 rounded-full border border-secondary/10 bg-custom-white/35 backdrop-blur-[2px] sm:block' />
				<LeafAccent
					className='pointer-events-none absolute -left-24 top-8 hidden opacity-[0.55] mix-blend-multiply blur-[0.2px] sm:block'
					tone='rgba(26,54,70,0.32)'
					float={{ y: [0, -10, 0], rotate: [-1.2, 0.8, -1.2], duration: 12 }}
					entrance={{ x: -100, delay: 0.3, duration: 1.2, rotate: -15 }}
					size={360}
				/>
				<LeafAccent
					className='pointer-events-none absolute -right-36 -bottom-12 hidden scale-x-[-1] rotate-180 opacity-[0.45] mix-blend-multiply blur-[0.2px] sm:block'
					tone='rgba(46,144,192,0.30)'
					float={{ y: [0, 12, 0], rotate: [1.1, -0.7, 1.1], duration: 13 }}
					entrance={{ x: 100, delay: 0.5, duration: 1.2, rotate: 15 }}
					size={360}
				/>
				<LeafAccent
					className='pointer-events-none absolute left-2 top-32 opacity-[0.25] sm:hidden'
					tone='rgba(26,54,70,0.20)'
					float={{ y: [0, -3, 0], rotate: [-0.5, 0.3, -0.5], duration: 12 }}
					entrance={{ x: -15, delay: 0.4, duration: 1, rotate: -3 }}
					size={60}
				/>
				<LeafAccent
					className='pointer-events-none absolute right-4 bottom-48 opacity-[0.20] sm:hidden'
					tone='rgba(46,144,192,0.18)'
					float={{ y: [0, 3, 0], rotate: [0.4, -0.2, 0.4], duration: 14 }}
					entrance={{ x: 15, delay: 0.6, duration: 1, rotate: 3 }}
					size={50}
				/>
			</div>
			<div className='pointer-events-none absolute inset-0 opacity-[0.25]'>
				<div className='absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20' />
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.55),transparent_60%)]' />
			</div>

			<PublicNavbar theme='light' />

			<motion.div
				className='relative z-0 flex min-h-[100svh] items-center justify-center px-4 pt-18 pb-18 sm:px-6 sm:pt-20 sm:pb-24'
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					duration: 0.8,
					ease: [0.25, 0.1, 0.25, 1],
				}}
			>
				<div className='w-full max-w-4xl text-center'>
					<motion.div
						className='flex -translate-y-10 flex-col items-center sm:-translate-y-14'
						initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
					>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full border border-secondary/10 bg-custom-white/80 shadow-sm sm:h-16 sm:w-16'>
                            <img src={WIDAMINE_ASSETS.logos.primary} alt='Widamine' className='h-9 w-9 object-contain' />
                        </div>
						<h1 className='mt-3 font-amoria text-lg tracking-[0.2em] text-secondary sm:mt-4 sm:text-xl'>WIDAMINE</h1>
						<p className='mt-1 text-[10px] uppercase tracking-[0.34em] text-secondary/60'>Sobriété Esthétique</p>
					</motion.div>

						<motion.h2
							className='mt-2 flex flex-col items-center px-1 font-amoria text-[2rem] leading-[1.08] text-secondary sm:mt-3 sm:px-0 sm:text-5xl sm:leading-[1.03] md:text-6xl md:leading-[1.01] lg:text-6xl xl:text-7xl'
						initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
					>
						<motion.span className='hidden whitespace-nowrap text-center sm:block' initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
							Bienvenue chez Widamine.
						</motion.span>
						<motion.span className='text-center sm:hidden' initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
							Bienvenue chez
						</motion.span>
						<motion.span className='text-center sm:hidden' initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}>
							Widamine.
						</motion.span>
							<motion.span className='mt-0 text-center sm:mt-2' initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
								L'expertise <span className='italic text-primary'>sur mesure</span>.
							</motion.span>
						</motion.h2>

						<motion.p
							className='mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-secondary/66 sm:mt-6 sm:text-lg sm:leading-8'
							initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
							animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							transition={{ duration: 0.6, delay: 0.74, ease: [0.25, 0.46, 0.45, 0.94] }}
						>
							Ici, chaque traitement est une promesse d’excellence. Grâce à une combinaison unique de technologies de pointe et de savoir-faire expert, nous vous aidons à redécouvrir votre beauté et à retrouver une peau saine et éclatante.
						</motion.p>

						<motion.div
							className='mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row'
						initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						transition={{ duration: 0.6, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
					>
						<a
							href='/catalogue.pdf'
							download
							className='inline-flex w-full items-center justify-center rounded-full border border-secondary/15 bg-custom-white/70 px-6 py-3.5 text-sm font-medium text-secondary/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-custom-white hover:text-secondary active:translate-y-0 sm:w-auto'
						>
							Télécharger Notre Catalogue
						</a>
							<button
							onClick={open}
							className='group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-custom-white shadow-[0_14px_30px_rgba(46,144,192,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 sm:w-auto'
						>
								Réserver une consultation
							</button>
						</motion.div>
					</div>
				</motion.div>
			</section>
		)
}

export function ServicesArchived() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [panelY, setPanelY] = useState(164)
	const [isDragging, setIsDragging] = useState(false)
	const stageRef = useRef<HTMLDivElement>(null)
	const pointerRef = useRef({ active: false, originX: 0, hasMoved: false })
	const autoplayRef = useRef<number | null>(null)
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		align: 'start',
		dragFree: true,
		containScroll: false,
	})
	const hoveredService = hoveredIndex !== null ? SERVICES[hoveredIndex] : null
	const dragThresholdPx = 8

	function updatePanelPosition(clientY: number) {
		const panelHeight = 360
		const nextY = clientY - panelHeight / 2 - 72
		const clamped = Math.max(92, Math.min(nextY, window.innerHeight - panelHeight - 28))
		setPanelY(clamped)
	}

	function clearHover() {
		setHoveredIndex(null)
	}

	function findNearestVisibleCard(clientX: number) {
		if (!emblaApi || !stageRef.current) return null

		const stageRect = stageRef.current.getBoundingClientRect()
		if (clientX < stageRect.left || clientX > stageRect.right) return null

		const cards = emblaApi.slideNodes()
		let bestMatch: { index: number; distance: number } | null = null

		for (const [index, cardElement] of cards.entries()) {
			const rect = cardElement.getBoundingClientRect()
			if (rect.right < stageRect.left || rect.left > stageRect.right) continue

			const centerX = rect.left + rect.width / 2
			const distance = Math.abs(clientX - centerX)

			if (!bestMatch || distance < bestMatch.distance) {
				bestMatch = { index, distance }
			}
		}

		return bestMatch
	}

	function handleStageHover(clientX: number, clientY: number) {
		if (isDragging) return
		const target = findNearestVisibleCard(clientX)
		if (!target) {
			clearHover()
			return
		}

		setHoveredIndex(target.index)
		updatePanelPosition(clientY)
	}

	useEffect(() => {
		const stopDragging = () => {
			pointerRef.current.active = false
			setIsDragging(false)
		}
		window.addEventListener('pointerup', stopDragging)
		window.addEventListener('pointercancel', stopDragging)
		return () => {
			window.removeEventListener('pointerup', stopDragging)
			window.removeEventListener('pointercancel', stopDragging)
		}
	}, [])

	useEffect(() => {
		if (!emblaApi) return
		const onPointerDown = () => {
			setIsDragging(true)
			clearHover()
		}
		const onSettle = () => {
			if (!pointerRef.current.active) setIsDragging(false)
		}
		emblaApi.on('pointerDown', onPointerDown)
		emblaApi.on('settle', onSettle)

		return () => {
			emblaApi.off('pointerDown', onPointerDown)
			emblaApi.off('settle', onSettle)
		}
	}, [emblaApi])

	useEffect(() => {
		if (!emblaApi) return

		if (autoplayRef.current !== null) {
			window.clearInterval(autoplayRef.current)
			autoplayRef.current = null
		}

		if (hoveredIndex !== null || isDragging) return

		autoplayRef.current = window.setInterval(() => {
			emblaApi.scrollNext()
		}, 2800)

		return () => {
			if (autoplayRef.current !== null) {
				window.clearInterval(autoplayRef.current)
				autoplayRef.current = null
			}
		}
	}, [emblaApi, hoveredIndex, isDragging])

	useEffect(() => {
		return () => {
			document.body.style.userSelect = ''
			if (autoplayRef.current !== null) {
				window.clearInterval(autoplayRef.current)
				autoplayRef.current = null
			}
		}
	}, [])

	return (
		<section className='bg-custom-white pt-8 pb-8 lg:pt-12 lg:pb-10'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6'>
				<RevealBlock className='space-y-3 text-center'>
					<h2 className='font-amoria text-4xl text-secondary md:text-5xl'>Nos Prestations</h2>
					<p className='mx-auto max-w-2xl text-secondary/58'>Découvrez nos traitements dermo-esthétiques sur mesure</p>
				</RevealBlock>

				<div className='relative mt-6'>
					<div
						ref={stageRef}
						className='services-stage relative isolate mx-auto h-[20.5rem] max-w-[72rem] cursor-grab select-none overflow-hidden rounded-[1.8rem] active:cursor-grabbing sm:h-[28rem] sm:rounded-[3rem] lg:h-[32rem]'
						onPointerEnter={(e) => {
							handleStageHover(e.clientX, e.clientY)
						}}
						onPointerDown={(e) => {
							if (e.pointerType === 'mouse' && e.button !== 0) return
							pointerRef.current = { active: true, originX: e.clientX, hasMoved: false }
							clearHover()
						}}
						onPointerMove={(e) => {
							if (pointerRef.current.active && !pointerRef.current.hasMoved && Math.abs(e.clientX - pointerRef.current.originX) > dragThresholdPx) {
								pointerRef.current.hasMoved = true
								setIsDragging(true)
								clearHover()
							}

							if (!pointerRef.current.hasMoved) handleStageHover(e.clientX, e.clientY)
						}}
						onPointerUp={() => {
							pointerRef.current.active = false
							setIsDragging(false)
						}}
						onPointerCancel={() => {
							pointerRef.current.active = false
							setIsDragging(false)
							clearHover()
						}}
						onPointerLeave={() => {
							if (!pointerRef.current.active) clearHover()
						}}
						style={{ perspective: '2200px' }}
					>
						<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(251,244,240,0.52),transparent_34%)]' />
						<div className='pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-custom-white via-custom-white/82 to-transparent' />
						<div className='pointer-events-none absolute inset-y-0 left-0 z-[30] w-16 bg-gradient-to-r from-custom-white via-custom-white/94 to-transparent sm:w-24 lg:w-32' />
						<div className='pointer-events-none absolute inset-y-0 right-0 z-[30] w-16 bg-gradient-to-l from-custom-white via-custom-white/94 to-transparent sm:w-24 lg:w-32' />

						<div className='absolute inset-0 z-10 overflow-hidden' ref={emblaRef}>
							<div className='flex h-full'>
								{SERVICES.map((service, index) => {
									const isHovered = hoveredIndex === index

									return (
										<motion.div
											key={service.title}
											className='flex h-full min-w-0 flex-[0_0_12rem] items-end px-2 sm:flex-[0_0_15.5rem] sm:px-3 lg:flex-[0_0_18.5rem] lg:px-3'
											data-service-card='true'
											data-service-index={index}
											animate={{
												y: isHovered ? -10 : 0,
												scale: isHovered ? 1.025 : 1,
											}}
											transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
											style={{
												transformStyle: 'preserve-3d',
												transformOrigin: 'center bottom',
												zIndex: isHovered ? 20 : 10,
											}}
										>
											<ServiceCard service={service} isHovered={isHovered} />
										</motion.div>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			</div>

			<AnimatePresence>
				{hoveredService && !isDragging && (
					<motion.div
						key={hoveredService.title}
						initial={{ opacity: 0, x: 26, scale: 0.97, filter: 'blur(10px)' }}
						animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', top: panelY }}
						exit={{ opacity: 0, x: 18, scale: 0.97, filter: 'blur(8px)' }}
						transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
						className='pointer-events-none fixed z-[140] hidden w-[18rem] xl:block'
						style={{ right: 'max(1.5rem, calc((100vw - 80rem) / 2 - 0.5rem))' }}
					>
						<div className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white/84 shadow-[0_26px_60px_rgba(26,54,70,0.14)] backdrop-blur-[22px]'>
							<div className='relative h-44 overflow-hidden'>
								<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_34%),linear-gradient(180deg,rgba(232,197,184,0.20),rgba(46,144,192,0.08))]' />
								<img src={hoveredService.image} alt={hoveredService.title} className='h-full w-full object-cover opacity-92' />
							</div>
							<div className='space-y-5 p-6'>
								<div>
									<p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/74'>{hoveredService.eyebrow}</p>
									<h3 className='mt-3 text-[1.8rem] leading-tight font-medium text-secondary'>{hoveredService.title}</h3>
								</div>
								<p className='text-sm leading-7 text-secondary/66'>{hoveredService.description}</p>
								<div className='grid grid-cols-2 gap-3'>
									<div className='rounded-2xl border border-secondary/8 bg-secondary/4 px-4 py-3'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/44'>Bénéfice</p>
										<p className='mt-2 text-sm font-medium text-secondary'>{hoveredService.benefit}</p>
									</div>
									<div className='rounded-2xl border border-secondary/8 bg-primary/6 px-4 py-3'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/44'>Durée</p>
										<p className='mt-2 text-sm font-medium text-secondary'>{hoveredService.duration}</p>
									</div>
								</div>
								<div className='flex items-center justify-between text-sm text-secondary/56'>
									<span>Consultation personnalisée</span>
									<span className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/18 bg-primary/8 text-primary'>
										<ArrowUpRightIcon size={22} />
									</span>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	)
}

function Services() {
	const [activeIndex, setActiveIndex] = useState(0)
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
	const swiperRef = useRef<import('swiper').Swiper | null>(null)
	const hoverFrameRef = useRef<number | null>(null)
	const hoveredService = SERVICES[hoveredIndex ?? activeIndex]

	function updatePanelPosition(clientX: number, clientY: number) {
		const panelWidth = 320
		const panelHeight = 380
		const nextX = Math.min(clientX + 28, window.innerWidth - panelWidth - 24)
		const nextY = Math.min(Math.max(clientY - panelHeight / 2, 96), window.innerHeight - panelHeight - 24)
		setPanelPosition({ x: nextX, y: nextY })
	}

	function handleSlideHover(index: number, clientX: number, clientY: number) {
		if (hoveredIndex !== index) {
			swiperRef.current?.autoplay?.stop()
			setHoveredIndex(index)
		}

		if (hoverFrameRef.current !== null) {
			window.cancelAnimationFrame(hoverFrameRef.current)
		}

		hoverFrameRef.current = window.requestAnimationFrame(() => {
			updatePanelPosition(clientX, clientY)
			hoverFrameRef.current = null
		})
	}

	function handleStageLeave() {
		if (hoverFrameRef.current !== null) {
			window.cancelAnimationFrame(hoverFrameRef.current)
			hoverFrameRef.current = null
		}
		setHoveredIndex(null)
		swiperRef.current?.autoplay?.start()
	}

	function handleStageMove(clientX: number, clientY: number) {
		const swiper = swiperRef.current
		if (!swiper) return

		let bestMatch: { index: number; distance: number } | null = null

		for (const slide of swiper.slides) {
			const rect = slide.getBoundingClientRect()
			if (rect.right <= 0 || rect.left >= window.innerWidth) continue

			const slideIndex = Number(slide.getAttribute('data-swiper-slide-index'))
			if (Number.isNaN(slideIndex)) continue

			const centerX = rect.left + rect.width / 2
			const distance = Math.abs(clientX - centerX)

			if (!bestMatch || distance < bestMatch.distance) {
				bestMatch = { index: slideIndex, distance }
			}
		}

		if (!bestMatch) return

		handleSlideHover(bestMatch.index, clientX, clientY)
	}

	useEffect(() => {
		return () => {
			if (hoverFrameRef.current !== null) {
				window.cancelAnimationFrame(hoverFrameRef.current)
			}
		}
	}, [])

	return (
		<section className='bg-custom-white pt-8 pb-16 lg:pt-10 lg:pb-24'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6'>
				<RevealBlock className='space-y-3 text-center'>
					<h2 className='font-amoria text-4xl text-secondary md:text-5xl'>Nos Prestations</h2>
					<p className='mx-auto max-w-2xl text-secondary/58'>Découvrez nos traitements dermo-esthétiques sur mesure</p>
				</RevealBlock>

				<div className='relative mt-3'>
					<div
						className='relative overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_50%_18%,rgba(251,244,240,0.52),transparent_34%)] px-2 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5'
						onMouseMove={(event) => {
							handleStageMove(event.clientX, event.clientY)
						}}
						onMouseLeave={handleStageLeave}
						style={{
							maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.18) 7%, rgba(0,0,0,0.92) 13%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.92) 87%, rgba(0,0,0,0.18) 93%, transparent 100%)',
							WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.18) 7%, rgba(0,0,0,0.92) 13%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.92) 87%, rgba(0,0,0,0.18) 93%, transparent 100%)',
						}}
					>
						<div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-custom-white via-custom-white/95 to-transparent blur-[14px] sm:w-32 lg:w-44' />
						<div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-custom-white via-custom-white/95 to-transparent blur-[14px] sm:w-32 lg:w-44' />
						<div className='pointer-events-none absolute inset-y-0 left-0 z-[19] w-16 bg-custom-white/78 sm:w-20 lg:w-24' />
						<div className='pointer-events-none absolute inset-y-0 right-0 z-[19] w-16 bg-custom-white/78 sm:w-20 lg:w-24' />

						<Swiper
							modules={[Autoplay, EffectCoverflow]}
							loop
							effect='coverflow'
							centeredSlides
							speed={3200}
							grabCursor
							watchSlidesProgress
							autoplay={{
								delay: 1,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
								waitForTransition: true,
							}}
								coverflowEffect={{
									rotate: 0,
									stretch: -122,
									depth: 240,
									scale: 0.84,
									modifier: 1,
									slideShadows: false,
								}}
								breakpoints={{
									0: { slidesPerView: 1.55, spaceBetween: -56 },
									640: { slidesPerView: 2.95, spaceBetween: -82 },
									1024: { slidesPerView: 5, spaceBetween: -138 },
								}}
							onSwiper={(swiper) => {
								swiperRef.current = swiper
							}}
							onRealIndexChange={(swiper) => {
								setActiveIndex(swiper.realIndex)
							}}
							onTouchStart={() => {
								setHoveredIndex(null)
							}}
							onSliderMove={() => {
								setHoveredIndex(null)
							}}
							className='services-swiper !overflow-visible !py-8 [perspective:1800px]'
						>
								{SERVICES.map((service, index) => {
									const isHovered = hoveredIndex === index
									const isCentered = activeIndex === index

									return (
										<SwiperSlide
											key={service.title}
											className='!h-auto'
											data-service-index={index}
										>
											<div className='flex h-full items-end pb-4 pt-8'>
												<motion.div
													animate={{
														y: isHovered ? -22 : 0,
														scale: isHovered ? 1.05 : isCentered ? 0.96 : 0.82,
														opacity: isHovered ? 1 : isCentered ? 0.86 : 0.44,
													}}
													transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
													className='w-full'
													style={{ zIndex: isHovered ? 40 : isCentered ? 20 : 10 }}
												>
													<ServiceCard service={service} isHovered={isHovered} />
												</motion.div>
											</div>
										</SwiperSlide>
								)
							})}
						</Swiper>
					</div>
				</div>
			</div>

			<AnimatePresence mode='wait'>
				{hoveredIndex !== null && (
					<motion.div
						key={hoveredService.title}
						initial={{ opacity: 0, x: 18, scale: 0.96, filter: 'blur(10px)' }}
						animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
						exit={{ opacity: 0, x: 12, scale: 0.97, filter: 'blur(8px)' }}
						transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
						className='pointer-events-none fixed z-[220] hidden w-[20rem] xl:block'
						style={{ left: panelPosition.x, top: panelPosition.y }}
					>
						<div className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white/84 shadow-[0_26px_60px_rgba(26,54,70,0.14)] backdrop-blur-[22px]'>
							<div className='relative h-44 overflow-hidden'>
								<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_34%),linear-gradient(180deg,rgba(232,197,184,0.20),rgba(46,144,192,0.08))]' />
								<img src={hoveredService.image} alt={hoveredService.title} className='h-full w-full object-cover opacity-92' />
							</div>
							<div className='space-y-5 p-6'>
								<div>
									<p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/74'>{hoveredService.eyebrow}</p>
									<h3 className='mt-3 text-[1.8rem] leading-tight font-medium text-secondary'>{hoveredService.title}</h3>
								</div>
								<p className='text-sm leading-7 text-secondary/66'>{hoveredService.description}</p>
								<div className='grid grid-cols-2 gap-3'>
									<div className='rounded-2xl border border-secondary/8 bg-secondary/4 px-4 py-3'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/44'>Bénéfice</p>
										<p className='mt-2 text-sm font-medium text-secondary'>{hoveredService.benefit}</p>
									</div>
									<div className='rounded-2xl border border-secondary/8 bg-primary/6 px-4 py-3'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/44'>Durée</p>
										<p className='mt-2 text-sm font-medium text-secondary'>{hoveredService.duration}</p>
									</div>
								</div>
								<div className='flex items-center justify-between text-sm text-secondary/56'>
									<span>Consultation personnalisée</span>
									<span className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/18 bg-primary/8 text-primary'>
										<ArrowUpRightIcon size={22} />
									</span>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	)
}

function ServiceCard({
	service,
	isHovered,
}: {
	service: (typeof SERVICES)[number]
	isHovered?: boolean
}) {
	return (
		<div
			className='relative mx-auto w-full max-w-[18rem] cursor-pointer select-none overflow-hidden rounded-t-[5rem] border border-[#eedcd3] bg-[linear-gradient(180deg,#fbf4ef_0%,#fffaf7_100%)]'
			style={{
				boxShadow: isHovered
					? '0 32px 60px -34px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(237, 220, 211, 0.95)'
					: '0 16px 28px -24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(237, 220, 211, 0.78)',
			}}
		>
			<div className='relative overflow-hidden rounded-t-[5rem]'>
				<img
					src={service.image}
					alt={service.title}
					className='aspect-[4/5] w-full object-cover object-center pointer-events-none select-none'
					draggable={false}
				/>
				<div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,244,239,0.04)_0%,rgba(251,244,239,0.42)_100%)]' />
				{isHovered && <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/7 via-transparent to-transparent' />}
			</div>
			<div className='flex items-end justify-between border-t border-[#eedcd3] bg-[linear-gradient(180deg,#fffdfa_0%,#fff_100%)] px-4 py-3.5 lg:px-5 lg:py-4'>
    <p className='max-w-[10rem] text-sm leading-6 font-medium text-secondary lg:max-w-[10.5rem] lg:text-[1rem]'>{service.title}</p>
                                <span className='ml-4 shrink-0 text-primary'>
                                    {/* prefer source flaticon class if available; falls back to ArrowUpRightIcon */}
                                    {service.iconClass ? <i className={service.iconClass} aria-hidden /> : <ArrowUpRightIcon size={24} />}
                                </span>
			</div>
		</div>
	)
}

function MedicalAestheticsSection() {
	return (
		<section className='bg-custom-white pt-16 pb-32 lg:pt-20 lg:pb-52'>
			<RevealBlock className='mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<motion.div
						className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white p-3 shadow-[0_26px_55px_rgba(26,54,70,0.08)] sm:row-span-2'
						initial={{ opacity: 0, x: -30, y: 18, rotate: -1.5, filter: 'blur(14px)' }}
						whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: 'blur(0px)' }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
					>
                        <img src={WIDAMINE_ASSETS.pageHeader} alt='Soin du visage Widamine' className='h-full min-h-[23rem] w-full rounded-[1.5rem] object-cover' />
					</motion.div>
					<motion.div
						className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white p-3 shadow-[0_22px_45px_rgba(26,54,70,0.07)]'
						initial={{ opacity: 0, x: 24, y: 22, filter: 'blur(14px)' }}
						whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
					>
                        <img src={WIDAMINE_ASSETS.pageHeader} alt='Esthétique médicale' className='h-40 w-full rounded-[1.5rem] object-cover' />
					</motion.div>
					<motion.div
						className='rounded-[2rem] border border-secondary/10 bg-[#f8fbfd] p-6 shadow-[0_22px_45px_rgba(26,54,70,0.07)]'
						initial={{ opacity: 0, y: 18, filter: 'blur(12px)' }}
						whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.75, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
					>
						<p className='text-sm leading-7 text-secondary/68'>
							Ici, chaque traitement est une promesse d’excellence, avec une approche qui reste clinique, précise et personnalisée.
						</p>
					</motion.div>
				</div>

				<div className='space-y-7'>
					<div className='space-y-3'>
						<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Esthétique médicale</p>
						<h2 className='max-w-xl font-amoria text-4xl leading-tight text-secondary md:text-5xl'>
							Bienvenue à Widamine Aesthetic Center.
						</h2>
					</div>
					<p className='max-w-2xl text-base leading-8 text-secondary/70'>
						Nous combinons technologies de pointe, savoir-faire expert et accompagnement personnalisé pour offrir des résultats remarquables et durables, adaptés aux besoins uniques de chaque patient.
					</p>
					<div className='grid gap-4 md:grid-cols-3'>
						{MEDICAL_INSIGHTS.map((item) => {
							const Icon = item.icon
							return (
								<div key={item.title} className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-5 shadow-[0_18px_40px_rgba(26,54,70,0.06)]'>
									<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
										<Icon size={20} />
									</div>
									<h3 className='mt-5 text-lg font-semibold text-secondary'>{item.title}</h3>
									<p className='mt-3 text-sm leading-7 text-secondary/66'>{item.description}</p>
								</div>
							)
						})}
					</div>
						<div className='flex flex-wrap gap-3 text-sm'>
							<span className='rounded-full border border-primary/15 bg-primary/6 px-4 py-2 text-secondary'>Hydratation profonde</span>
							<span className='rounded-full border border-primary/15 bg-primary/6 px-4 py-2 text-secondary'>Texture raffinée</span>
							<span className='rounded-full border border-primary/15 bg-primary/6 px-4 py-2 text-secondary'>Aesthetics du visage</span>
							<span className='rounded-full border border-primary/15 bg-primary/6 px-4 py-2 text-secondary'>Approche sur mesure</span>
						</div>
					</div>
				</RevealBlock>
			</section>
		)
}

function ServiceUniverseSection() {
	const [activeProgramIndex, setActiveProgramIndex] = useState(0)
	const activeProgram = PROGRAM_GROUPS[activeProgramIndex]
	const intervalRef = useRef<number | null>(null)

	function showPrevProgram() {
		setActiveProgramIndex((current) => (current === 0 ? PROGRAM_GROUPS.length - 1 : current - 1))
	}

	function showNextProgram() {
		setActiveProgramIndex((current) => (current === PROGRAM_GROUPS.length - 1 ? 0 : current + 1))
	}

	function startAutoSwitch() {
		stopAutoSwitch()
		intervalRef.current = window.setInterval(() => {
			setActiveProgramIndex((current) => (current === PROGRAM_GROUPS.length - 1 ? 0 : current + 1))
		}, 4000)
	}

	function stopAutoSwitch() {
		if (intervalRef.current !== null) {
			window.clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	useEffect(() => {
		startAutoSwitch()
		return () => stopAutoSwitch()
	}, [])

	return (
		<section className='bg-custom-white pt-16 pb-32 lg:pt-20 lg:pb-52'>
			<RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start'>
					<div className='space-y-6'>
						<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Parcours & protocoles</p>
						<h2 className='mt-4 max-w-xl font-amoria text-4xl leading-tight text-secondary md:text-5xl'>
							Une carte de soins plus complète, du diagnostic aux protocoles intensifs.
						</h2>
						<p className='mt-5 max-w-xl text-base leading-8 text-secondary/68'>
							Le centre articule sa prise en charge autour de la consultation, de la dermatologie esthétique, des séances laser, des packs silhouette et des suivis thérapeutiques ou post-opératoires.
						</p>

						<div className='grid max-w-xl gap-3 sm:grid-cols-2'>
							<div className='rounded-[1.5rem] border border-secondary/10 bg-[#fffaf7] px-5 py-4 shadow-[0_14px_30px_rgba(26,54,70,0.05)]'>
								<p className='text-[11px] uppercase tracking-[0.24em] text-secondary/40'>Univers</p>
								<p className='mt-3 text-3xl text-secondary'>03</p>
								<p className='mt-2 text-sm leading-6 text-secondary/62'>Consultation, dermatologie esthétique et technologies laser.</p>
							</div>
							<div className='rounded-[1.5rem] border border-secondary/10 bg-custom-white px-5 py-4 shadow-[0_14px_30px_rgba(26,54,70,0.05)]'>
								<p className='text-[11px] uppercase tracking-[0.24em] text-secondary/40'>Parcours</p>
								<p className='mt-3 text-3xl text-secondary'>360°</p>
								<p className='mt-2 text-sm leading-6 text-secondary/62'>Des protocoles de la première consultation jusqu’au suivi spécialisé.</p>
							</div>
						</div>
					</div>

					<div className='grid gap-5 lg:grid-cols-[0.98fr_1.04fr_0.98fr]'>
						{CARE_UNIVERSES.map((group, index) => (
							<div
								key={group.title}
								className={`relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-[linear-gradient(180deg,#fffdfa_0%,#fff6f0_100%)] p-6 shadow-[0_18px_40px_rgba(26,54,70,0.06)] ${
									index === 1 ? 'lg:-translate-y-4 lg:shadow-[0_24px_50px_rgba(26,54,70,0.08)]' : 'lg:translate-y-6'
								}`}
							>
								<div className='pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-primary/10 blur-3xl' />
								<p className='relative text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/72'>{group.eyebrow}</p>
								<h3 className='relative mt-4 text-[1.85rem] leading-[1.02] text-secondary'>{group.title}</h3>
								<p className='relative mt-4 min-h-[9.25rem] text-sm leading-7 text-secondary/66'>{group.description}</p>
								<div className='relative mt-5 space-y-3'>
									{group.items.map((item) => (
										<div key={item} className='flex gap-3 text-sm leading-6 text-secondary/72'>
											<span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
											<span>{item}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

                <div
                    className='mt-20 overflow-hidden rounded-[2.9rem] border border-secondary/10 bg-[linear-gradient(135deg,#fff8f3_0%,#fffdfb_58%,#f6eee7_100%)] px-7 py-8 shadow-[0_30px_70px_rgba(26,54,70,0.08)] md:px-10 md:py-10'
                    onMouseEnter={() => stopAutoSwitch()}
                    onMouseLeave={() => startAutoSwitch()}
                    onFocus={() => stopAutoSwitch()}
                    onBlur={() => startAutoSwitch()}
                >
                    <div className='relative grid min-h-[28rem] gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:min-h-[32rem]'>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeProgram.title}
                                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                // ensure the program pane fills the fixed parent height and scrolls internally when needed
                                className='flex h-full flex-col justify-between rounded-[2.2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.45))] p-7 shadow-[0_18px_45px_rgba(26,54,70,0.05)] backdrop-blur-sm overflow-hidden'
                            >
                                <div className='flex flex-wrap items-center gap-4'>
									<div className='rounded-full bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary'>
										{activeProgram.label}
									</div>
									<div className='h-px w-16 bg-secondary/14' />
									<div className='text-[11px] uppercase tracking-[0.28em] text-secondary/42'>
										Programme {String(activeProgramIndex + 1).padStart(2, '0')}
									</div>
								</div>

								<h3 className='max-w-[34rem] font-amoria text-4xl leading-[1.04] text-secondary md:text-5xl'>
									{activeProgram.title}
								</h3>

								<p className='max-w-[38rem] text-lg leading-9 text-secondary/74'>
									{activeProgram.description}
								</p>

								<div className='grid gap-3'>
									{activeProgram.items.slice(0, 3).map((item) => (
										<div key={item} className='flex items-start gap-4 rounded-[1.5rem] border border-secondary/8 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(26,54,70,0.04)] backdrop-blur-sm'>
											<div className='mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' />
											<p className='text-sm leading-7 text-secondary/72'>{item}</p>
										</div>
									))}
								</div>

								<div className='mt-7 flex flex-wrap items-center gap-3'>
									<div className='inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-custom-white shadow-[0_18px_35px_rgba(46,144,192,0.22)]'>
										<span>Découvrir ce programme</span>
										<ArrowUpRightIcon size={18} />
									</div>
									<div className='rounded-full border border-secondary/10 bg-white/72 px-5 py-3 text-sm text-secondary/62'>
										{activeProgram.items.length} modules dans ce parcours
									</div>
								</div>
							</motion.div>
						</AnimatePresence>

                        <div className='relative flex min-h-[28rem] items-center lg:min-h-[32rem]'>
							<div className='pointer-events-none absolute -right-10 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />
							<div className='pointer-events-none absolute -bottom-10 left-8 h-44 w-44 rounded-full bg-accent/18 blur-3xl' />

							<AnimatePresence mode='wait'>
								<motion.div
									key={`${activeProgram.title}-aside`}
									initial={{ opacity: 0, x: 18, filter: 'blur(8px)' }}
									animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
									exit={{ opacity: 0, x: -12, filter: 'blur(8px)' }}
									transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className='relative flex h-full w-full flex-col justify-between rounded-[2.25rem] border border-white/60 bg-white/84 p-7 shadow-[0_20px_50px_rgba(26,54,70,0.08)] backdrop-blur-xl lg:min-h-[32rem]'
                                >
									<div className='flex items-center justify-between'>
										<div className='rounded-full border border-primary/20 bg-primary/8 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-primary/80'>
											Sélection active
										</div>
										<div className='rounded-full border border-secondary/10 bg-white/70 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-secondary/46'>
											{activeProgram.items.length} modules
										</div>
									</div>

                                    <div className='overflow-auto'>
                                        <p className='mt-8 text-[1.8rem] leading-[1.42] text-secondary'>
                                            « {activeProgram.items[0]} »
                                        </p>

                                        <p className='mt-8 text-sm leading-7 text-secondary/62'>
                                            Chaque programme est organisé comme un protocole réel : rythme, nombre de séances et combinaison d’appareils sont pensés pour garder une logique clinique et une vraie cohérence de résultats.
                                        </p>
                                    </div>

									<div className='mt-8 space-y-3 rounded-[1.5rem] border border-secondary/8 bg-[#fff9f5] p-4'>
										{activeProgram.items.slice(1, 3).map((item) => (
											<div key={item} className='flex gap-3 text-sm leading-7 text-secondary/70'>
												<span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
												<span>{item}</span>
											</div>
										))}
									</div>

									<div className='mt-8 flex items-center justify-between'>
										<div className='text-sm text-secondary/48'>
											{activeProgram.label} · Widamine Aesthetic Center
										</div>

										<div className='flex items-center gap-3'>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    stopAutoSwitch()
                                                    showPrevProgram()
                                                }}
                                                onBlur={() => startAutoSwitch()}
                                                onFocus={() => stopAutoSwitch()}
                                                className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90'
                                                aria-label='Programme précédent'
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    stopAutoSwitch()
                                                    showNextProgram()
                                                }}
                                                onBlur={() => startAutoSwitch()}
                                                onFocus={() => stopAutoSwitch()}
                                                className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90'
                                                aria-label='Programme suivant'
                                            >
                                                <ChevronRight size={18} />
                                            </button>
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</RevealBlock>
		</section>
	)
}

function BeforeAfterSection() {
	const [split, setSplit] = useState(54)

	return (
		<section className='bg-custom-white pt-0 pb-24 lg:pt-0 lg:pb-32'>
			<RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl text-center'>
					<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Avant / Après</p>
					<h2 className='mt-4 font-amoria text-4xl text-secondary md:text-5xl'>Une lecture visuelle plus claire du résultat</h2>
					<p className='mt-5 text-base leading-8 text-secondary/68'>
						La page de référence utilise des preuves visuelles pour soutenir la confiance. Ce composant apporte cette lecture comparative et pourra accueillir vos vrais cas avant/après.
					</p>
				</div>
					<div className='mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
						<motion.div
							className='relative overflow-hidden rounded-[2.5rem] border border-secondary/10 bg-custom-white shadow-[0_32px_65px_rgba(26,54,70,0.10)]'
							initial={{ opacity: 0, y: 26, scale: 0.985, filter: 'blur(14px)' }}
							whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						>
							<div className='relative aspect-[16/10] overflow-hidden'>
                            <img src={WIDAMINE_ASSETS.beforeAfter[1]} alt='Après' className='absolute inset-0 h-full w-full object-cover' />
							<div className='absolute inset-0 overflow-hidden' style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                                <img src={WIDAMINE_ASSETS.beforeAfter[0]} alt='Avant' className='h-full w-full object-cover grayscale contrast-90 brightness-90' />
							</div>
							<div className='pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]' style={{ left: `${split}%` }} />
							<div className='pointer-events-none absolute top-6 left-6 rounded-full bg-custom-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary shadow-sm'>
								Avant
							</div>
							<div className='pointer-events-none absolute top-6 right-6 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-custom-white shadow-sm'>
								Après
							</div>
							<div className='pointer-events-none absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 bg-custom-white/92 text-secondary shadow-[0_14px_30px_rgba(26,54,70,0.16)]' style={{ left: `calc(${split}% - 24px)` }}>
								<div className='h-4 w-4 rounded-full border border-secondary/18 bg-custom-white' />
							</div>
							<input
								type='range'
								min='20'
								max='80'
								value={split}
								onChange={(e) => setSplit(Number(e.target.value))}
								className='absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0'
								aria-label='Comparer avant et après'
							/>
							</div>
						</motion.div>

						<motion.div
							className='space-y-5'
							initial={{ opacity: 0, x: 24, y: 18, filter: 'blur(14px)' }}
							whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true, amount: 0.25 }}
							transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
						>
							<div className='rounded-[2rem] border border-secondary/10 bg-[#f8fbfd] p-7 shadow-[0_22px_48px_rgba(26,54,70,0.07)]'>
								<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Résultat observé</p>
								<h3 className='mt-4 text-3xl font-medium leading-tight text-secondary'>Des résultats remarquables et durables, dans un cadre sécuritaire.</h3>
								<p className='mt-4 text-sm leading-7 text-secondary/68'>
									Nous combinons des technologies de pointe à un savoir-faire expert pour améliorer la santé de la peau, rajeunir l’apparence et traiter des besoins spécifiques.
								</p>
							</div>
								<div className='grid gap-4 sm:grid-cols-2'>
									<div className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-5'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/45'>Lecture</p>
										<p className='mt-2 text-sm font-medium text-secondary'>Comparaison immédiate</p>
									</div>
									<div className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-5'>
										<p className='text-[10px] uppercase tracking-[0.22em] text-secondary/45'>Usage</p>
										<p className='mt-2 text-sm font-medium text-secondary'>Idéal pour vrais cas patients</p>
									</div>
								</div>
						</motion.div>
					</div>
				</RevealBlock>
			</section>
		)
}

function PatientJourney() {
	return (
		<section className='bg-custom-white pt-0 pb-16 sm:pb-20 lg:pb-24'>
			<RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='mx-auto max-w-3xl text-center'>
					<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Votre parcours</p>
					<h2 className='mt-4 font-amoria text-4xl text-secondary md:text-5xl'>Une expérience pensée pour mettre le patient à l’aise</h2>
					<p className='mt-5 text-base leading-8 text-secondary/68'>
						La référence partage une progression en blocs très lisibles. J’ai repris cette logique avec vos couleurs pour créer un parcours clair et crédible.
					</p>
				</div>
					<div className='mt-14 grid gap-5 lg:grid-cols-3'>
						{JOURNEY_CARDS.map((card) => {
							const Icon = card.icon as Icon
							return (
								<motion.div
									key={card.title}
									className={`rounded-[2rem] p-8 shadow-[0_25px_50px_rgba(26,54,70,0.08)] ${card.tone}`}
									initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
									whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
									viewport={{ once: true, amount: 0.2 }}
									transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
								>
									<div className='mb-10 flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-current/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'>
										<Icon size={22} weight='duotone' />
									</div>
									<h3 className='text-2xl font-semibold'>{card.title}</h3>
									<p className='mt-4 max-w-sm text-sm leading-7 opacity-90'>{card.description}</p>
								</motion.div>
							)
						})}
					</div>
						<div className='mt-10 flex flex-wrap justify-center gap-3 text-sm'>
							<span className='rounded-full border border-secondary/10 bg-custom-white px-4 py-2 text-secondary/72'>Traitements des rides</span>
							<span className='rounded-full border border-secondary/10 bg-custom-white px-4 py-2 text-secondary/72'>Restauration du volume</span>
							<span className='rounded-full border border-secondary/10 bg-custom-white px-4 py-2 text-secondary/72'>Amélioration des lèvres</span>
							<span className='rounded-full border border-secondary/10 bg-custom-white px-4 py-2 text-secondary/72'>Nettoyage de peau en profondeur</span>
						</div>
				</RevealBlock>
			</section>
		)
	}

function ExpertsSection() {
	return (
		<section className='relative overflow-hidden bg-custom-white pt-0 pb-16 sm:pb-20 lg:pb-24'>
			<div className='pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(232,197,184,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(46,144,192,0.18),transparent_30%)]' />
			<RevealBlock className='relative mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
					<div className='max-w-2xl'>
						<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Notre équipe</p>
						<h2 className='mt-4 font-amoria text-4xl text-secondary md:text-5xl'>Des visages et une présence, pas seulement des services</h2>
					</div>
					<p className='max-w-xl text-base leading-8 text-secondary/68'>
						La page gagne en confiance quand elle montre les personnes, la méthode et la qualité de l’accompagnement.
					</p>
				</div>
				<div className='mt-14 grid gap-6 lg:grid-cols-3'>
                    {EXPERTISES.map((expert, idx) => (
                        <motion.article
                            key={expert.name}
							className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white shadow-[0_28px_55px_rgba(26,54,70,0.08)]'
							initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
							whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true, amount: 0.18 }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
						>
                            <div className='h-72 overflow-hidden bg-secondary/5'>
                                <img src={expert.image ?? WIDAMINE_CONTENT.experts[idx % WIDAMINE_CONTENT.experts.length].image} alt={expert.name} className='h-full w-full object-cover' />
                            </div>
							<div className='space-y-4 p-7'>
								<div>
									<p className='text-sm uppercase tracking-[0.18em] text-primary'>{expert.role}</p>
									<h3 className='mt-2 text-2xl font-semibold text-secondary'>{expert.name}</h3>
								</div>
								<p className='text-sm leading-7 text-secondary/68'>{expert.description}</p>
								<div className='flex items-center gap-2 text-sm text-secondary/55'>
									<Star size={15} className='fill-accent text-accent' />
									<span>Approche personnalisée et cadre premium</span>
								</div>
							</div>
						</motion.article>
					))}
				</div>
			</RevealBlock>
		</section>
	)
}

function TestimonialsSection() {
    return (
        <section className='bg-custom-white pt-0 pb-16 sm:pb-20 lg:pb-24'>
            <RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
                <div className='mx-auto max-w-3xl text-center'>
                    <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Que disent nos clients ?</p>
                    <h2 className='mt-4 font-amoria text-4xl text-secondary md:text-5xl'>La satisfaction et la confiance au centre de l’expérience</h2>
                    <p className='mt-5 text-base leading-8 text-secondary/68'>
                        Découvrez les retours des personnes ayant bénéficié de nos services en dermatologie et en esthétique médicale.
                    </p>
                </div>

                <div className='mt-14 grid gap-6 lg:grid-cols-3'>
                    {WIDAMINE_CONTENT.testimonials.map((t, idx) => (
                        <motion.article
                            key={t.name}
                            className='rounded-[2rem] border border-secondary/10 bg-[#fffaf7] p-7 shadow-[0_24px_50px_rgba(26,54,70,0.06)]'
                            initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
                            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            viewport={{ once: true, amount: 0.18 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className='flex items-center gap-3'>
                                <img src={WIDAMINE_ASSETS.testimonials[idx % WIDAMINE_ASSETS.testimonials.length]} alt={t.name} className='h-12 w-12 rounded-full object-cover' />
                                <div className='flex items-center gap-1 text-accent'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={16} className='fill-accent text-accent' />
                                    ))}
                                </div>
                            </div>
                            <p className='mt-6 text-base leading-8 text-secondary/74'>“{t.quote}”</p>
                            <div className='mt-8 border-t border-secondary/8 pt-5'>
                                <p className='text-sm font-semibold text-secondary'>{t.name}</p>
                                <p className='mt-1 text-xs uppercase tracking-[0.18em] text-primary'>{t.service}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </RevealBlock>
        </section>
    )
}

function TrustSection() {
	return (
		<section className='bg-custom-white pt-0 pb-16 sm:pb-20 lg:pb-24'>
			<RevealBlock className='mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10'>
				<div className='rounded-[2.25rem] bg-secondary px-8 py-10 text-custom-white shadow-[0_30px_60px_rgba(26,54,70,0.18)] md:px-10'>
					<p className='text-xs uppercase tracking-[0.28em] text-custom-white/70'>Pourquoi Widamine</p>
					<h2 className='mt-4 font-amoria text-4xl leading-tight md:text-5xl'>Une page qui vend mieux quand elle rassure mieux.</h2>
					<p className='mt-6 max-w-lg text-base leading-8 text-custom-white/78'>
						Le nouveau milieu de page apporte ce qui manquait visuellement: plus de rythme, plus de preuves, et plus de repères pratiques pour convertir.
					</p>
					<div className='mt-8 grid gap-4 sm:grid-cols-3'>
						<div>
							<div className='text-3xl font-semibold'>12+</div>
							<p className='mt-2 text-sm text-custom-white/70'>Protocoles personnalisables</p>
						</div>
						<div>
							<div className='text-3xl font-semibold'>1:1</div>
							<p className='mt-2 text-sm text-custom-white/70'>Suivi individualisé</p>
						</div>
						<div>
							<div className='text-3xl font-semibold'>100%</div>
							<p className='mt-2 text-sm text-custom-white/70'>Palette Widamine conservée</p>
						</div>
					</div>
				</div>

				<div className='grid gap-5 sm:grid-cols-2'>
					{TRUST_POINTS.map((point) => {
						const Icon = point.icon
						return (
							<motion.div
								key={point.title}
								className='rounded-[1.75rem] border border-secondary/10 bg-[#fffaf7] p-6 shadow-[0_22px_45px_rgba(26,54,70,0.06)]'
								initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
								whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
							>
								<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
									<Icon size={20} />
								</div>
								<h3 className='mt-6 text-xl font-semibold text-secondary'>{point.title}</h3>
								<p className='mt-3 text-sm leading-7 text-secondary/68'>{point.description}</p>
							</motion.div>
						)
					})}
				</div>
			</RevealBlock>
		</section>
	)
}

function NewsSection() {
	return (
		<section className='bg-custom-white pt-0 pb-24 lg:pt-0 lg:pb-32'>
			<RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
					<div className='max-w-2xl'>
						<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Latest News</p>
						<h2 className='mt-4 font-amoria text-4xl text-secondary md:text-5xl'>Actualités, services et conseils du centre</h2>
					</div>
					<p className='max-w-xl text-base leading-8 text-secondary/68'>
						Retrouvez nos actualités, services et sujets d’esthétique médicale dans un espace éditorial pensé pour prolonger l’univers du centre.
					</p>
				</div>
				<div className='mt-12 grid gap-6 lg:grid-cols-3'>
					{NEWS_POSTS.map((post) => (
						<motion.article
							key={post.title}
							className='overflow-hidden rounded-[2rem] border border-secondary/10 bg-custom-white shadow-[0_22px_45px_rgba(26,54,70,0.06)]'
							initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }}
							whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							viewport={{ once: true, amount: 0.18 }}
							transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
						>
                                <div className='h-52 overflow-hidden bg-secondary/6'>
                                <img src={WIDAMINE_ASSETS.pageHeader} alt={post.title} className='h-full w-full object-cover' />
                            </div>
							<div className='space-y-4 p-6'>
								<div className='flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-secondary/45'>
									<span>{post.category}</span>
									<span>{post.date}</span>
								</div>
								<h3 className='text-2xl font-medium text-secondary'>{post.title}</h3>
								<p className='text-sm leading-7 text-secondary/68'>{post.excerpt}</p>
								<div className='inline-flex items-center gap-2 text-sm font-medium text-primary'>
									Lire plus
									<ArrowUpRightIcon size={18} />
								</div>
							</div>
						</motion.article>
					))}
				</div>
			</RevealBlock>
		</section>
	)
}

function ConsultationBanner() {
	const { open } = useScheduleModalStore()

	return (
		<section className='bg-custom-white pt-0 pb-24 lg:pt-0 lg:pb-32'>
				<RevealBlock className='mx-auto max-w-7xl px-4 sm:px-6'>
					<div className='relative overflow-hidden rounded-[1.75rem] bg-accent px-5 py-6 text-secondary shadow-[0_28px_55px_rgba(232,197,184,0.35)] sm:rounded-[2.5rem] sm:px-8 sm:py-10 md:px-12 md:py-12'>
						<div className='pointer-events-none absolute -top-14 right-10 h-36 w-36 rounded-full bg-custom-white/20 blur-2xl' />
						<div className='pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-secondary/10 blur-2xl' />
						<div className='relative grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center'>
							<motion.div
								initial={{ opacity: 0, x: -20, y: 14, filter: 'blur(12px)' }}
								whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
								viewport={{ once: true, amount: 0.35 }}
								transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
							>
								<p className='text-xs font-semibold uppercase tracking-[0.28em] text-secondary/60'>Consultation</p>
								<h2 className='mt-4 max-w-2xl font-amoria text-[2rem] leading-tight sm:text-4xl md:text-5xl'>
									Planifiez votre consultation gratuite et découvrez une approche esthétique sur mesure.
								</h2>
								<p className='mt-4 max-w-2xl text-[15px] leading-7 text-secondary/72 sm:mt-5 sm:text-base sm:leading-8'>
									Notre équipe est là pour répondre à vos questions, évaluer vos besoins et construire avec vous un plan de traitement personnalisé dans un cadre accueillant et rassurant.
								</p>
								<div className='mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row'>
								<button onClick={open} className='inline-flex w-full items-center justify-center rounded-full bg-secondary px-7 py-3.5 text-sm font-medium text-custom-white transition hover:bg-secondary/92 sm:w-auto'>
									Réserver maintenant
								</button>
								<Link to='/appointment' className='inline-flex w-full items-center justify-center rounded-full border border-secondary/15 bg-custom-white/75 px-7 py-3.5 text-sm font-medium text-secondary transition hover:bg-custom-white sm:w-auto'>
									Voir les prestations
								</Link>
								</div>
							</motion.div>
							<motion.div
								className='rounded-[1.6rem] border border-secondary/10 bg-custom-white/96 p-5 shadow-[0_18px_40px_rgba(26,54,70,0.08)] sm:rounded-[2rem]'
								initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(10px)' }}
								whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
								viewport={{ once: true, amount: 0.45 }}
								transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
							>
                                <img
                                    src={WIDAMINE_ASSETS.logos.primary}
                                    alt='Widamine'
                                    width='64'
                                    height='64'
                                    loading='eager'
                                    decoding='sync'
                                    fetchPriority='high'
                                    className='mx-auto h-16 w-16 object-contain'
                                />
								<div className='mt-6 space-y-4 text-sm text-secondary/72'>
									<div className='flex items-center gap-3'>
										<CalendarDays size={18} className='text-primary' />
										<span>Consultation gratuite sur rendez-vous</span>
									</div>
									<div className='flex items-center gap-3'>
										<Clock3 size={18} className='text-primary' />
										<span>Lundi au samedi, de 9h à 19h</span>
									</div>
									<div className='flex items-center gap-3'>
										<PhoneCall size={18} className='text-primary' />
										<span>+212 535 624 696</span>
									</div>
									<div className='flex items-center gap-3'>
										<MapPin size={18} className='text-primary' />
										<span>Boulevard Slaoui, Bureaux Nour, 2ème étage, Fès</span>
									</div>
								</div>
							</motion.div>
					</div>
				</div>
			</RevealBlock>
		</section>
	)
}

function ClosingSection() {
	return (
		<section className='bg-custom-white pt-0 pb-24 lg:pt-0 lg:pb-32'>
			<RevealBlock className='mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]'>
					<div className='rounded-[2rem] border border-secondary/10 bg-[#f8fbfd] p-8'>
						<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Informations</p>
						<h2 className='mt-4 font-amoria text-4xl text-secondary'>Contactez Widamine Aesthetic Center</h2>
						<p className='mt-4 max-w-lg text-base leading-8 text-secondary/68'>
							Pour en savoir plus sur nos traitements, planifier une consultation ou poser une question à notre équipe, nous restons disponibles pour vous accompagner.
						</p>
					</div>
				<div className='grid gap-5 sm:grid-cols-3'>
						<motion.div className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-6 shadow-[0_18px_40px_rgba(26,54,70,0.06)]' initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
							<MapPin size={18} className='text-primary' />
							<h3 className='mt-5 text-xl font-semibold text-secondary'>Adresse</h3>
							<p className='mt-3 text-sm leading-7 text-secondary/68'>Boulevard Slaoui, Bureaux Nour (en face cinéma Astor), 2ème étage, Fès.</p>
						</motion.div>
					<motion.div className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-6 shadow-[0_18px_40px_rgba(26,54,70,0.06)]' initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
						<PhoneCall size={18} className='text-primary' />
						<h3 className='mt-5 text-xl font-semibold text-secondary'>Téléphone</h3>
						<p className='mt-3 text-sm leading-7 text-secondary/68'>+212 (535) 624 696<br />+212 (535) 930 182<br />+212 (694) 722 113</p>
					</motion.div>
						<motion.div className='rounded-[1.75rem] border border-secondary/10 bg-custom-white p-6 shadow-[0_18px_40px_rgba(26,54,70,0.06)]' initial={{ opacity: 0, y: 24, filter: 'blur(14px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
							<Clock3 size={18} className='text-primary' />
							<h3 className='mt-5 text-xl font-semibold text-secondary'>Horaires</h3>
							<p className='mt-3 text-sm leading-7 text-secondary/68'>Lundi à samedi, de 9h à 19h<br />Consultations et accueil sur rendez-vous</p>
						</motion.div>
				</div>
			</RevealBlock>
		</section>
	)
}
