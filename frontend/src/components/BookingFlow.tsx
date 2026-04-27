import { useEffect } from 'react'
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Check as CheckIcon, Microscope as MicroscopeIcon, X, User, EnvelopeSimple as Mail, Phone } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { DatePicker } from '@mantine/dates'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import classes from './Scheduling.module.css'

const panelVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
	exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}

const stepVariants = {
	initial: { opacity: 0, x: 8 },
	animate: { opacity: 1, x: 0, transition: { duration: 0.18, ease: 'easeOut' as const } },
	exit: { opacity: 0, x: -6, transition: { duration: 0.12 } },
}

function getPanelWidth(step: number) {
	return step === 3 ? 520 : step === 1 ? 480 : 720
}

function getStepHeight(step: number) {
	return step === 2 ? 340 : step === 3 ? 300 : 210
}

function getStepTitle(step: number) {
	return step === 1 ? 'Motif Principal' : step === 2 ? 'Date Et Heure' : 'Informations De Contact'
}

function formatDateInputValue(date: Date | null) {
	if (!date) return null
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function parseDateInputValue(value: string) {
	const [year, month, day] = value.split('-').map(Number)
	return new Date(year, month - 1, day)
}

export default function BookingFlow({
	embedded = false,
	onClose,
}: {
	embedded?: boolean
	onClose?: () => void
}) {
	const { submitSuccess, restart, close } = useScheduleModalStore()

	const handleClose = () => {
		restart()
		if (!embedded) close()
		onClose?.()
	}

	return (
		<AnimatePresence mode='wait'>
			{submitSuccess ? <SuccessStep key='success' onClose={handleClose} embedded={embedded} /> : <ReservationSteps key='steps' embedded={embedded} onClose={handleClose} />}
		</AnimatePresence>
	)
}

function ReservationSteps({
	embedded,
	onClose,
}: {
	embedded: boolean
	onClose: () => void
}) {
	const {
		motifs,
		isLoadingMotifs,
		motifsError,
		selectedMotif, setSelectedMotif,
		selectedPractitionerId, setSelectedPractitionerId,
		selectedDate, setSelectedDate,
		selectedHour, setSelectedHour,
		availability,
		isLoadingAvailability,
		availabilityError,
		loadAvailability,
		step, setStep, close, restart,
		userData, setUserData,
		isSubmitting, submitError, submit,
	} = useScheduleModalStore()

	useEffect(() => {
		if (step <= 0) {
			restart()
		}
	}, [step, restart])

	useEffect(() => {
		if (step < 2 || !selectedMotif) return
		const dateToCheck = selectedDate || new Date()
		setSelectedDate(dateToCheck)
		void loadAvailability()
	}, [loadAvailability, selectedDate, selectedMotif, selectedPractitionerId, step])

	const handleSubmit = async () => {
		await submit()
	}

	const handleDismiss = () => {
		if (embedded) {
			restart()
		} else {
			onClose()
			close()
		}
	}

	return (
		<motion.div
			variants={panelVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			className={`overflow-hidden rounded-[1.45rem] border border-white/18 bg-[linear-gradient(180deg,rgba(52,52,52,0.98),rgba(33,33,33,0.98))] p-4 text-white shadow-[0_28px_70px_rgba(0,0,0,0.38)] sm:rounded-[1.65rem] sm:p-6 ${embedded ? 'relative w-full max-w-full min-h-[26rem] sm:max-w-[720px] sm:min-h-[33rem]' : 'absolute m-auto pointer-events-auto'}`}
			style={embedded ? undefined : { width: getPanelWidth(step) }}
		>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent' />
			<div className='pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-primary/12 blur-3xl' />
			<div className='mb-5 flex items-center justify-between sm:mb-6'>
				<h2 className='text-lg font-normal'>{getStepTitle(step)}</h2>
				{embedded ? null : (
					<button onClick={handleDismiss} className='text-white/50 transition-all duration-300 ease-out hover:text-white'>
						<X size={20} />
					</button>
				)}
			</div>

			<AnimatePresence initial={false} mode='wait'>
				<motion.div
					key={`panel-step-${step}`}
					initial={{ opacity: 0, y: 10, scale: 0.99 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -6, scale: 0.995 }}
					transition={{
						duration: 0.15,
						ease: 'easeOut',
					}}
					className={`relative w-full ${embedded ? 'min-h-[18rem] sm:min-h-[24rem]' : ''}`}
					style={embedded ? undefined : { minHeight: getStepHeight(step) }}
				>
					{step === 1 ? (
						<motion.div key='step-1' variants={stepVariants} initial='initial' animate='animate' exit='exit' className='min-h-[190px] sm:min-h-[220px]'>
							{motifsError ? <InlineMessage tone='error'>{motifsError}</InlineMessage> : null}
							{isLoadingMotifs ? <InlineMessage>Chargement des motifs...</InlineMessage> : null}
							<div className='mb-5 flex flex-wrap gap-2.5 sm:mb-6 sm:gap-3'>
								{motifs.map((motif, index) => (
									<motion.div
										key={motif.id}
										data-active={selectedMotif?.id === motif.id}
										onClick={() => {
											setSelectedMotif(motif)
											setStep(2)
										}}
										className='flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-left transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/10 data-[active=true]:border-primary/50 data-[active=true]:bg-white/10 data-[active=true]:shadow-[0_10px_26px_rgba(39,168,228,0.12)] sm:px-4'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: Math.min(index * 0.02, 0.15), duration: 0.15 }}
										whileTap={{ scale: 0.98 }}
									>
										<MicroscopeIcon size={14} className='text-white/60' />
										<span className='text-[13px] text-white/80 sm:text-sm'>{motif.name}</span>
										{selectedMotif?.id === motif.id ? <CheckIcon size={14} className='ml-1 text-primary' /> : null}
									</motion.div>
								))}
							</div>

							{selectedMotif?.description ? <p className='text-sm leading-6 text-white/55'>{selectedMotif.description}</p> : null}
						</motion.div>
					) : null}

					{step === 2 ? (
						<motion.div key='step-2' variants={stepVariants} initial='initial' animate='animate' exit='exit' className='flex flex-col gap-4 sm:gap-6 lg:flex-row'>
							<div className='flex shrink-0 justify-center lg:block'>
								<DatePicker
									value={formatDateInputValue(selectedDate)}
									onChange={(value) => setSelectedDate(value ? parseDateInputValue(value) : null)}
									minDate={new Date()}
									weekendDays={[0]}
									excludeDate={(date) => new Date(date).getDay() === 0}
									classNames={{
										day: classes.datePickerDay,
										calendarHeaderLevel: classes.datePickerHeaderLevel,
										calendarHeaderControl: classes.datePickerHeaderControl,
										calendarHeaderControlIcon: classes.datePickerHeaderControlIcon,
										monthsListControl: classes.datePickerMonthControl,
										yearsListControl: classes.datePickerYearControl,
									}}
								/>
							</div>

							<div className='flex-1 space-y-4 border-white/10 lg:border-l lg:pl-6'>
								{selectedMotif?.practitioners.length ? (
									<div className='space-y-2'>
										<div className='mb-2 flex items-center gap-2'>
											<span className='text-sm font-medium text-white'>Praticien</span>
											<div className='h-px flex-1 bg-white/20' />
										</div>
										<div className='flex flex-wrap gap-2'>
											{selectedMotif.requiresPractitionerChoice ? null : (
												<button
													type='button'
													onClick={() => setSelectedPractitionerId(null)}
													data-active={selectedPractitionerId === null}
													className='rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition-all duration-250 hover:border-white/20 hover:bg-white/10 data-[active=true]:border-primary/50 data-[active=true]:bg-white/10'
												>
													Sans préférence
												</button>
											)}
											{selectedMotif.practitioners.map((practitioner: any) => (
												<button
													key={practitioner.id}
													type='button'
													onClick={() => setSelectedPractitionerId(practitioner.id)}
													data-active={selectedPractitionerId === practitioner.id}
													className='rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition-all duration-250 hover:border-white/20 hover:bg-white/10 data-[active=true]:border-primary/50 data-[active=true]:bg-white/10'
												>
													{practitioner.name}
												</button>
											))}
										</div>
									</div>
								) : null}

								{availabilityError ? <InlineMessage tone='error'>{availabilityError}</InlineMessage> : null}
								{isLoadingAvailability ? <InlineMessage>Chargement des disponibilités...</InlineMessage> : null}

								<SlotSection title='Matinée' slots={availability.morning} selectedHour={selectedHour} setSelectedHour={setSelectedHour} />
								<SlotSection title='Après-Midi' slots={availability.afternoon} selectedHour={selectedHour} setSelectedHour={setSelectedHour} />
								<SlotSection title='Soirée' slots={availability.evening} selectedHour={selectedHour} setSelectedHour={setSelectedHour} />
							</div>
						</motion.div>
					) : null}

					{step === 3 ? (
						<motion.div key='step-3' variants={stepVariants} initial='initial' animate='animate' exit='exit' className='min-h-[280px] sm:min-h-[320px]'>
							{submitError ? (
								<div className='mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>
									{submitError}
								</div>
							) : null}

							<div className='mb-4 grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2'>
								<div className='relative'>
									<User size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
									<input
										type='text'
										placeholder='Prénom'
										value={userData.prenom}
										onChange={(e) => setUserData({ ...userData, prenom: e.target.value })}
										className='w-full rounded-full border border-white/20 bg-transparent py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 transition-all duration-500 ease-in-out hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
									/>
								</div>
								<div className='relative'>
									<User size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
									<input
										type='text'
										placeholder='Nom'
										value={userData.nom}
										onChange={(e) => setUserData({ ...userData, nom: e.target.value })}
										className='w-full rounded-full border border-white/20 bg-transparent py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 transition-all duration-500 ease-in-out hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
									/>
								</div>
								<div className='relative sm:col-span-2'>
									<Mail size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
									<input
										type='email'
										placeholder='Adresse Email'
										value={userData.email}
										onChange={(e) => setUserData({ ...userData, email: e.target.value })}
										className='w-full rounded-full border border-white/20 bg-transparent py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 transition-all duration-500 ease-in-out hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
									/>
								</div>
								<div className='relative sm:col-span-2'>
									<Phone size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
									<input
										type='tel'
										placeholder='Numéro De Téléphone'
										value={userData.phone}
										onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
										className='w-full rounded-full border border-white/20 bg-transparent py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 transition-all duration-500 ease-in-out hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
									/>
								</div>
							</div>

							<div className='mb-6'>
								<textarea
									placeholder='Note'
									rows={4}
									value={userData.note}
									onChange={(e) => setUserData({ ...userData, note: e.target.value })}
									className='w-full resize-none rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 transition-all duration-500 ease-in-out hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
								/>
							</div>
						</motion.div>
					) : null}
				</motion.div>
			</AnimatePresence>

			<div className='mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between'>
				{step === 1 ? (
					<button
						onClick={handleDismiss}
						className='flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/10'
					>
						<X size={16} />
						Annuler
					</button>
				) : (
					<button
						onClick={() => setStep(step - 1)}
						className='flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/10'
					>
						<ArrowLeftIcon size={16} />
						Retour
					</button>
				)}
				{step === 3 ? (
					<motion.button
						whileTap={{ scale: 0.985 }}
						onClick={handleSubmit}
						disabled={isSubmitting || !userData.prenom || !userData.nom || !userData.email || !userData.phone}
						className='flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-40'
					>
						{isSubmitting ? (
							<>
								<svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
									<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
									<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
								</svg>
								Envoi...
							</>
						) : (
							'Confirmer Votre 1ère Séance'
						)}
					</motion.button>
				) : (
					<motion.button
						whileTap={{ scale: 0.985 }}
						onClick={() => setStep(step + 1)}
						disabled={step === 1 ? !selectedMotif : !selectedDate || !selectedHour}
						className='flex items-center gap-2 rounded-full bg-primary/80 px-5 py-2 text-sm transition-all duration-300 ease-out hover:bg-primary hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-40'
					>
						{step === 1 ? 'Date Et Heure' : 'Informations De Contact'}
						<ArrowRightIcon size={16} />
					</motion.button>
				)}
			</div>
		</motion.div>
	)
}

