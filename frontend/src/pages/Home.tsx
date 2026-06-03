import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNavbar from '@/components/PublicNavbar'
import WIDAMINE_ASSETS, { WIDAMINE_CONTENT } from '@/lib/widamineSource'

const quotes = [
	{ text: 'La nature nous donne la beauté, la sagesse nous aide à la révéler.', author: 'Proverbe chinois' },
	{ text: 'La beauté réside dans la vérité.', author: 'Platon' },
	{ text: 'La simplicité est la sophistication suprême.', author: 'Léonard de Vinci' },
	{ text: 'La beauté commence au moment où vous décidez d\'être vous-même.', author: 'Coco Chanel' },
	{ text: 'Je vous souhaite d\'être au lieu de paraître.', author: 'Pierre Rabhi' },
	{ text: 'On ne peut percevoir la beauté qu\'avec un esprit serein.', author: 'Henry David Thoreau' },
]

const methodCards = [
	{
		title: 'Traitements du visage',
		href: '/appointment',
		icon: (
			<svg xmlns='http://www.w3.org/2000/svg' width='44' height='91' viewBox='0 0 44 91' fill='none'>
				<path d='M13.7736 64.6343C9.42909 66.5848 7.62586 70.846 7.77719 75.6056C7.92851 80.3651 10.9247 86.6199 15.1469 88.8223C19.3696 91.0242 24.6402 90.9164 28.9173 88.8223C33.2328 86.7096 36.6254 80.5319 36.4075 75.732C36.1991 71.1419 32.9537 67.3338 29.8782 63.9203C30.1378 63.5547 30.6852 58.9374 31.092 55.1963L13.6142 54.2195L13.7736 64.6343Z' fill='currentColor' />
				<path d='M36.7295 25.8855C34.9362 26.1773 33.0686 26.4655 31.3293 25.9404C29.5899 25.4153 28.0304 23.8168 28.1863 22.0068C28.4047 19.4704 31.5146 18.3341 34.06 18.3024C36.6053 18.2707 39.4556 18.6554 41.4197 17.0361C42.914 15.8037 43.4133 13.5129 42.5678 11.7704C41.7224 10.0279 39.6133 9.00257 37.7208 9.41397C35.3544 9.92821 33.8819 12.2226 31.9468 13.6779C30.0117 15.1332 26.3939 15.1377 25.9721 12.7531C25.4909 10.0306 29.7299 8.85442 30.5346 6.20936C30.9818 4.73913 30.1903 3.10625 28.9737 2.16702C27.7572 1.22779 26.2018 0.855815 24.6813 0.633355C22.7222 0.346558 20.6575 0.280416 18.8294 1.04068C17.0012 1.80049 15.4757 3.56113 15.511 5.54062C15.5459 7.48658 16.9758 9.07733 17.892 10.7949C18.8081 12.5121 18.987 15.0906 17.2635 15.9953C14.9397 17.2159 12.8152 14.0988 10.4429 12.9756C8.19748 11.9127 5.1877 12.9847 4.1198 15.2278C3.0519 17.471 4.11708 20.4831 6.35754 21.556C8.53503 22.5989 11.094 21.8645 13.508 21.8156C15.922 21.7666 18.8846 23.1363 18.7474 25.5466C18.6654 26.9915 17.4026 28.1473 16.0235 28.5863C14.6443 29.0254 13.1591 28.9044 11.7147 28.8083C8.67729 28.6067 5.3558 28.6203 2.95087 30.4865C0.545946 32.3528 0.0724764 36.7594 2.77825 38.1539C4.51715 39.0501 6.64162 38.3352 8.35742 37.3946C10.0728 36.454 11.7768 35.2601 13.7318 35.194C15.6873 35.1278 17.8353 36.9025 17.2413 38.7665C16.8299 40.0564 15.3629 40.6921 14.0186 40.8525C12.6743 41.0128 11.2748 40.866 9.99665 41.3123C7.73218 42.1034 6.41282 44.9125 7.24965 47.1606C8.08693 49.4088 10.9218 50.6706 13.1528 49.788C15.0924 49.0205 16.2351 47.0691 17.5 45.4104C18.765 43.7517 20.6752 42.1569 22.7104 42.6136C25.5063 43.2406 26.0981 46.9345 27.9865 49.0898C29.304 50.5936 31.5128 51.3466 33.4071 50.7073C35.3014 50.0685 36.6375 47.9286 36.1473 45.9903C35.5066 43.4581 32.5757 42.4387 30.2668 41.2167C27.9579 39.9943 25.8117 36.9628 27.542 35.0055C28.6217 33.7845 30.5885 33.9023 32.0918 34.5316C33.5951 35.1609 34.9398 36.1939 36.5301 36.5509C39.3387 37.1816 42.4695 35.2157 43.1215 32.4121C43.7735 29.6085 41.7976 25.0605 36.7295 25.8855Z' fill='#FFB500' />
			</svg>
		),
	},
	{
		title: 'Traitements du corps',
		href: '/appointment',
		icon: (
			<svg xmlns='http://www.w3.org/2000/svg' width='50' height='94' viewBox='0 0 50 94' fill='none'>
				<path d='M17.6799 54.7661C19.1201 52.5061 19.0139 49.6408 17.6673 47.3233C17.2025 46.5234 17.0093 45.7193 17.4548 45.2908C18.4447 44.3382 19.961 44.2107 21.3316 44.3144C22.7015 44.418 24.1009 44.695 25.431 44.3512C28.9054 43.453 30.6673 38.706 34.2535 38.5772C35.0113 38.5501 35.9299 38.9273 35.9824 39.6835C36.038 40.4839 35.1377 40.9509 34.4374 41.3442C32.222 42.5877 30.8542 45.1983 31.0932 47.7278C31.322 50.1562 32.8693 52.266 34.6319 53.9517C36.3945 55.6374 38.4257 57.0401 40.0606 58.8507C43.8292 63.025 45.0781 69.3133 43.1918 74.6111C41.7405 78.6866 38.6489 82.4219 37.009 86.4491C35.8851 89.2089 33.2759 91.0771 30.3093 91.3621C30.2347 91.3693 30.1602 91.3765 30.0863 91.3836C27.2725 91.6526 24.5702 90.4015 22.8253 88.1782C20.2581 84.9073 16.3606 82.4123 13.792 79.0892C10.796 75.2133 9.71635 69.9253 10.954 65.1855C11.9301 61.4458 15.2919 58.5124 17.6799 54.7661Z' fill='currentColor' />
			</svg>
		),
	},
	{
		title: 'Les différentes techniques',
		href: '/appointment',
		icon: (
			<svg xmlns='http://www.w3.org/2000/svg' width='52' height='92' viewBox='0 0 52 92' fill='none'>
				<path d='M22.778 67.8109C23.0576 67.6464 23.2704 67.5371 23.4319 67.4739C24.0733 67.2199 24.7153 66.9669 25.3558 66.7123C26.3488 66.3196 27.3415 65.9252 28.3346 65.5325C29.2055 65.1855 30.0749 64.8368 30.9496 64.4976C31.9591 64.1075 32.9738 63.7295 33.9316 63.2331C35.0608 62.6428 36.0768 61.8709 36.9452 60.8834C37.8448 59.8614 38.5143 58.6815 38.9315 57.3682C39.6902 55.0685 39.8554 52.6807 39.4873 50.301C39.3257 49.2547 39.0338 48.2388 38.6192 47.2606C38.3818 46.7141 38.2578 46.1186 38.2538 45.5153C38.2497 44.912 38.3656 44.3145 38.5957 43.7645C38.9931 42.8112 39.7327 42.1673 40.7736 41.9074C41.6797 41.679 42.6334 41.7345 43.5069 42.0675C44.3803 42.4004 45.1292 42.9929 45.6486 43.7658C46.1145 44.4535 46.2859 45.2511 46.1371 46.0229C45.9883 46.7947 45.5295 47.4786 44.8587 47.9264C44.3142 48.285 43.711 48.5374 43.0775 48.672C42.4439 48.8065 41.7918 48.8207 41.1531 48.7137' fill='currentColor' />
			</svg>
		),
	},
]

