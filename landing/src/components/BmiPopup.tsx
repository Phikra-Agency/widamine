import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from '@phosphor-icons/react'
import { C, TYPE } from '@/lib/theme'
import { calcBmi, bmiCategory } from '@/lib/bmi'
import { useBmiPopupStore } from '@/stores/bmiPopupStore'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

const SEGMENTS = [
  { label: '< 18,5', color: '#62bca1' },
  { label: '18,5–25', color: '#009FD6' },
  { label: '25–30', color: '#F7A269' },
  { label: '30+', color: '#c0756a' },
]

export default function BmiPopup() {
  const { isOpen, close, setResult } = useBmiPopupStore()
  const openBooking = useScheduleModalStore((s) => s.open)
  const [step, setStep] = useState(1)
  const [gender, setGender] = useState<'FEMME' | 'HOMME' | ''>('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const ageNum = Number(age)
  const ageOk = age !== '' && ageNum >= 5 && ageNum <= 120
  const bmi = calcBmi(Number(height), Number(weight))
  const cat = bmi === null ? null : bmiCategory(bmi)
  const marker = bmi === null ? null : Math.min(100, Math.max(0, ((bmi - 12) / (42 - 12)) * 100))

  const reset = () => { setStep(1); setGender(''); setAge(''); setHeight(''); setWeight('') }
  const handleClose = () => {
    close()
    reset()
  }
  
  const handleResultClose = () => {
    // Save result for chatbot to access
    if (bmi !== null && cat && gender && ageNum) {
      setResult({
        bmi,
        category: cat.label,
        gender: gender as 'FEMME' | 'HOMME',
        age: ageNum,
      })
    }
    handleClose()
  }
  
  const goBooking = () => { close(); openBooking() }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-[9999] flex items-center justify-center px-5'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* backdrop */}
          <div
            className='absolute inset-0 bg-black/40'
            onClick={step === 4 ? handleResultClose : handleClose}
          />

          {/* card — cream bg, site language */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className='relative w-full max-w-sm'
            style={{
              background: C.bg,
              borderRadius: '2rem',
              boxShadow: '0 24px 60px -12px rgba(26,54,70,0.16), 0 0 0 1px rgba(26,54,70,0.06)',
            }}
          >
            {/* close */}
            <button
              onClick={step === 4 ? handleResultClose : handleClose}
              aria-label='Fermer'
              className='absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-black/6'
              style={{ color: `${C.secondary}45` }}
            >
              <X size={14} weight='bold' />
            </button>

            <div className='px-8 pb-9 pt-9'>
              {/* logo */}
              <div className='mb-7 flex justify-center'>
                <img src='/logo.svg' alt='Widamine' className='h-9 w-9 object-contain' />
              </div>

              <AnimatePresence mode='wait'>
                {/* ── step 1 — gender ── */}
                {step === 1 && (
                  <Step key='s1'>
                    <Heading>Vous êtes ?</Heading>
                    <Sub>Pour un calcul personnalisé</Sub>
                    <div className='mt-7 grid grid-cols-2 gap-3'>
                      {(['FEMME', 'HOMME'] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => { setGender(g); setStep(2) }}
                          className='cursor-pointer rounded-2xl py-4 text-sm font-semibold transition-all active:scale-[0.97]'
                          style={{
                            background: gender === g ? C.primary : 'white',
                            color: gender === g ? '#fff' : C.secondary,
                            border: `1px solid ${gender === g ? C.primary : 'rgba(26,54,70,0.10)'}`,
                          }}
                        >
                          {g === 'FEMME' ? 'Femme' : 'Homme'}
                        </button>
                      ))}
                    </div>
                  </Step>
                )}

                {/* ── step 2 — age ── */}
                {step === 2 && (
                  <Step key='s2'>
                    <Heading>Votre âge ?</Heading>
                    <Sub>Entre 5 et 120 ans</Sub>
                    <input
                      autoFocus
                      type='number'
                      inputMode='numeric'
                      min={5}
                      max={120}
                      placeholder='34'
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className='hide-number-spinners mt-7 w-full rounded-2xl bg-white px-5 py-4 text-center text-2xl font-semibold outline-none transition-all'
                      style={{
                        border: `1px solid ${ageOk ? C.primary : 'rgba(26,54,70,0.10)'}`,
                        color: C.secondary,
                        fontFamily: TYPE.headingFamily,
                      }}
                    />
                    <Row onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!ageOk} />
                  </Step>
                )}

                {/* ── step 3 — height & weight ── */}
                {step === 3 && (
                  <Step key='s3'>
                    <Heading>Taille & poids</Heading>
                    <Sub>En centimètres et kilogrammes</Sub>
                    <div className='mt-7 grid grid-cols-2 gap-3'>
                      <Field label='Taille' unit='cm' placeholder='170' value={height} onChange={setHeight} />
                      <Field label='Poids' unit='kg' placeholder='70' value={weight} onChange={setWeight} />
                    </div>
                    <Row onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={bmi === null} nextLabel='Voir mon résultat' />
                  </Step>
                )}

                {/* ── step 4 — result ── */}
                {step === 4 && bmi !== null && cat && marker !== null && (
                  <Step key='s4'>
                    <p className='mb-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em]' style={{ color: `${C.secondary}50` }}>
                      {gender === 'FEMME' ? 'Femme' : 'Homme'} · {ageNum} ans
                    </p>
                    <div className='flex flex-col items-center py-3'>
                      <span
                        className='text-[68px] font-bold leading-none'
                        style={{ color: cat.color, fontFamily: TYPE.headingFamily }}
                      >
                        {bmi.toString().replace('.', ',')}
                      </span>
                      <span
                        className='mt-2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white'
                        style={{ background: cat.color }}
                      >
                        {cat.label}
                      </span>
                    </div>

                    {/* spectrum bar */}
                    <div className='relative mt-4'>
                      <div className='flex h-2 overflow-hidden rounded-full'>
                        {SEGMENTS.map((s) => (
                          <div key={s.label} className='h-full flex-1' style={{ background: s.color }} />
                        ))}
                      </div>
                      <div
                        className='absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-md transition-all duration-500'
                        style={{ left: `${marker}%`, borderColor: cat.color }}
                      />
                    </div>
                    <div className='mt-1.5 flex justify-between text-[10px] font-semibold' style={{ color: `${C.secondary}45` }}>
                      {SEGMENTS.map((s) => <span key={s.label}>{s.label}</span>)}
                    </div>

                    <p className='mt-4 text-center text-[13px] leading-relaxed' style={{ color: `${C.secondary}80`, fontFamily: TYPE.bodyFamily }}>
                      {cat.advice}
                    </p>

                    <button
                      onClick={goBooking}
                      className='mt-6 w-full cursor-pointer rounded-2xl py-4 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]'
                      style={{ background: C.primary }}
                    >
                      Prendre rendez-vous
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className='mt-3 flex w-full cursor-pointer items-center justify-center gap-1 text-xs transition-opacity hover:opacity-60'
                      style={{ color: `${C.secondary}40`, fontFamily: TYPE.bodyFamily }}
                    >
                      <ArrowLeft size={11} /> Modifier
                    </button>
                  </Step>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Global style to hide number spinners */}
      <style>{`
        .hide-number-spinners::-webkit-outer-spin-button,
        .hide-number-spinners::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-number-spinners[type=number] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>
    </AnimatePresence>
  )
}

/* ── helpers ── */

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className='text-center'
      style={{
        fontFamily: TYPE.headingFamily,
        fontSize: 'clamp(1.6rem, 4vw, 2rem)',
        letterSpacing: '-0.02em',
        lineHeight: 1.05,
        color: C.secondary,
      }}
    >
      {children}
    </h2>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p
      className='mt-1.5 text-center text-[12px]'
      style={{ color: `${C.secondary}50`, fontFamily: TYPE.bodyFamily }}
    >
      {children}
    </p>
  )
}

function Row({ onBack, onNext, disabled, nextLabel = 'Continuer' }: {
  onBack: () => void
  onNext: () => void
  disabled: boolean
  nextLabel?: string
}) {
  return (
    <div className='mt-7 flex items-center justify-between'>
      <button
        onClick={onBack}
        className='flex cursor-pointer items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-60'
        style={{ color: `${C.secondary}45`, fontFamily: TYPE.bodyFamily }}
      >
        <ArrowLeft size={12} /> Retour
      </button>
      <button
        onClick={onNext}
        disabled={disabled}
        className='cursor-pointer rounded-2xl px-7 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-25'
        style={{ background: C.primary, fontFamily: TYPE.bodyFamily }}
      >
        {nextLabel}
      </button>
    </div>
  )
}

function Field({ label, unit, placeholder, value, onChange }: {
  label: string
  unit: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className='block'>
      <span
        className='mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em]'
        style={{ color: `${C.secondary}50`, fontFamily: TYPE.bodyFamily }}
      >
        {label}
      </span>
      <div className='relative'>
        <input
          type='number'
          inputMode='decimal'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='hide-number-spinners w-full rounded-2xl bg-white px-4 py-3.5 pr-9 text-base font-semibold outline-none transition-all'
          style={{
            border: `1px solid ${value ? C.primary : 'rgba(26,54,70,0.10)'}`,
            color: C.secondary,
          }}
        />
        <span
          className='absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase'
          style={{ color: `${C.secondary}35` }}
        >
          {unit}
        </span>
      </div>
    </label>
  )
}
