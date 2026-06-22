import { useEffect, useState } from 'react'
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Check as CheckIcon,
  Microscope as MicroscopeIcon,
  X,
  User,
  EnvelopeSimple as Mail,
  Phone,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { DatePicker } from '@mantine/dates'
import clsx from 'clsx'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import classes from './Scheduling.module.css'

const panelVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}

const stepVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
}

function getPanelWidth(step: number) {
  return step === 3 ? 520 : step === 1 ? 480 : 720
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
      {submitSuccess ? (
        <SuccessStep key='success' onClose={handleClose} embedded={embedded} />
      ) : (
        <ReservationSteps key='steps' embedded={embedded} onClose={handleClose} />
      )}
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
    selectedMotif,
    setSelectedMotif,
    selectedPractitionerId,
    setSelectedPractitionerId,
    selectedDate,
    setSelectedDate,
    selectedHour,
    setSelectedHour,
    availability,
    isLoadingAvailability,
    availabilityError,
    loadAvailability,
    step,
    setStep,
    close,
    restart,
    userData,
    setUserData,
    isSubmitting,
    submitError,
    submit,
  } = useScheduleModalStore()

  const [viewingDoctorsFor, setViewingDoctorsFor] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})

  const validate = () => {
    const errs: { email?: string; phone?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) errs.email = 'Email invalide'
    if (!/^[\d\s\+\-\.]{6,20}$/.test(userData.phone)) errs.phone = 'Numéro invalide'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

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
    if (!validate()) return
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

  const inputBase = 'w-full rounded-full border border-white/20 bg-transparent py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/40 hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'

  return (
    <motion.div
      variants={panelVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className={`overflow-hidden rounded-[1.45rem] border border-white/18 bg-[linear-gradient(180deg,rgba(52,52,52,0.98),rgba(33,33,33,0.98))] p-4 text-white sm:rounded-[1.65rem] sm:p-6 ${
        embedded
          ? 'relative flex w-full max-w-full flex-col min-h-[24rem] sm:max-w-[720px] sm:min-h-[30rem]'
          : 'pointer-events-auto relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col sm:max-h-[min(90dvh,52rem)]'
      }`}
      style={embedded ? undefined : { width: `min(calc(100vw - 1.5rem), ${getPanelWidth(step)}px)` }}
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent' />
      <div className='mb-5 flex items-center justify-between sm:mb-6'>
        <h2 className='text-lg font-normal'>{getStepTitle(step)}</h2>
        {embedded ? null : (
          <button onClick={handleDismiss} className='text-white/50 hover:text-white'>
            <X size={20} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false} mode='wait'>
        <motion.div
          key={`panel-step-${step}`}
          variants={stepVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          className={`relative w-full flex-1 overflow-y-auto pr-1 ${embedded ? 'min-h-[18rem] sm:min-h-[24rem]' : 'min-h-[18rem]'}`}
        >
          {step === 1 ? (
            <div className='min-h-[190px] sm:min-h-[220px]'>
              {motifsError ? <InlineMessage tone='error'>{motifsError}</InlineMessage> : null}
              {isLoadingMotifs ? <InlineMessage>Chargement des motifs...</InlineMessage> : null}
              <div className='mb-5 grid grid-cols-1 gap-2.5 sm:mb-6 sm:grid-cols-2 sm:gap-3'>
                {motifs.map((motif) => (
                  <button
                    key={motif.id}
                    data-active={selectedMotif?.id === motif.id}
                    onClick={() => {
                      setSelectedMotif(motif)
                      setStep(2)
                    }}
                    className='group flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left hover:border-white/20 hover:bg-white/10 data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10 data-[active=true]:shadow-[0_0_20px_rgba(39,168,228,0.15)]'
                  >
                    <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10'>
                      <MicroscopeIcon size={14} className='text-white/60' />
                    </div>
                    <span className='min-w-0 text-[13px] font-medium text-white/80 sm:text-sm'>{motif.name}</span>
                    {selectedMotif?.id === motif.id ? <CheckIcon size={14} className='ml-1 text-primary' /> : null}
                  </button>
                ))}
              </div>

              {selectedMotif?.description ? <p className='text-sm leading-6 text-white/55'>{selectedMotif.description}</p> : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className='flex flex-col gap-4 sm:gap-6 lg:flex-row'>
              <div className='flex shrink-0 justify-center lg:block'>
                <DatePicker
                  value={formatDateInputValue(selectedDate)}
                  onChange={(value) => {
                    setSelectedDate(value ? parseDateInputValue(value) : null)
                    setViewingDoctorsFor(null)
                    setSelectedHour(null)
                    setSelectedPractitionerId(null)
                  }}
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

              <div className='flex-1 space-y-4 overflow-y-auto border-white/10 lg:max-h-[60vh] lg:border-l lg:pl-6'>
                {availabilityError ? <InlineMessage tone='error'>{availabilityError}</InlineMessage> : null}
                {isLoadingAvailability ? <InlineMessage>Chargement des disponibilités...</InlineMessage> : null}

                {viewingDoctorsFor ? (
                  <DoctorSelection
                    viewingDoctorsFor={viewingDoctorsFor}
                    availability={availability}
                    selectedPractitionerId={selectedPractitionerId}
                    selectedHour={selectedHour}
                    setSelectedHour={setSelectedHour}
                    setSelectedPractitionerId={setSelectedPractitionerId}
                    onContinue={() => {
                      setViewingDoctorsFor(null)
                      setStep(3)
                    }}
                    onBack={() => {
                      setViewingDoctorsFor(null)
                      setSelectedHour(null)
                      setSelectedPractitionerId(null)
                    }}
                  />
                ) : (
                  <>
                    <TimeSection
                      title='Matinée'
                      slots={availability.morning}
                      onSelectTime={(timeLabel) => setViewingDoctorsFor(timeLabel)}
                    />
                    <TimeSection
                      title='Après-Midi'
                      slots={availability.afternoon}
                      onSelectTime={(timeLabel) => setViewingDoctorsFor(timeLabel)}
                    />
                    <TimeSection
                      title='Soirée'
                      slots={availability.evening}
                      onSelectTime={(timeLabel) => setViewingDoctorsFor(timeLabel)}
                    />
                  </>
                )}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className='min-h-[280px] sm:min-h-[320px]'>
              {submitError ? (
                <div className='mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>
                  {submitError}
                </div>
              ) : null}

              <div className='mb-4 grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2'>
                <div className='relative'>
                  <User size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
                  <input
                    required
                    type='text'
                    placeholder='Prénom'
                    value={userData.prenom}
                    onChange={(e) => setUserData({ ...userData, prenom: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div className='relative'>
                  <User size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
                  <input
                    required
                    type='text'
                    placeholder='Nom'
                    value={userData.nom}
                    onChange={(e) => setUserData({ ...userData, nom: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div className='relative sm:col-span-2'>
                  <Mail size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
                  <input
                    required
                    type='email'
                    placeholder='Adresse Email'
                    value={userData.email}
                    onChange={(e) => { setUserData({ ...userData, email: e.target.value }); setErrors({ ...errors, email: undefined }) }}
                    className={inputBase}
                  />
                  {errors.email && <p className='mt-1 px-3 text-[11px] text-red-400'>{errors.email}</p>}
                </div>
                <div className='relative sm:col-span-2'>
                  <Phone size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40' />
                  <input
                    required
                    type='tel'
                    placeholder='Numéro De Téléphone'
                    value={userData.phone}
                    onChange={(e) => { setUserData({ ...userData, phone: e.target.value }); setErrors({ ...errors, phone: undefined }) }}
                    className={inputBase}
                  />
                  {errors.phone && <p className='mt-1 px-3 text-[11px] text-red-400'>{errors.phone}</p>}
                </div>
              </div>

              <div className='mb-6'>
                <textarea
                  placeholder='Note'
                  rows={4}
                  value={userData.note}
                  onChange={(e) => setUserData({ ...userData, note: e.target.value })}
                  className='w-full resize-none rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 hover:border-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none'
                />
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className='mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between'>
        {step === 1 ? (
          <button
            onClick={handleDismiss}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-white/20 hover:bg-white/10 sm:w-auto'
          >
            <X size={16} />
            Annuler
          </button>
        ) : (
          <button
            onClick={() => setStep(step - 1)}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-white/20 hover:bg-white/10 sm:w-auto'
          >
            <ArrowLeftIcon size={16} />
            Retour
          </button>
        )}
        {step === 3 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !userData.prenom || !userData.nom || !userData.email || !userData.phone}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
          >
            {isSubmitting ? (
              <>
                <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Envoi...
              </>
            ) : (
              'Confirmer Votre 1ère Séance'
            )}
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? !selectedMotif : !selectedDate || !selectedHour}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-primary/80 px-5 py-2 text-sm hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
          >
            {step === 1 ? 'Date Et Heure' : 'Informations De Contact'}
            <ArrowRightIcon size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function InlineMessage({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'error' }) {
  return (
    <div
      className={`mb-4 rounded-lg border p-3 text-sm ${tone === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-white/10 bg-white/5 text-white/60'}`}
    >
      {children}
    </div>
  )
}

function TimeSection({
  title,
  slots,
  onSelectTime,
}: {
  title: string
  slots: { label: string; startsAt: string }[]
  onSelectTime: (timeLabel: string) => void
}) {
  const uniqueTimes = Array.from(new Map(slots.map((s) => [s.label, s])).values())
  if (!uniqueTimes.length) return null

  return (
    <div>
      <div className='mb-3 flex items-center gap-2'>
        <span className='text-sm font-medium text-white'>{title}</span>
        <div className='h-px flex-1 bg-white/20' />
      </div>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
        {uniqueTimes.map((slot) => (
          <button
            key={slot.label}
            type='button'
            onClick={() => onSelectTime(slot.label)}
            className='flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70 hover:border-primary/40 hover:bg-primary/10 hover:text-white'
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DoctorSelection({
  viewingDoctorsFor,
  availability,
  selectedPractitionerId,
  selectedHour,
  setSelectedHour,
  setSelectedPractitionerId,
  onContinue,
  onBack,
}: {
  viewingDoctorsFor: string
  availability: { morning: any[]; afternoon: any[]; evening: any[] }
  selectedPractitionerId: number | null
  selectedHour: string | null
  setSelectedHour: (hour: string, doctorId?: number) => void
  setSelectedPractitionerId: (id: number | null) => void
  onContinue: () => void
  onBack: () => void
}) {
  const allSlots = [...availability.morning, ...availability.afternoon, ...availability.evening]
  const doctorsForTime = allSlots.filter((s) => s.label === viewingDoctorsFor)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={onBack}
          className='flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 hover:border-white/20 hover:bg-white/10'
        >
          <ArrowLeftIcon size={16} />
          Retour
        </button>
        <div className='h-px flex-1 bg-white/20' />
        <span className='text-sm font-medium text-white/80'>{viewingDoctorsFor}</span>
      </div>

      <div className='grid grid-cols-1 gap-2'>
        {doctorsForTime.map((slot: any) => {
          const isSelected = selectedHour === slot.startsAt && (selectedPractitionerId ?? null) === (slot.doctorId ?? null)
          const rawName = (slot.doctorName ?? '').trim()
          const nameWithoutPrefix = rawName.replace(/^dr\.?\s+/i, '').trim()
          const fullName = nameWithoutPrefix ? `Dr. ${nameWithoutPrefix}` : 'Dr.'
          const img = slot.doctorImage

          return (
            <button
              key={`${slot.startsAt}-${slot.doctorId ?? 'none'}`}
              type='button'
              onClick={() => {
                setSelectedPractitionerId(slot.doctorId ?? null)
                setSelectedHour(slot.startsAt, slot.doctorId)
                onContinue()
              }}
              className={clsx(
                'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left',
                isSelected
                  ? 'border-primary/60 bg-primary/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className='h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5'>
                {img ? <img src={img} alt={fullName} className='h-full w-full object-cover' /> : null}
              </div>
              <div className='min-w-0 flex-1'>
                <div
                  className={clsx(
                    'text-sm font-semibold leading-snug whitespace-normal break-words',
                    isSelected ? 'text-white' : 'text-white/85'
                  )}
                >
                  {fullName}
                </div>
                <div className={clsx('mt-0.5 text-[11px]', isSelected ? 'text-primary/90' : 'text-white/45')}>Disponible à {viewingDoctorsFor}</div>
              </div>
              <div className={clsx('text-xs font-semibold', isSelected ? 'text-primary' : 'text-white/35')}>{isSelected ? 'Choisi' : 'Choisir'}</div>
            </button>
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
className={`border border-white/20 bg-[#2a2a2a]/98 rounded-2xl p-6 text-center text-white sm:p-8 ${embedded ? 'relative w-full max-w-[520px]' : 'pointer-events-auto w-full max-w-[min(calc(100vw-1.5rem),400px)]'}`}
>
<div className='relative mb-6'>
<div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/20'>
<CheckIcon size={40} className='text-primary' />
</div>
</div>

<h3 className='mb-2 text-xl'>
Réservation Confirmée!
</h3>
<p className='mb-6 text-sm leading-relaxed text-white/60'>
Votre rendez-vous a été enregistré avec succès. Notre équipe vous contactera prochainement pour confirmer.
</p>

<button
onClick={onClose}
className='w-full rounded-full bg-primary py-3 text-sm font-medium hover:bg-primary/90'
>
Parfait
</button>
</motion.div>
)
}