const teamMembers = [
	{
		name: 'Dr. Widad SLAOUI',
		role: 'Fondatrice · Médecin Esthétique',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Dermatologue spécialisée en dermatologie esthétique et laser. Fondatrice du Widamine Aesthetic Center, elle met son expertise au service de la beauté naturelle.',
	},
	{
		name: 'Dr. Myriam BITBOL',
		role: 'Médecin',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Médecin généraliste diplômée en médecine esthétique, elle accompagne les patients avec une approche minutieuse et personnalisée.',
	},
	{
		name: 'Dr. Isabelle DUQUENNE',
		role: 'Médecin',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Médecin généraliste spécialisé en médecine esthétique et laser, elle apporte son expertise à chaque consultation.',
	},
	{
		name: 'Tan',
		role: 'Responsable de la Relation Patient',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Tan est votre interlocuteur privilégié pour toute question ou rendez-vous, garantissant un accueil et un suivi irréprochables.',
	},
	{
		name: 'Anaëlle',
		role: 'Assistante Laser & Manageuse',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Dès votre arrivée, Anaëlle veille à votre confort et à la bonne coordination de votre parcours de soins.',
	},
	{
		name: 'Sarah',
		role: 'Assistante Laser',
		image: WIDAMINE_ASSETS.pageHeader,
		desc: 'Lors de votre visite au cabinet, Sarah vous accueille et s\'assure du bon déroulement de votre séance laser.',
	},
]

