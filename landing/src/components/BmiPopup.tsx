import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from '@phosphor-icons/react'
import { C, TYPE } from '@/lib/theme'
import { calcBmi, bmiCategory } from '@/lib/bmi'
import { useBmiPopupStore } from '@/stores/bmiPopupStore'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

const SEGMENTS = [
  { label: '< 18,5', color: '#62bca1' },
  { label: '18,5 – 25', color: '#009FD6' },
  { label: '25 – 30', color: '#F7A269' },
  { label: '30 +', color: '#6D0024' },
]

const inputCls = 'min-h-14 w-full rounded-full border bg-white px-6 text-base font-semibold outline-none transition-all duration-500 focus:brightness-[0.97]'
const nextCls = 'inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-8 text-base font-semibold text-white transition-colors duration-500 hover:!bg-[#007a9e] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40'

export default function BmiPopup() {
  const { isOpen, close } = useBmiPopupStore()
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
  // ponytail: marker clamped to the 12–42 display range
  const marker = bmi === null ? null : Math.min(100, Math.max(0, ((bmi - 12) / (42 - 12)) * 100))

  const goBooking = () => {
    close()
    openBooking()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className='fixed inset-0 z-[9999]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className='absolute inset-0 bg-black/40' onClick={close} />
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-y-auto px-4 py-6'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              className='pointer-events-auto w-full max-w-lg overflow-hidden rounded-[2rem] p-8 sm:p-10'
              style={{ background: 'white', boxShadow: '0 16px 48px -12px rgba(26,54,70,0.15)' }}
            >
              <div className='flex items-start justify-between'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em]' style={{ color: C.primary }}>
                  Bilan express · {step}/4
                </p>
                <button onClick={close} aria-label='Fermer' className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full' style={{ color: `${C.secondary}40` }}>
                  <X size={14} weight='bold' />
                </button>
              </div>

              <div className='mt-3 flex gap-1.5'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='h-1 flex-1 rounded-full transition-colors duration-300' style={{ background: i <= step ? C.primary : `${C.secondary}15` }} />
                ))}
              </div>

              {step === 1 ? (
                <div className='mt-6'>
                  <h2 className='text-balance' style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h2, letterSpacing: TYPE.headingSpacing, lineHeight: '0.95', color: C.secondary }}>
                    Vous êtes <span style={{ color: C.primary, fontStyle: 'italic' }}>?</span>
                  </h2>
                  <div className='mt-6 grid grid-cols-2 gap-4'>
                    {(['FEMME', 'HOMME'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGender(g); setStep(2) }}
                        className='min-h-14 cursor-pointer rounded-full border-2 text-base font-semibold transition-all duration-300 active:scale-[0.96]'
                        style={{
                          borderColor: gender === g ? C.primary : `${C.secondary}15`,
                          background: gender === g ? `${C.primary}10` : 'white',
                          color: C.secondary,
                        }}
                      >
                        {g === 'FEMME' ? 'Femme' : 'Homme'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className='mt-6'>
                  <h2 className='text-balance' style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h2, letterSpacing: TYPE.headingSpacing, lineHeight: '0.95', color: C.secondary }}>
                    Votre <span style={{ color: C.primary, fontStyle: 'italic' }}>âge</span> ?
                  </h2>
                  <input
                    type='number' inputMode='numeric' min={5} max={120} placeholder='34'
                    value={age} onChange={(e) => setAge(e.target.value)}
                    className={`${inputCls} mt-6 text-center text-2xl`}
                    style={{ borderColor: C.primary, color: C.secondary }}
                  />
                  <div className='mt-6 flex items-center justify-between'>
                    <button onClick={() => setStep(1)} className='flex cursor-pointer items-center gap-1 text-sm font-semibold' style={{ color: `${C.secondary}60` }}>
                      <ArrowLeft size={14} /> Retour
                    </button>
                    <button onClick={() => setStep(3)} disabled={!ageOk} className={nextCls} style={{ background: C.primary }}>
                      Continuer
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className='mt-6'>
                  <h2 className='text-balance' style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h2, letterSpacing: TYPE.headingSpacing, lineHeight: '0.95', color: C.secondary }}>
                    Taille <span style={{ color: C.primary, fontStyle: 'italic' }}>&</span> poids
                  </h2>
                  <div className='mt-6 grid grid-cols-2 gap-4'>
                    <label className='block'>
                      <span className='mb-2 block text-xs font-semibold uppercase tracking-[0.15em]' style={{ color: C.secondary }}>Taille (cm)</span>
                      <input
                        type='number' inputMode='decimal' min={50} max={300} placeholder='170'
                        value={height} onChange={(e) => setHeight(e.target.value)}
                        className={inputCls}
                        style={{ borderColor: C.primary, color: C.secondary }}
                      />
                    </label>
                    <label className='block'>
                      <span className='mb-2 block text-xs font-semibold uppercase tracking-[0.15em]' style={{ color: C.secondary }}>Poids (kg)</span>
                      <input
                        type='number' inputMode='decimal' min={10} max={500} placeholder='70'
                        value={weight} onChange={(e) => setWeight(e.target.value)}
                        className={inputCls}
                        style={{ borderColor: C.primary, color: C.secondary }}
                      />
                    </label>
                  </div>
                  <div className='mt-6 flex items-center justify-between'>
                    <button onClick={() => setStep(2)} className='flex cursor-pointer items-center gap-1 text-sm font-semibold' style={{ color: `${C.secondary}60` }}>
                      <ArrowLeft size={14} /> Retour
                    </button>
                    <button onClick={() => setStep(4)} disabled={bmi === null} className={nextCls} style={{ background: C.primary }}>
                      Voir mon résultat
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 4 && bmi !== null && cat && marker !== null ? (
                <div className='mt-6'>
                  <p className='text-center text-sm' style={{ color: `${C.secondary}80` }}>
                    {gender === 'FEMME' ? 'Femme' : 'Homme'} · {ageNum} ans
                  </p>
                  <div className='mt-2 flex items-baseline justify-center gap-3'>
                    <span className='text-6xl font-bold' style={{ color: cat.color, fontFamily: TYPE.headingFamily }}>
                      {bmi.toString().replace('.', ',')}
                    </span>
                    <span className='text-sm font-semibold uppercase tracking-[0.15em]' style={{ color: C.secondary }}>{cat.label}</span>
                  </div>

                  <div className='relative mt-5'>
                    <div className='flex h-3 overflow-hidden rounded-full'>
                      {SEGMENTS.map((s) => (
                        <div key={s.label} className='h-full flex-1' style={{ background: s.color }} title={s.label} />
                      ))}
                    </div>
                    <div
                      className='absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-white shadow-md transition-all duration-500'
                      style={{ left: `${marker}%`, borderColor: cat.color }}
                    />
                  </div>
                  <div className='mt-2 flex justify-between text-[11px] font-semibold' style={{ color: `${C.secondary}80` }}>
                    {SEGMENTS.map((s) => <span key={s.label}>{s.label}</span>)}
                  </div>

                  <p className='mt-5 text-center text-base leading-relaxed' style={{ color: `${C.secondary}cc`, fontFamily: TYPE.bodyFamily }}>
                    {ageNum < 18 ? 'Pour les moins de 18 ans, l\u2019interprétation se fait sur courbe, demandez conseil au centre. ' : ''}{cat.advice}
                  </p>

                  <div className='mt-5 flex items-center justify-between'>
                    <button onClick={() => setStep(3)} className='flex cursor-pointer items-center gap-1 text-sm font-semibold' style={{ color: `${C.secondary}60` }}>
                      <ArrowLeft size={14} /> Modifier
                    </button>
                    <button
                      onClick={goBooking}
                      className='inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full px-8 text-base font-semibold text-white transition-colors duration-500 hover:!bg-[#007a9e] active:scale-[0.96]'
                      style={{ background: C.primary }}
                    >
                      Prendre rendez-vous
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
