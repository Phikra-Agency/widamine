import { useEffect } from 'react'
import Header from '@/components/Header'
import BookingFlow from '@/components/BookingFlow'
import { ShieldCheck, Clock as Clock3, Sparkle as Sparkles } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

export default function Appointment() {
	const { restart, motifs, loadMotifs } = useScheduleModalStore()

	useEffect(() => {
		restart()
		void loadMotifs()
	}, [loadMotifs, restart])

	return (
		<div className='bg-custom-white'>
			<Header page='Rendez-vous' />
			<section className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-18'>
				<div className='grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start'>
					<div className='order-2 space-y-5 xl:order-1 xl:sticky xl:top-32'>
						<div className='relative overflow-hidden rounded-[1.75rem] border border-secondary/10 bg-[#fffaf7] p-5 shadow-[0_24px_55px_rgba(26,54,70,0.06)] sm:rounded-[2.25rem] sm:p-8'>
							<div className='pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(46,144,192,0.12),transparent_70%)]' />
							<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Rendez-vous</p>
							<h1 className='mt-4 max-w-lg font-amoria text-[2rem] leading-tight text-secondary sm:text-4xl md:text-5xl'>
								Réservez votre consultation ou votre protocole sur mesure.
							</h1>
							<p className='mt-4 max-w-xl text-sm leading-7 text-secondary/68 sm:mt-5 sm:text-base sm:leading-8'>
								Choisissez simplement votre motif principal, votre date et vos coordonnées. Le formulaire ci-contre reprend exactement l’expérience de réservation utilisée dans le popup du site.
							</p>
							<div className='mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3'>
								<TrustPill icon={ShieldCheck} text='Même parcours que le popup' />
								<TrustPill icon={Clock3} text='Réservation rapide' />
								<TrustPill icon={Sparkles} text='Expérience cohérente' />
							</div>
						</div>

						<div className='rounded-[1.55rem] border border-secondary/10 bg-secondary p-5 text-white shadow-[0_22px_45px_rgba(26,54,70,0.12)] sm:rounded-[1.9rem] sm:p-6'>
							<p className='text-xs uppercase tracking-[0.26em] text-white/46'>Motifs disponibles</p>
							<div className='mt-4 space-y-3.5 text-sm leading-7 text-white/72 sm:mt-5 sm:space-y-4'>
								{motifs.map((motif) => (
									<p key={motif.id}>{motif.name}.</p>
								))}
							</div>
						</div>
					</div>

					<div className='order-1 flex justify-center xl:order-2 xl:justify-end'>
						<BookingFlow embedded />
					</div>
				</div>
			</section>
		</div>
	)
}

function TrustPill({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
	return (
		<div className='inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white/80 px-3.5 py-2 text-[13px] text-secondary/70 shadow-[0_12px_24px_rgba(26,54,70,0.04)] sm:px-4 sm:text-sm'>
			<Icon className='h-4 w-4 text-primary' />
			{text}
		</div>
	)
}