const testimonials = [
	{ name: 'Sara C.', quote: 'Après 5 praticiens différents, j\'ai enfin trouvé un cabinet à l\'écoute de mes vrais besoins avec une approche médecin qui m\'a tout de suite rassurée.' },
	{ name: 'Hila S.', quote: 'Oui, 5 ⭐️ pour ce cabinet innovant et à la pointe : j\'ai testé le laser pour mes cicatrices d\'acné, les résultats sont bluffants !' },
	{ name: 'Marine D.', quote: 'Je sors à l\'instant du tout nouveau cabinet. Moderne, spacieux, l\'équipe est adorable et à l\'écoute. Je recommande les yeux fermés.' },
	{ name: 'Guillaume C.', quote: 'J\'ai eu une expérience exceptionnelle. Le docteur a pris le temps de tout m\'expliquer, les résultats sont au rendez-vous.' },
	{ name: 'Romina S.', quote: 'C\'est un cabinet à l\'image de sa fondatrice : élégant, moderne et professionnel. Une adresse rare à recommander sans hésitation.' },
]

const galleryImages = [WIDAMINE_ASSETS.pageHeader, WIDAMINE_ASSETS.pageHeader, WIDAMINE_ASSETS.pageHeader, WIDAMINE_ASSETS.pageHeader]

export default function Home() {
	return (
		<div className='page-landing'>
			<Hero />
			<IntroSection />
			<EnergySection />
			<ConceptSection />
			<MethodSection />
			<TeamSection />
			<GallerySection />
			<TestimonialsSection />
			<ContactSection />
		</div>
	)
}

function Hero() {
	const { open } = useScheduleModalStore()

	return (
		<header className='relative overflow-visible bg-custom-white pt-[4.625rem]'>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[5.838rem]'>
				<div className='flex flex-col items-center gap-[4.624rem] text-center'>
					<img
						src={WIDAMINE_ASSETS.logos.primary}
						alt='Widamine'
						className='h-[11.708rem] w-[18rem] object-contain'
					/>
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
					>
						<div className='flex flex-col items-center gap-[2.107rem]'>
							<h1 className='font-newsreader text-[clamp(2rem,1.242rem+2.59vw,4.33rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
								Bienvenue dans <span className='italic'>la jungle</span> de la{' '}
								<span className='italic'>dermatologie</span> esthétique.
							</h1>
							<button
								onClick={open}
								className='inline-flex items-center gap-2.5 rounded-full border border-white bg-primary px-5 py-4 font-lexend text-[1.03rem] font-[600] leading-none text-white transition-all duration-300 hover:bg-primary/90'
							>
								Découvrir le centre
								<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25' fill='none' className='h-[1.25rem] w-[1.25rem]'>
									<path d='M0.78047 22.4904L6.74449 16.5264C3.24591 12.2475 3.87845 5.94264 8.15731 2.44411C12.4362 -1.05443 18.741 -0.421981 22.2396 3.85689C25.7382 8.13575 25.1056 14.4406 20.8268 17.9392C17.1412 20.9527 11.8429 20.9527 8.15727 17.9392L2.19325 23.9032C1.79631 24.2866 1.16376 24.2756 0.780422 23.8786C0.406507 23.4914 0.406507 22.8776 0.78047 22.4904ZM22.4694 10.2076C22.4694 5.79302 18.8907 2.21428 14.4761 2.21428C10.0615 2.21428 6.48272 5.79302 6.48272 10.2076C6.48272 14.6222 10.0615 18.201 14.4761 18.201C18.8886 18.196 22.4644 14.6202 22.4694 10.2076Z' fill='currentColor' />
								</svg>
							</button>
						</div>
					</motion.div>
				</div>
			</div>
		</header>
	)
}

function useScheduleModalStore() {
	return { open: () => {} }
}

