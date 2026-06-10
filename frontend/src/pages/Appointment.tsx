import { useEffect } from 'react'
import PublicNavbar from '@/components/PublicNavbar'
import BookingFlow from '@/components/BookingFlow'
import { ShieldCheck, Clock as Clock3, Sparkle as Sparkles } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

const C = { bg: '#F7F1EB', primary: '#2e90c0', secondary: '#1a3646' }

const SM = {
  hero: {
    topLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3565abad49265e1cb980_header-top-left.avif',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af35669264ecc82de0caaa_header-top-right.avif',
    midRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3566abad49265e1cb9a8_header-middle-right.avif',
  },
}

export default function Appointment() {
  const { restart, motifs, loadMotifs } = useScheduleModalStore()

  useEffect(() => {
    restart()
    void loadMotifs()
  }, [loadMotifs, restart])

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero (same pattern as SM contact header) ─── */}
      <section className='relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24'>
        <img src={SM.hero.topLeft} alt='' className='absolute left-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />
        <img src={SM.hero.topRight} alt='' className='absolute right-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />
        <img src={SM.hero.midRight} alt='' className='absolute right-0 bottom-0 w-28 sm:w-40 widamine-tint opacity-40' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start'>
            {/* Left — heading + intro */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.28em]' style={{ color: C.primary }}>Rendez-vous</p>
              <h1 className='mt-3 font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                Réservez votre <span style={{ color: C.primary, fontStyle: 'italic' }}>consultation</span>
              </h1>
              <p className='mt-6 max-w-md text-sm leading-8 sm:text-base' style={{ color: `${C.secondary}b3` }}>
                Choisissez votre motif, votre date et vos coordonnées. Le formulaire reprend exactement l'expérience de réservation du site.
              </p>
              <div className='mt-6 flex flex-wrap gap-3'>
                <TrustPill icon={ShieldCheck} text='Réservation sécurisée' />
                <TrustPill icon={Clock3} text='Réservation rapide' />
                <TrustPill icon={Sparkles} text='Expérience cohérente' />
              </div>
            </div>

            {/* Right — motifs card (white, same as SM contact cards) */}
            <div className='rounded-2xl p-6 sm:p-8' style={{ background: 'white', boxShadow: '0 4px 20px -6px rgba(0,0,0,0.06)' }}>
              <p className='text-xs uppercase tracking-[0.26em]' style={{ color: `${C.secondary}a0` }}>Motifs disponibles</p>
              <div className='mt-4 space-y-3 text-sm leading-7' style={{ color: `${C.secondary}b3` }}>
                {motifs.map((motif) => (
                  <p key={motif.id}>{motif.name}.</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Booking flow (full width, same as SM consult section pattern) ─── */}
      <section className='mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28'>
        <div className='flex justify-center'>
          <BookingFlow embedded />
        </div>
      </section>
    </div>
  )
}

function TrustPill({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3.5 py-2 text-[13px] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]' style={{ color: `${C.secondary}b3` }}>
      <Icon className='h-4 w-4' style={{ color: C.primary }} />
      {text}
    </div>
  )
}