function InlineMessage({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'error' }) {
	return (
		<div className={`mb-4 rounded-lg border p-3 text-sm ${tone === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-white/10 bg-white/5 text-white/60'}`}>
			{children}
		</div>
	)
}

function SlotSection({
	title,
	slots,
	selectedHour,
	setSelectedHour,
}: {
	title: string
	slots: { label: string; startsAt: string; available: boolean; capacity: number; doctorId?: number; doctorName?: string }[]
	selectedHour: string | null
	setSelectedHour: (hour: string, doctorId?: number) => void
}) {
	return (
		<div>
			<div className='mb-3 flex items-center gap-2'>
				<span className='text-sm font-medium text-white'>{title}</span>
				<div className='h-px flex-1 bg-white/20' />
			</div>
			<div className='flex flex-wrap gap-2'>
				{slots.map((slot, index) => {
					const isSelected = selectedHour === slot.startsAt
					return (
						<motion.button
							key={slot.startsAt}
							type='button'
							onClick={() => setSelectedHour(slot.startsAt, slot.doctorId)}
							data-active={isSelected}
							disabled={!slot.available}
							className='flex flex-col items-start gap-0.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs transition-colors duration-150 hover:border-white/20 hover:bg-white/10 data-[active=true]:border-primary/50 data-[active=true]:bg-white/10 data-[active=true]:shadow-[0_8px_20px_rgba(39,168,228,0.12)] disabled:cursor-not-allowed disabled:opacity-30'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: Math.min(index * 0.015, 0.1), duration: 0.12 }}
							whileTap={{ scale: 0.98 }}
						>
							<span className='text-white/70'>{slot.label}</span>
							{slot.doctorName && <span className='text-[10px] text-primary/80'>{slot.doctorName}</span>}
							{isSelected ? <CheckIcon size={12} className='text-primary mt-0.5' /> : null}
						</motion.button>
					)
				})}
			</div>
		</div>
	)
}

