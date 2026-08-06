import { useEffect, useState } from 'react'
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Check as CheckIcon,
  X,
  User,
  EnvelopeSimple as Mail,
  Phone,
  FirstAid,
  Sparkle,
  Heart,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import { DatePicker } from '@mantine/dates'
import clsx from 'clsx'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE } from '@/lib/theme'
import { ServiceIcon } from '@/components/ServiceIcon'
import api from '@/lib/api'
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
  return step === 3 ? 640 : step === 1 ? 640 : 800
}

function getStepTitle(step: number) {
  return step === 1 ? 'Traitement' : step === 2 ? 'Date Et Heure' : 'Informations De Contact'
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

  const [bookingType, setBookingType] = useState<'traitement' | 'consultation' | null>(null)
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

  const inputBase = `w-full rounded-full border py-2.5 pr-4 pl-10 text-sm focus:outline-none ${C.secondary} placeholder:text-gray-400 border-gray-200 bg-white hover:border-gray-300 focus:border-[${C.primary}] focus:ring-1 focus:ring-[${C.primary}]/20`

  const cardBase = 'overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 sm:p-6'

  if (bookingType === null) {
    return (
      <BookingTypeChoice
        onSelect={(type) => {
          setBookingType(type)
          if (type === 'traitement') {
            restart()
            setStep(1)
          }
        }}
        onClose={handleDismiss}
      />
    )
  }

  if (bookingType === 'consultation') {
    return (
      <ConsultationForm
        onBack={() => setBookingType(null)}
        onClose={handleDismiss}
        embedded={embedded}
      />
    )
  }

  return (
    <motion.div
      variants={panelVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className={`shadow-xl ${
        embedded
          ? 'relative flex w-full max-w-full flex-col min-h-[24rem] sm:max-w-[720px] sm:min-h-[30rem]'
          : 'pointer-events-auto relative flex w-full flex-col max-h-[calc(100dvh-2rem)]'
      } ${cardBase}`}
      style={embedded ? undefined : { width: `min(calc(100vw - 1.5rem), ${getPanelWidth(step)}px)` }}
    >
      <div className='mb-5 flex items-center justify-between sm:mb-6'>
        <h2 className='text-lg' style={{ fontFamily: TYPE.headingFamily, color: C.secondary, fontWeight: 500 }}>
          {getStepTitle(step)}
        </h2>
        {embedded ? null : (
          <button onClick={handleDismiss} style={{ color: C.secondary }}>
            <X size={20} weight='regular' opacity={0.4} />
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
          className='relative w-full flex-1 overflow-y-auto pr-1'
        >
          {step === 1 ? (
            <div>
              {motifsError ? <InlineMessage tone='error'>{motifsError}</InlineMessage> : null}
              {isLoadingMotifs ? <InlineMessage>Chargement des motifs...</InlineMessage> : null}
              <div className='mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2'>
                {motifs.map((motif) => (
                  <button
                    key={motif.id}
                    data-active={selectedMotif?.id === motif.id}
                    onClick={() => {
                      setSelectedMotif(motif)
                      setStep(2)
                    }}
                    className='group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md'
                    style={{
                      borderColor: selectedMotif?.id === motif.id ? C.primary : '#e5e7eb',
                      backgroundColor: selectedMotif?.id === motif.id ? '#f0f9ff' : '#ffffff',
                      boxShadow: selectedMotif?.id === motif.id ? `0 0 0 1px ${C.primary}` : '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg' style={{ backgroundColor: `${C.primary}10` }}>
                      <ServiceIcon slug={motif.icon} size={22} color={C.primary} />
                    </div>
                    <span className='min-w-0 text-sm font-medium' style={{ color: C.secondary }}>{motif.name}</span>
                    {selectedMotif?.id === motif.id ? <CheckIcon size={14} weight='regular' className='ml-auto shrink-0' style={{ color: C.primary }} /> : null}
                  </button>
                ))}
              </div>

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

              <div className='flex-1 space-y-4 overflow-y-auto lg:border-l lg:pl-6' style={{ borderColor: '#e5e7eb' }}>
                {availabilityError ? <InlineMessage tone='error'>{availabilityError}</InlineMessage> : null}
                {isLoadingAvailability ? <InlineMessage>Chargement des disponibilités...</InlineMessage> : null}

                {viewingDoctorsFor ? (
                  <DoctorSelection
                    viewingDoctorsFor={viewingDoctorsFor}
                    availability={availability}
                    selectedPractitionerId={selectedPractitionerId}
                    selectedHour={selectedHour}
                    selectedMotif={selectedMotif}
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
            <div>
              {submitError ? (
                <div className='mb-4 rounded-lg border p-3 text-sm' style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  {submitError}
                </div>
              ) : null}

              <div className='mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4'>
                <div className='relative'>
                  <User size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
                  <input
                    required
                    type='text'
                    placeholder='Prénom'
                    value={userData.prenom}
                    onChange={(e) => setUserData({ ...userData, prenom: e.target.value })}
                    className={inputBase}
                    style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  />
                </div>
                <div className='relative'>
                  <User size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
                  <input
                    required
                    type='text'
                    placeholder='Nom'
                    value={userData.nom}
                    onChange={(e) => setUserData({ ...userData, nom: e.target.value })}
                    className={inputBase}
                    style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  />
                </div>
                <div className='sm:col-span-2'>
                  <div className='relative'>
                    <Mail size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
                    <input
                      required
                      type='email'
                      placeholder='Adresse Email'
                      value={userData.email}
                      onChange={(e) => { setUserData({ ...userData, email: e.target.value }); setErrors({ ...errors, email: undefined }) }}
                      className={inputBase}
                      style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  {errors.email && <p className='mt-1 px-3 text-[11px]' style={{ color: '#dc2626' }}>{errors.email}</p>}
                </div>
                <div className='sm:col-span-2'>
                  <div className='relative'>
                    <Phone size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
                    <input
                      required
                      type='tel'
                      placeholder='Numéro De Téléphone'
                      value={userData.phone}
                      onChange={(e) => { setUserData({ ...userData, phone: e.target.value }); setErrors({ ...errors, phone: undefined }) }}
                      className={inputBase}
                      style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  {errors.phone && <p className='mt-1 px-3 text-[11px]' style={{ color: '#dc2626' }}>{errors.phone}</p>}
                </div>
              </div>

              <div className='mb-6'>
                <textarea
                  placeholder='Note'
                  rows={4}
                  value={userData.note}
                  onChange={(e) => setUserData({ ...userData, note: e.target.value })}
                  className='w-full resize-none rounded-xl border px-4 py-3 text-sm'
                  style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className='mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between' style={{ borderColor: '#e5e7eb' }}>
        {step === 1 ? (
          <button
            onClick={() => setBookingType(null)}
            className='flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm sm:w-auto'
            style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
          >
            Retour
          </button>
        ) : (
          <button
            onClick={() => setStep(step - 1)}
            className='flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm sm:w-auto'
            style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
          >
            Retour
          </button>
        )}
        {step === 3 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !userData.prenom || !userData.nom || !userData.email || !userData.phone}
            className='flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
            style={{ backgroundColor: C.primary }}
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
            className='flex w-full items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
            style={{ backgroundColor: C.primary }}
          >
            {step === 1 ? 'Date Et Heure' : 'Informations De Contact'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function InlineMessage({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'error' }) {
  return (
    <div
      className='mb-4 rounded-lg border p-3 text-sm'
      style={tone === 'error'
        ? { borderColor: '#fca5a5', backgroundColor: '#fef2f2', color: '#dc2626' }
        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', color: `${C.secondary}99` }
      }
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
  slots: { label: string; startsAt: string; available?: boolean }[]
  onSelectTime: (timeLabel: string) => void
}) {
  const uniqueTimes = Array.from(new Map(slots.map((s) => [s.label, s])).values())
  if (!uniqueTimes.length) return null

  return (
    <div>
      <div className='mb-3 flex items-center gap-2'>
        <span className='text-sm font-medium' style={{ color: C.secondary }}>{title}</span>
        <div className='h-px flex-1' style={{ backgroundColor: '#e5e7eb' }} />
      </div>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
        {uniqueTimes.map((slot) => {
          const isAvailable = slot.available !== false
          return (
            <button
              key={slot.label}
              type='button'
              onClick={() => isAvailable && onSelectTime(slot.label)}
              disabled={!isAvailable}
              className='flex items-center justify-center rounded-full border px-4 py-2 text-[13px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none'
              style={{ 
                borderColor: isAvailable ? '#e5e7eb' : '#f3f4f6', 
                color: isAvailable ? `${C.secondary}99` : `${C.secondary}40`,
                backgroundColor: isAvailable ? '#ffffff' : '#fafafa'
              }}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DoctorSelection({
  viewingDoctorsFor,
  availability,
  selectedPractitionerId,
  selectedHour,
  selectedMotif,
  setSelectedHour,
  setSelectedPractitionerId,
  onContinue,
  onBack,
}: {
  viewingDoctorsFor: string
  availability: { morning: any[]; afternoon: any[]; evening: any[] }
  selectedPractitionerId: number | null
  selectedHour: string | null
  selectedMotif: any
  setSelectedHour: (hour: string, doctorId?: number) => void
  setSelectedPractitionerId: (id: number | null) => void
  onContinue: () => void
  onBack: () => void
}) {
  const allSlots = [...availability.morning, ...availability.afternoon, ...availability.evening]
  const doctorsForTime = allSlots.filter((s) => s.label === viewingDoctorsFor && s.available !== false)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={onBack}
          className='flex items-center gap-2 rounded-full border px-4 py-2 text-sm'
          style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
        >
          <ArrowLeftIcon size={16} weight='duotone' />
          Retour
        </button>
        <div className='h-px flex-1' style={{ backgroundColor: '#e5e7eb' }} />
        <span className='text-sm font-medium' style={{ color: C.secondary }}>{viewingDoctorsFor}</span>
      </div>

      <div className='grid grid-cols-1 gap-2'>
        {doctorsForTime.map((slot: any) => {
          const isSelected = selectedHour === slot.startsAt && (selectedPractitionerId ?? null) === (slot.doctorId ?? null)
          const rawName = (slot.doctorName ?? '').trim()
          const nameWithoutPrefix = rawName.replace(/^dr\.?\s+/i, '').trim()
          const fullName = nameWithoutPrefix ? `Dr. ${nameWithoutPrefix}` : 'Dr.'
          
          // Sanitize image URL - block file:/// protocol
          let img = slot.doctorImage
          if (img && img.startsWith('file:///')) {
            console.warn('Blocked file:// protocol for doctor image:', img)
            img = null  // Force fallback to ui-avatars
          }

          // Special case: For consultation, always show Dr. Widad's photo
          const isConsultation = selectedMotif?.slug === 'consultation' || 
                                 selectedMotif?.name?.toLowerCase().includes('consultation')
          if (isConsultation) {
            img = '/images/team/widad.jpg'
          }

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
                'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm',
                isSelected && 'border-2'
              )}
              style={{
                borderColor: isSelected ? C.primary : '#e5e7eb',
                backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
              }}
            >
              <div className='h-10 w-10 overflow-hidden rounded-full border' style={{ borderColor: '#e5e7eb' }}>
                {img ? <img src={img} alt={fullName} className='h-full w-full object-cover' /> : null}
              </div>
              <div className='min-w-0 flex-1'>
                <div
                  className='text-sm font-semibold leading-snug whitespace-normal break-words'
                  style={{ color: C.secondary }}
                >
                  {fullName}
                </div>
                <div className='mt-0.5 text-[11px]' style={{ color: isSelected ? C.primary : `${C.secondary}60` }}>
                  Disponible à {viewingDoctorsFor}
                </div>
              </div>
              <div className='text-xs font-semibold' style={{ color: isSelected ? C.primary : `${C.secondary}40` }}>
                {isSelected ? 'Choisi' : 'Choisir'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BookingTypeChoice({
  onSelect,
  onClose,
}: {
  onSelect: (type: 'traitement' | 'consultation') => void
  onClose: () => void
}) {
  return (
    <motion.div
      variants={panelVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='pointer-events-auto w-full max-w-[min(calc(100vw-1.5rem),520px)] overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8'
    >
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg' style={{ fontFamily: TYPE.headingFamily, color: C.secondary, fontWeight: 500 }}>
          Prendre rendez-vous
        </h2>
        <button onClick={onClose} style={{ color: C.secondary }}>
          <X size={20} weight='regular' opacity={0.4} />
        </button>
      </div>

      <p className='mb-6 text-sm leading-relaxed' style={{ color: `${C.secondary}80` }}>
        Que souhaitez-vous faire ?
      </p>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <button
          onClick={() => onSelect('traitement')}
          className='group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg'
          style={{ borderColor: `${C.primary}20`, backgroundColor: `${C.primary}04` }}
        >
          <div
            className='flex h-16 w-16 items-center justify-center rounded-2xl transition-all group-hover:scale-105'
            style={{ backgroundColor: `${C.primary}12` }}
          >
            <FirstAid size={28} weight='duotone' style={{ color: C.primary }} />
          </div>
          <div>
            <div className='text-base font-semibold' style={{ color: C.secondary }}>
              Traitement
            </div>
            <p className='mt-1 text-xs leading-relaxed' style={{ color: `${C.secondary}70` }}>
              Épilation laser, soin visage, injection, etc.
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect('consultation')}
          className='group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg'
          style={{ borderColor: `${C.primary}20`, backgroundColor: `${C.primary}04` }}
        >
          <div
            className='flex h-16 w-16 items-center justify-center rounded-2xl transition-all group-hover:scale-105'
            style={{ backgroundColor: `${C.primary}12` }}
          >
            <Heart size={28} weight='duotone' style={{ color: C.primary }} />
          </div>
          <div>
            <div className='text-base font-semibold' style={{ color: C.secondary }}>
              Consultation
            </div>
            <p className='mt-1 text-xs leading-relaxed' style={{ color: `${C.secondary}70` }}>
              Avec Dr. Widad Slaoui
            </p>
          </div>
        </button>
      </div>

      <button
        onClick={onClose}
        className='mt-6 flex w-full items-center justify-center rounded-full border px-4 py-2.5 text-sm'
        style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
      >
        Annuler
      </button>
    </motion.div>
  )
}

function ConsultationForm({
  onBack,
  onClose,
  embedded,
}: {
  onBack: () => void
  onClose: () => void
  embedded: boolean
}) {
  const [consultStep, setConsultStep] = useState(1)
  const [date, setDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

  const validate = () => {
    const errs: { email?: string; phone?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email invalide'
    if (!/^[\d\s\+\-\.]{6,20}$/.test(phone)) errs.phone = 'Numéro invalide'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!prenom || !nom || !email || !phone) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.post('appointments', {
        name: `${prenom} ${nom}`,
        email,
        phone,
        context: `Consultation avec Dr. Widad Slaoui. ${note}`,
        datetime: date && selectedHour ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${selectedHour}:00` : undefined,
      })
      setSubmitted(true)
    } catch {
      setSubmitError('Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        variants={panelVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        className='pointer-events-auto w-full max-w-[min(calc(100vw-1.5rem),400px)] overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xl sm:p-8'
      >
        <div className='relative mb-6'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full' style={{ backgroundColor: `${C.primary}15` }}>
            <CheckIcon size={40} weight='regular' style={{ color: C.primary }} />
          </div>
        </div>
        <h3 className='mb-2 text-xl' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
Réservation reçue
        </h3>
        <p className='mb-6 text-sm leading-relaxed' style={{ color: `${C.secondary}80` }}>
          Votre demande de consultation avec Dr. Widad Slaoui a bien été reçue. Nous vous recontacterons rapidement.
        </p>
        <button
          onClick={onClose}
          className='w-full rounded-full py-3 text-sm font-medium text-white'
          style={{ backgroundColor: C.primary }}
        >
          Parfait
        </button>
      </motion.div>
    )
  }

  const inputBase = `w-full rounded-full border py-2.5 pr-4 pl-10 text-sm focus:outline-none ${C.secondary} placeholder:text-gray-400 border-gray-200 bg-white hover:border-gray-300 focus:border-[${C.primary}] focus:ring-1 focus:ring-[${C.primary}]/20`

  if (consultStep === 1) {
    return (
      <motion.div
        variants={panelVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        className={`shadow-xl ${
          embedded
            ? 'relative flex w-full max-w-full flex-col sm:max-w-[720px]'
            : 'pointer-events-auto relative flex w-full flex-col'
        } overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl`}
        style={{ width: embedded ? undefined : `min(calc(100vw - 1.5rem), 680px)` }}
      >
        <div className='mb-5 flex items-center justify-between px-5 pt-5 sm:mb-6 sm:px-6 sm:pt-6'>
          <h2 className='text-lg' style={{ fontFamily: TYPE.headingFamily, color: C.secondary, fontWeight: 500 }}>
            Consultation
          </h2>
          {embedded ? null : (
            <button onClick={onClose} style={{ color: C.secondary }}>
              <X size={20} weight='duotone' opacity={0.4} />
            </button>
          )}
        </div>

        <div className='flex flex-col gap-6 px-5 pb-5 sm:flex-row sm:px-6 sm:pb-6'>
          {/* Left — Dr. Widad */}
          <div className='flex shrink-0 flex-col items-center sm:w-[220px]'>
            <motion.img
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              src='/images/team/dr widad slaoui.jpg'
              alt='Dr. Widad Slaoui'
              className='h-[200px] w-full rounded-2xl object-cover object-center shadow-md sm:h-[270px]'
            />
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className='mt-3 text-sm font-semibold'
              style={{ color: C.secondary }}
            >
              Dr. Widad Slaoui
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className='text-xs'
              style={{ color: `${C.secondary}70` }}
            >
              Dermatologue esthétique
            </motion.span>
          </div>

          {/* Right — Calendar + Time */}
          <div className='flex flex-1 flex-col gap-5'>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='flex justify-center'
            >
              <DatePicker
                value={date ? formatDateInputValue(date) : null}
                onChange={(value) => {
                  setDate(value ? parseDateInputValue(value) : null)
                  setSelectedHour(null)
                }}
                minDate={new Date()}
                weekendDays={[0]}
                excludeDate={(d) => new Date(d).getDay() === 0}
                classNames={{
                  day: classes.datePickerDay,
                  calendarHeaderLevel: classes.datePickerHeaderLevel,
                  calendarHeaderControl: classes.datePickerHeaderControl,
                  calendarHeaderControlIcon: classes.datePickerHeaderControlIcon,
                  monthsListControl: classes.datePickerMonthControl,
                  yearsListControl: classes.datePickerYearControl,
                }}
              />
            </motion.div>

            <AnimatePresence>
              {date ? (
                <motion.div
                  key='time-slots'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className='overflow-hidden'
                >
                  <div className='flex items-center gap-2 mb-3'>
                    <span className='text-[11px] font-semibold uppercase tracking-[0.12em]' style={{ color: `${C.secondary}50` }}>
                      {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <div className='h-px flex-1' style={{ backgroundColor: '#e5e7eb' }} />
                  </div>
                  <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot}
                        whileTap={{ scale: 0.95 }}
                        type='button'
                        onClick={() => setSelectedHour(slot)}
                        className='flex items-center justify-center rounded-[10px] border px-3 py-2.5 text-[13px] font-medium transition-shadow hover:shadow-sm'
                        style={{
                          borderColor: selectedHour === slot ? C.primary : '#e5e7eb',
                          color: selectedHour === slot ? '#fff' : `${C.secondary}99`,
                          backgroundColor: selectedHour === slot ? C.primary : '#fff',
                          boxShadow: selectedHour === slot ? `0 4px 12px ${C.primary}40` : 'none',
                        }}
                      >
                        {slot}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className='flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6' style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={onBack}
            className='flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm sm:w-auto'
            style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
          >
            Retour
          </button>
          <button
            onClick={() => setConsultStep(2)}
            disabled={!date || !selectedHour}
            className='flex w-full items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
            style={{ backgroundColor: C.primary }}
          >
            Informations De Contact
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={panelVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className={`shadow-xl ${
        embedded
          ? 'relative flex w-full max-w-full flex-col min-h-[24rem] sm:max-w-[720px] sm:min-h-[30rem]'
          : 'pointer-events-auto relative flex w-full flex-col'
      } overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xl sm:p-6`}
      style={embedded ? undefined : { width: `min(calc(100vw - 1.5rem), 520px)` }}
    >
      <div className='mb-5 flex items-center justify-between sm:mb-6'>
        <h2 className='text-lg' style={{ fontFamily: TYPE.headingFamily, color: C.secondary, fontWeight: 500 }}>
          Consultation — Contact
        </h2>
        {embedded ? null : (
          <button onClick={onClose} style={{ color: C.secondary }}>
            <X size={20} weight='duotone' opacity={0.4} />
          </button>
        )}
      </div>

      <div className='relative mb-6 flex items-center gap-3 rounded-xl border p-3' style={{ borderColor: `${C.primary}20`, backgroundColor: `${C.primary}06` }}>
        <div className='h-10 w-10 shrink-0 overflow-hidden rounded-full' style={{ backgroundColor: `${C.primary}15` }}>
          <img src='/images/team/dr widad slaoui.jpg' alt='Dr. Widad Slaoui' className='h-full w-full object-cover object-top' />
        </div>
        <div className='flex-1'>
          <div className='text-sm font-semibold' style={{ color: C.secondary }}>Dr. Widad Slaoui</div>
        </div>
        <div className='text-right text-xs' style={{ color: `${C.secondary}60` }}>
          {date && selectedHour ? `${date.toLocaleDateString('fr-FR')} ${selectedHour}` : ''}
        </div>
      </div>

      {submitError ? (
        <div className='mb-4 rounded-lg border p-3 text-sm' style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2', color: '#dc2626' }}>
          {submitError}
        </div>
      ) : null}

      <div className='mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4'>
        <div className='relative'>
          <User size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
          <input
            required
            type='text'
            placeholder='Prénom'
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className={inputBase}
          />
        </div>
        <div className='relative'>
          <User size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
          <input
            required
            type='text'
            placeholder='Nom'
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={inputBase}
          />
        </div>
        <div className='sm:col-span-2'>
          <div className='relative'>
            <Mail size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
            <input
              required
              type='email'
              placeholder='Adresse Email'
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }) }}
              className={inputBase}
            />
          </div>
          {errors.email && <p className='mt-1 px-3 text-[11px]' style={{ color: '#dc2626' }}>{errors.email}</p>}
        </div>
        <div className='sm:col-span-2'>
          <div className='relative'>
            <Phone size={16} weight='duotone' className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: `${C.secondary}60` }} />
            <input
              required
              type='tel'
              placeholder='Numéro De Téléphone'
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: undefined }) }}
              className={inputBase}
            />
          </div>
          {errors.phone && <p className='mt-1 px-3 text-[11px]' style={{ color: '#dc2626' }}>{errors.phone}</p>}
        </div>
      </div>

      <div className='mb-6'>
        <textarea
          placeholder='Note (optionnelle)'
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className='w-full resize-none rounded-xl border px-4 py-3 text-sm'
          style={{ color: C.secondary, borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
        />
      </div>

      <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between' style={{ borderColor: '#e5e7eb' }}>
        <button
          onClick={() => setConsultStep(1)}
          className='flex w-full items-center justify-center rounded-full border px-4 py-2 text-sm sm:w-auto'
          style={{ borderColor: '#e5e7eb', color: `${C.secondary}99` }}
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !prenom || !nom || !email || !phone}
          className='flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto'
          style={{ backgroundColor: C.primary }}
        >
          {submitting ? (
            <>
              <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
              </svg>
              Envoi...
            </>
          ) : (
            'Confirmer la consultation'
          )}
        </button>
      </div>
    </motion.div>
  )
}

function SuccessStep({ onClose, embedded }: { onClose: () => void; embedded: boolean }) {
  return (
    <motion.div
      variants={panelVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className={`overflow-hidden rounded-2xl border text-center ${embedded ? 'relative w-full max-w-[520px]' : 'pointer-events-auto w-full max-w-[min(calc(100vw-1.5rem),400px)]'} border-gray-100 bg-white p-6 shadow-xl sm:p-8`}
    >
      <div className='relative mb-6'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full' style={{ backgroundColor: `${C.primary}15` }}>
            <CheckIcon size={40} weight='regular' style={{ color: C.primary }} />
        </div>
      </div>

      <h3 className='mb-2 text-xl' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
        Réservation reçue
      </h3>
      <p className='mb-6 text-sm leading-relaxed' style={{ color: `${C.secondary}80` }}>
        Votre demande a bien été reçue. Le cabinet vous recontactera sous 24h pour confirmer votre rendez-vous.
      </p>

      <button
        onClick={onClose}
        className='w-full rounded-full py-3 text-sm font-medium text-white'
        style={{ backgroundColor: C.primary }}
      >
        Parfait
      </button>
    </motion.div>
  )
}