function IntroSection() {
	return (
		<section className='relative overflow-visible bg-custom-white'>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<div className='flex flex-col items-center gap-[2.107rem] text-center'>
					<h2 className='font-newsreader text-[clamp(1.8rem,1.3rem+1.2vw,3.267rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
						Widamine, plus qu'un centre, <span className='italic'>Un lieu</span>.
					</h2>
					<p className='max-w-[64rem] font-lexend text-[1.125rem] leading-[1.967em] text-secondary'>
						Devant l'attrait que suscite l'esthétique en général, et alors qu'on voit fleurir de nombreux centres proposant des centaines de soins différents, Widamine Aesthetic Center est un lieu qui répond aux problématiques des patient.e.s, en ramenant l'écoute, l'expertise et la compétence du soin, au coeur de l'esthétique. Une information de qualité et adaptée à votre demande — ou plutôt à votre besoin — vous permettra d'y voir plus clair dans la jungle de toutes les techniques esthétiques, injections et lasers.
					</p>
				</div>
			</div>
		</section>
	)
}

function EnergySection() {
	const [activeQuote, setActiveQuote] = useState(0)

	return (
		<section className='relative bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af39f7670ee768b6e3aed5_feature-background.svg)', backgroundRepeat: 'no-repeat', backgroundPosition: '100% 75%', backgroundSize: 'auto 26.1rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<div className='flex flex-row items-center justify-between gap-[4.624rem]'>
					<div className='flex max-w-[32rem] flex-col items-start gap-[2.107rem]'>
						<h2 className='font-newsreader text-[clamp(1.5rem,1.1rem+1vw,2.462rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
							<span className='italic'>L'énergie</span> du Widamine
						</h2>
						<p className='font-lexend text-[1.398rem] font-[600] leading-[1.3em] text-secondary'>
							Que ça soit pour des rides, de la couperose, des taches de soleil ou des cicatrices disgracieuses, des solutions existent.
						</p>
						<p className='font-lexend text-[1.125rem] leading-[1.967em] text-secondary'>
							Elles demandent une expertise médicale et une compétence particulière, et doivent s'employer à respecter la peau et sa physiologie.
						</p>
						<Link to='/appointment' className='inline-flex items-center gap-2.5 rounded-full border border-white bg-primary px-5 py-4 font-lexend text-[1.03rem] font-[600] leading-none text-white transition-all duration-300 hover:bg-primary/90'>
							Traitements du visage
							<svg xmlns='http://www.w3.org/2000/svg' width='24' height='25' viewBox='0 0 24 25' fill='none' className='h-[1.25rem] w-[1.25rem]'>
								<path d='M8.46465 10.0305C7.52069 9.08619 6.99971 7.8308 6.99971 6.49438C6.99971 5.15796 7.52069 3.90157 8.46465 2.95827L10.1446 1.25674C11.1745 0.249429 12.8265 0.250429 13.8424 1.24374L15.5394 2.96328C16.4783 3.90157 16.9993 5.15796 16.9993 6.49438C16.9993 7.8308 16.4783 9.08719 15.5344 10.0305C14.5914 10.9748 13.3354 11.4959 11.9995 11.4959C10.6636 11.4959 9.40861 10.9748 8.46465 10.0305ZM8.99963 6.49438C8.99963 7.29663 9.31161 8.04986 9.87859 8.61604C11.0115 9.7494 12.9885 9.7514 14.1194 8.61604C14.6864 8.04986 14.9994 7.29663 14.9994 6.49438C14.9994 5.69213 14.6864 4.93889 14.1204 4.37272L12.4315 2.66118C12.3175 2.55015 12.1615 2.49313 12.0045 2.49313C11.8435 2.49313 11.6795 2.55315 11.5555 2.67419L9.88359 4.36771C9.31261 4.93889 8.99963 5.69213 8.99963 6.49438Z' fill='currentColor' />
							</svg>
						</Link>
					</div>

					<div className='flex max-w-[20rem] flex-col gap-[2.107rem]'>
						{quotes.map((q, i) => (
							<button
								key={i}
								type='button'
								onClick={() => setActiveQuote(i)}
								className={`text-left transition-all duration-500 ${i === activeQuote ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
							>
								<p className='font-lexend text-[1.25rem] font-[500] leading-[1.77em] text-primary'>{q.text}</p>
								<p className='mt-1 font-lexend text-[0.875rem] text-secondary/60'>{q.author}</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

function ConceptSection() {
	return (
		<section className='relative bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ac689ff674341b86a1dcb0_techniques-header-bg.svg), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4e74050831a093eaa9d5_header-middle-visual.svg)', backgroundRepeat: 'no-repeat, no-repeat', backgroundPosition: '0% 70%, 50% 0%', backgroundSize: 'auto 32rem, 10rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<div className='flex flex-row items-center justify-between gap-[4.624rem]'>
					<div className='relative shrink-0'>
						<img src={WIDAMINE_ASSETS.pageHeader} alt='Widamine concept' className='relative z-10 h-auto w-[26.25rem] rounded-[1.25rem] object-cover' />
					</div>
					<div className='flex max-w-[32rem] flex-col items-start gap-[2.107rem]'>
						<h2 className='font-newsreader text-[clamp(1.5rem,1.1rem+1vw,2.462rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
							<span className='italic'>Le concept</span> Widamine
						</h2>
						<p className='font-lexend text-[1.398rem] font-[600] leading-[1.3em] text-secondary'>
							Widamine est une nouvelle façon d'aborder l'esthétique en médecine.
						</p>
						<p className='font-lexend text-[1.125rem] leading-[1.967em] text-secondary'>
							Un lieu chaleureux où l'expertise médicale et les compétences en laser se mettent au service de la santé et du bien-être — et non au service d'une société de consommation.
						</p>
						<Link to='/appointment' className='inline-flex items-center gap-2.5 rounded-full border border-white bg-primary px-5 py-4 font-lexend text-[1.03rem] font-[600] leading-none text-white transition-all duration-300 hover:bg-primary/90'>
							Découvrir le concept
							<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25' fill='none' className='h-[1.25rem] w-[1.25rem]'>
								<path d='M22.4694 10.2076C22.4694 5.79302 18.8907 2.21428 14.4761 2.21428C10.0615 2.21428 6.48272 5.79302 6.48272 10.2076C6.48272 14.6222 10.0615 18.201 14.4761 18.201C18.8886 18.196 22.4644 14.6202 22.4694 10.2076Z' fill='currentColor' />
							</svg>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

function MethodSection() {
	return (
		<section className='relative overflow-visible bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b107c47af032be03ef85aa_methode-top-right.avif), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b107c44f5b877a2c124b9b_methode-grass-bottom.svg), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b107c45c745da7554135bc_methode-top-left.avif)', backgroundRepeat: 'no-repeat, no-repeat, no-repeat', backgroundPosition: '100% -2%, 100% 120%, 0% 0%', backgroundSize: 'auto 19rem, 50%, auto 23rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<div className='flex flex-col items-center gap-[3.3rem]'>
					<h2 className='font-newsreader text-[clamp(1.8rem,1.3rem+1.2vw,3.267rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
						<span className='italic'>La méthode</span> Widamine
					</h2>
					<div className='flex w-full flex-row items-stretch gap-6'>
						{methodCards.map((card) => (
							<Link
								key={card.title}
								to={card.href}
								className='flex flex-1 flex-col items-center gap-[2.107rem] rounded-[1.25rem] bg-primary px-[2.107rem] py-[3.312rem] text-center shadow-[0_12px_32px_rgba(239,96,7,0.2)] transition-all duration-300 hover:-translate-y-1'
							>
								<div className='text-white opacity-80' style={{ width: '3rem', height: 'auto' }}>
									{card.icon}
								</div>
								<h3 className='font-lexend text-[clamp(1.5rem,1.2rem+0.5vw,2.107rem)] font-[600] leading-[1.05em] text-white'>{card.title}</h3>
								<div className='inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-transparent px-5 py-3 font-lexend text-[0.9rem] font-[600] leading-none text-white transition-all duration-300 hover:bg-white/10'>
									Découvrir les traitements
									<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25' fill='none' className='h-[1.1rem] w-[1.1rem]'>
										<path d='M24.6109 5.64009L19.6109 0.640087C19.4223 0.457929 19.1697 0.357134 18.9075 0.359413C18.6453 0.361691 18.3945 0.46686 18.2091 0.652268C18.0237 0.837676 17.9185 1.08849 17.9162 1.35069C17.9139 1.61288 18.0147 1.86548 18.1969 2.05409L19.9899 3.84709L18.5039 5.33009C17.5435 4.6249 16.3628 4.28586 15.1746 4.37405C13.9864 4.46224 12.8687 4.97185 12.0229 5.81109L5.95389 11.8831C5.30197 12.5315 4.78511 13.3028 4.43323 14.1523C4.08135 15.0018 3.90143 15.9126 3.90389 16.8321V19.9321L1.19689 22.6401C1.10138 22.7323 1.0252 22.8427 0.972788 22.9647C0.920379 23.0867 0.892793 23.2179 0.891639 23.3507C0.890486 23.4835 0.915787 23.6151 0.966068 23.738C1.01635 23.8609 1.0906 23.9726 1.18449 24.0665C1.27839 24.1604 1.39004 24.2346 1.51294 24.2849C1.63583 24.3352 1.76751 24.3605 1.90029 24.3593C2.03307 24.3582 2.16429 24.3306 2.28629 24.2782C2.4083 24.2258 2.51864 24.1496 2.61089 24.0541L5.31789 21.3471H8.41789C9.33737 21.3495 10.2482 21.1696 11.0977 20.8177C11.9472 20.4659 12.7185 19.949 13.3669 19.2971L19.4389 13.2251C20.2788 12.3803 20.789 11.2631 20.8774 10.0752C20.9658 8.88724 20.6265 7.70684 19.9209 6.74709L21.4039 5.26109L23.1969 7.05409C23.3855 7.23624 23.6381 7.33704 23.9003 7.33476C24.1625 7.33248 24.4133 7.22731 24.5987 7.04191C24.7841 6.8565 24.8893 6.60569 24.8916 6.34349C24.8938 6.08129 24.793 5.82869 24.6109 5.64009Z' fill='currentColor' />
									</svg>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

function TeamSection() {
	const [activeIndex, setActiveIndex] = useState(0)

	return (
		<section className='relative overflow-clip bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4ea27518914b10e9001c_section-2-left-bubbles.svg), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b22d8caadf7a99405e08ed_team-bottom-left.avif), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b22d4ee426e61a51a233f2_team-top-right.avif)', backgroundRepeat: 'no-repeat, no-repeat, no-repeat', backgroundPosition: '0% 0%, 0% 100%, 100% 0%', backgroundSize: 'auto 8rem, auto 6rem, auto 8rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<h2 className='font-newsreader text-[clamp(1.5rem,1.1rem+1vw,2.462rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
					<span className='italic'>L'équipe</span> du Widamine
				</h2>
				<div className='mt-12 flex gap-6 overflow-x-auto pb-4'>
					{teamMembers.map((member, i) => (
						<div
							key={member.name}
							className={`min-w-[18rem] flex-1 shrink-0 overflow-hidden rounded-[1.25rem] border border-secondary/8 bg-white/80 transition-all duration-300 ${i === activeIndex ? 'ring-2 ring-primary/30' : ''}`}
							onClick={() => setActiveIndex(i)}
						>
							<div className='relative h-72 overflow-hidden bg-secondary/5'>
								<img src={member.image} alt={member.name} className='h-full w-full object-cover' />
							</div>
							<div className='p-6'>
								<p className='font-lexend text-[1.125rem] font-[500] leading-[2em] text-secondary'>{member.role}</p>
								<h3 className='font-newsreader text-[clamp(1.2rem,1.1rem+0.3vw,1.836rem)] font-[600] leading-[1.6em] text-secondary'>{member.name}</h3>
								<p className='mt-2 font-lexend text-[0.875rem] leading-[2.15em] text-secondary/70'>{member.desc}</p>
							</div>
						</div>
					))}
				</div>
				<div className='mt-6 flex items-center justify-center gap-2'>
					{teamMembers.map((_, i) => (
						<button
							key={i}
							type='button'
							onClick={() => setActiveIndex(i)}
							className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-secondary/20'}`}
							aria-label={`Membre ${i + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

function GallerySection() {
	const [activeIndex, setActiveIndex] = useState(0)

	return (
		<section className='relative overflow-visible bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4e74050831a093eaa9d5_header-middle-visual.svg), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b3106d810ecd28f2e75652_apercu-top-right.avif), url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b3106d933cb4cb9c3e481e_apercu-top-left.svg)', backgroundRepeat: 'no-repeat, no-repeat, no-repeat', backgroundPosition: '54% 12%, 100% 0%, 0% 0%', backgroundSize: 'auto 7rem, auto 20rem, auto 28rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<h2 className='font-newsreader text-[clamp(1.5rem,1.1rem+1vw,2.462rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
					<span className='italic'>Un aperçu</span> du Widamine
				</h2>
				<p className='mt-3 max-w-[38rem] font-lexend text-[1.398rem] font-[600] leading-[1.3em] text-secondary'>
					Voici quelques photos des lieux, un concept-centre unique en son genre.
				</p>
				<p className='mt-2 max-w-[48rem] font-lexend text-[1.125rem] leading-[1.967em] text-secondary'>
					Un univers chaleureux et musical qui vous fait voyager, depuis l'accueil mélangeant le bois et les couleurs, aux différentes salles de traitement en passant par la salle d'attente et son comptoir de boissons fraîches ou chaudes selon la saison...
				</p>
				<div className='mt-12 flex gap-4 overflow-x-auto pb-4'>
					{[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
						<div
							key={i}
							className={`min-w-[16rem] shrink-0 overflow-hidden rounded-[1.25rem] transition-all duration-300 ${i % 4 === activeIndex ? 'ring-2 ring-primary/30' : ''}`}
							onClick={() => setActiveIndex(i % 4)}
						>
							<div className='aspect-[4/3] overflow-hidden'>
								<img src={galleryImages[i % galleryImages.length]} alt={`Widamine aperçu ${i + 1}`} className='h-full w-full object-cover transition-transform duration-500 hover:scale-105' />
							</div>
						</div>
					))}
				</div>
				<div className='mt-6 flex items-center justify-center gap-2'>
					{[0, 1, 2, 3].map((_, i) => (
						<button
							key={i}
							type='button'
							onClick={() => setActiveIndex(i)}
							className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-secondary/20'}`}
							aria-label={`Image ${i + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

function TestimonialsSection() {
	const [activeIndex, setActiveIndex] = useState(0)

	return (
		<section className='relative overflow-visible bg-custom-white' style={{ backgroundImage: 'url(https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66dd7e4b6fc2046c11f363ee_testimonial-bg-lezard.avif)', backgroundRepeat: 'no-repeat', backgroundPosition: '0% 0%', backgroundSize: 'auto 16rem' }}>
			<div className='mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] py-[11.882rem]'>
				<h2 className='font-newsreader text-[clamp(1.5rem,1.1rem+1vw,2.462rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-secondary'>
					<span className='italic'>Les Témoignages</span> de nos patient(e)s
				</h2>
				<div className='mt-12 flex gap-6 overflow-x-auto pb-4'>
					{testimonials.map((t, i) => (
						<div
							key={t.name}
							className={`min-w-[22rem] flex-1 shrink-0 rounded-[1.25rem] border border-secondary/8 bg-white/80 p-6 transition-all duration-300 ${i === activeIndex ? 'ring-2 ring-primary/30' : ''}`}
							onClick={() => setActiveIndex(i)}
						>
							<div className='flex items-center gap-1 text-primary'>
								{[...Array(5)].map((_, s) => (
									<svg key={s} className='h-4 w-4 fill-current' viewBox='0 0 20 20'>
										<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
									</svg>
								))}
							</div>
							<p className='mt-4 font-lexend text-[1.125rem] leading-[1.967em] text-secondary'>"{t.quote}"</p>
							<div className='mt-6 border-t border-secondary/8 pt-4'>
								<p className='font-lexend text-[1.125rem] font-[600] leading-[1.6em] text-secondary'>{t.name}</p>
							</div>
						</div>
					))}
				</div>
				<div className='mt-6 flex items-center justify-center gap-2'>
					{testimonials.map((_, i) => (
						<button
							key={i}
							type='button'
							onClick={() => setActiveIndex(i)}
							className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-secondary/20'}`}
							aria-label={`Témoignage ${i + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

function ContactSection() {
	return (
		<section className='relative overflow-visible'>
			<div className='absolute inset-0 bg-secondary/95' />
			<div className='relative mx-auto max-w-[120rem] px-[clamp(1.25rem,0.178rem+5.36vw,6.608rem)] pb-[11.882rem] pt-[11.882rem]'>
				<div className='flex flex-row items-start justify-between gap-[4.624rem]'>
					<div className='flex max-w-[36rem] flex-col items-start gap-6'>
						<h2 className='font-newsreader text-[clamp(1.8rem,1.3rem+1.2vw,3.267rem)] font-[500] leading-[1.6em] tracking-[-0.03em] text-white'>
							Comment prendre rendez-vous au Widamine ?
						</h2>
						<div className='flex flex-col gap-3'>
							<h3 className='font-newsreader text-[1.3rem] font-[500] leading-[1.6em] text-white/90'>Pour une consultation, 2 solutions :</h3>
							<p className='font-lexend text-[1.125rem] leading-[1.967em] text-white/70'>La consultation en présentiel ou la visio-consultation (qui permet souvent de diminuer le délai).</p>
						</div>
						<a href='tel:+212535624696' className='flex w-full items-center gap-4 border-b border-white/15 py-6 font-lexend text-[1.03rem] leading-[1.5em] text-white transition-all duration-300 hover:text-primary'>
							<svg xmlns='http://www.w3.org/2000/svg' width='25' height='24' viewBox='0 0 25 24' fill='none' className='h-6 w-6 shrink-0 text-primary'>
								<path d='M21.2093 14.0401C20.5411 13.4034 19.6534 13.0482 18.7304 13.0482C17.8074 13.0482 16.9198 13.4034 16.2515 14.0401L15.8415 14.441C13.2799 13.2729 11.2291 11.2149 10.0698 8.64926L10.4587 8.25432C11.1046 7.60044 11.47 6.72046 11.4773 5.80141C11.4846 4.88235 11.1332 3.99668 10.4978 3.33262L8.3407 1.00909C7.6799 0.377435 6.8031 0.0215213 5.889 0.0138851C4.97489 0.00624886 4.09227 0.347465 3.42101 0.967997C3.42101 0.967997 2.35146 1.90021 2.3264 1.92427C-5.58741 10.213 14.2778 30.0912 22.5745 22.1724C22.5986 22.1474 23.5308 21.0788 23.5308 21.0788C24.173 20.4083 24.5247 19.5115 24.5095 18.5832C24.4943 17.6549 24.1134 16.7701 23.4496 16.121L21.2093 14.0401Z' fill='currentColor' />
							</svg>
							<span>Par téléphone, tous les jours de la semaine de 9h à 12h au <span className='font-[600]'>+212 535 624 696</span></span>
						</a>
						<a href='mailto:contact@widamine.com' className='flex w-full items-center gap-4 border-b border-white/15 py-6 font-lexend text-[1.03rem] leading-[1.5em] text-white transition-all duration-300 hover:text-primary'>
							<svg xmlns='http://www.w3.org/2000/svg' width='25' height='24' viewBox='0 0 25 24' fill='none' className='h-6 w-6 shrink-0 text-primary'>
								<path d='M24.5 12.5V18.5C24.4984 19.9582 23.9184 21.3562 22.8873 22.3873C21.8562 23.4184 20.4582 23.9984 19 24H6C4.5418 23.9984 3.14377 23.4184 2.11267 22.3873C1.08156 21.3562 0.501588 19.9582 0.5 18.5L0.5 8.5C0.501588 7.0418 1.08156 5.64377 2.11267 4.61267C3.14377 3.58156 4.5418 3.00159 6 3H10C10.3978 3 10.7794 3.15804 11.0607 3.43934C11.342 3.72064 11.5 4.10218 11.5 4.5C11.5 4.89782 11.342 5.27936 11.0607 5.56066C10.7794 5.84196 10.3978 6 10 6H6C5.54646 6.0015 5.10191 6.12671 4.71425 6.36212C4.32659 6.59754 4.01049 6.93425 3.8 7.336L10.731 14.268C11.2075 14.7223 11.8406 14.9758 12.499 14.9758C13.1574 14.9758 13.7905 14.7223 14.267 14.268L15.491 12.968C15.6263 12.8247 15.7884 12.7095 15.9682 12.6289C16.148 12.5483 16.3419 12.5039 16.5389 12.4982C16.7358 12.4926 16.932 12.5257 17.1161 12.5959C17.3002 12.666 17.4687 12.7717 17.612 12.907C17.7553 13.0423 17.8705 13.2044 17.9511 13.3842C18.0317 13.564 18.0761 13.7579 18.0818 13.9549C18.0874 14.1518 18.0543 14.348 17.9841 14.5321C17.914 14.7162 17.8083 14.8847 17.673 15.028L16.418 16.356C15.9074 16.8708 15.3005 17.28 14.6317 17.5602C13.963 17.8404 13.2457 17.9862 12.5206 17.9891C11.7956 17.9921 11.0771 17.8522 10.4061 17.5775C9.73508 17.3028 9.12477 16.8986 8.61 16.388L3.5 11.278V18.5C3.5 19.163 3.76339 19.7989 4.23223 20.2678C4.70107 20.7366 5.33696 21 6 21H19C19.663 21 20.2989 20.7366 20.7678 20.2678C21.2366 19.7989 21.5 19.163 21.5 18.5V12.5' fill='currentColor' />
							</svg>
							<span>Par mail en envoyant votre demande et des photos de bonne qualité sur <span className='font-[600]'>contact@widamine.com</span></span>
						</a>
					</div>
					<div className='w-full max-w-[30rem]'>
						<div className='aspect-video w-full overflow-hidden rounded-[1.25rem] bg-secondary/40 shadow-xl'>
							<div className='flex h-full w-full items-center justify-center'>
								<div className='text-center text-white/50'>
									<svg className='mx-auto h-16 w-16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
									<p className='mt-3 font-lexend text-sm'>Vidéo de présentation</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