function SuccessStep({ onClose, embedded }: { onClose: () => void; embedded: boolean }) {
	return (
		<motion.div
			variants={panelVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			className={`border border-white/20 bg-[#2a2a2a]/98 rounded-2xl p-8 text-center text-white shadow-2xl ${embedded ? 'relative w-full max-w-[520px]' : 'absolute m-auto w-[400px] pointer-events-auto'}`}
		>
			<div className='relative mb-6'>
				<div className='absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl' />
				<motion.div
					initial={{ scale: 0.85, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.08, type: 'spring', stiffness: 180, damping: 16 }}
					className='relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/20'
				>
					<CheckIcon size={40} className='text-primary' />
				</motion.div>
			</div>

			<motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className='mb-2 text-xl'>
				Réservation Confirmée!
			</motion.h3>
			<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className='mb-6 text-sm leading-relaxed text-white/60'>
				Votre rendez-vous a été enregistré avec succès. Notre équipe vous contactera prochainement pour confirmer.
			</motion.p>

			<motion.button
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.28 }}
				whileTap={{ scale: 0.985 }}
				onClick={onClose}
				className='w-full rounded-full bg-primary py-3 text-sm font-medium transition-all duration-500 ease-in-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
			>
				Parfait
			</motion.button>
		</motion.div>
	)
}
