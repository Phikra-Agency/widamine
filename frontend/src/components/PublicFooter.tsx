import { Link } from 'react-router-dom'

export default function PublicFooter() {
	return (
		<footer className='bg-secondary pb-8 pt-10 text-custom-white sm:pb-10 sm:pt-16'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6'>
				<div className='grid gap-6 rounded-[1.6rem] border border-white/10 bg-white/6 p-4 shadow-[0_22px_55px_rgba(0,0,0,0.16)] sm:gap-8 sm:rounded-[2rem] sm:p-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]'>
					<div>
						<div className='flex items-center gap-3 sm:gap-4'>
							<div className='flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/95 shadow-sm sm:h-16 sm:w-16'>
								<img src='/logo.png' alt='Widamine' className='h-10 w-10 object-contain' />
							</div>
							<div>
								<p className='font-amoria text-xl tracking-[0.14em] text-white sm:text-2xl sm:tracking-[0.18em]'>WIDAMINE</p>
								<p className='mt-1 text-[10px] uppercase tracking-[0.34em] text-white/55'>Sobriété Esthétique</p>
							</div>
						</div>
						<p className='mt-5 max-w-sm text-sm leading-7 text-white/68'>
							Notre centre associe dermatologie, esthétique médicale et accompagnement personnalisé pour offrir des résultats remarquables, durables et naturels.
						</p>
					</div>

					<div>
						<p className='text-xs uppercase tracking-[0.3em] text-white/48'>Prestations</p>
						<div className='mt-5 space-y-3 text-sm text-white/72'>
							<p>Esthétique du visage</p>
							<p>Esthétique du corps</p>
							<p>Traitements sur mesure</p>
							<p>Consultation personnalisée</p>
						</div>
					</div>

					<div>
						<p className='text-xs uppercase tracking-[0.3em] text-white/48'>Contact</p>
						<div className='mt-5 space-y-3 text-sm leading-7 text-white/72'>
							<p>Boulevard Slaoui, Bureaux Nour (en face cinéma Astor), 2ème étage, Fès</p>
							<p>+212 (535) 624 696</p>
							<p>info@widamineaestheticcenter.com</p>
						</div>
					</div>

					<div>
						<p className='text-xs uppercase tracking-[0.3em] text-white/48'>Newsletter</p>
						<p className='mt-5 text-sm leading-7 text-white/68'>
							Soyez les premiers à découvrir nos actualités, services et produits.
						</p>
						<div className='mt-5 flex flex-col gap-2.5 rounded-[1.25rem] border border-white/12 bg-white/6 p-3 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:p-2'>
							<input
								type='email'
								placeholder='Votre email'
								className='min-w-0 flex-1 bg-transparent px-3 py-1 text-sm text-white placeholder:text-white/38 focus:outline-none'
							/>
							<button className='rounded-full bg-primary px-4 py-2 text-sm font-medium text-custom-white transition hover:bg-primary/90'>
								S’inscrire
							</button>
						</div>
					</div>
				</div>

				<div className='mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/46 md:flex-row md:items-center md:justify-between'>
					<p>© 2026 Widamin Aesthetic Center. Tous les droits sont réservés.</p>
					<div className='flex flex-wrap items-center gap-4'>
						<Link to='/' className='transition hover:text-white/75'>Accueil</Link>
						<Link to='/appointment' className='transition hover:text-white/75'>Rendez-vous</Link>
						<Link to='/contact' className='transition hover:text-white/75'>Contact</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
