import { useEffect } from 'react'
import PublicNavbar from '@/components/PublicNavbar'
import BookingFlow from '@/components/BookingFlow'
import { ShieldCheck, Clock as Clock3, Sparkle as Sparkles } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C } from '@/lib/theme'

const SM = {
  branch: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba364172b57bbc64c50e1e_consult-branche-feuiille.avif',
}

const MOTIF_ICONS: Record<string, string> = {
  'visage': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66a3622bd361eeb686e5034c_traitement-epilation-visage-icon.svg',
  'corps': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e3ef40b0429e8f2bebc5c3_Epilation%20laser%20icon.svg',
  'laser': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66bdeeb1e623adcef03992fa_laser-remodelage-icon.svg',
  'injection': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e85a039533e71f235fffa1_Injection%20de%20Botox%20icon.svg',
  'consultation': 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e2f4b991b4497731bc170c_Trucs%20Dermato%20icon.svg',
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

      {/* ─── Hero ─── */}
      <section className='relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24'>
        <img src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb3d4417f66a31d312431_contact-header-libellule.avif' alt='' className='absolute left-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />
        <img src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66bdb37252963420db73fe16_contact-header-feuillage.avif' alt='' className='absolute right-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />
        <img src={SM.branch} alt='' className='absolute right-0 bottom-0 w-28 sm:w-40 widamine-tint opacity-40' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.28em]' style={{ color: C.primary }}>Rendez-vous</p>
              <h1 className='mt-3 font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                Réservez votre <span style={{ color: C.primary, fontStyle: 'italic' }}>consultation</span>
              </h1>
              <p className='mt-6 max-w-md text-sm leading-8 sm:text-base' style={{ color: `${C.secondary}b3` }}>
                Choisissez votre motif de visite, sélectionnez le créneau qui vous convient et renseignez vos coordonnées. En quelques clics, votre rendez-vous est confirmé.
              </p>
              <div className='mt-6 flex flex-wrap gap-3'>
                <TrustPill icon={ShieldCheck} text='Réservation sécurisée' />
                <TrustPill icon={Clock3} text='Réservation rapide' />
                <TrustPill icon={Sparkles} text='Expérience cohérente' />
              </div>
            </div>

            {/* Motifs card */}
            <div className='rounded-[2rem] bg-white p-6 sm:p-8' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}>
              <p className='text-xs uppercase tracking-[0.26em] font-semibold' style={{ color: C.primary }}>
                Motifs disponibles
              </p>
              <p className='mt-1 text-xs' style={{ color: `${C.secondary}a0` }}>Sélectionnez votre motif dans le formulaire</p>
              <div className='mt-5 flex flex-wrap gap-2'>
                {motifs.map((motif) => {
                  const key = motif.name.toLowerCase().includes('visage') ? 'visage'
                    : motif.name.toLowerCase().includes('corps') ? 'corps'
                    : motif.name.toLowerCase().includes('laser') ? 'laser'
                    : motif.name.toLowerCase().includes('botox') || motif.name.toLowerCase().includes('injection') || motif.name.toLowerCase().includes('acide') ? 'injection'
                    : 'consultation'
                  return (
                    <div key={motif.id} className='inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs shadow-sm' style={{ borderColor: `${C.primary}20`, color: C.secondary, background: `${C.primary}08` }}>
                      <img src={MOTIF_ICONS[key]} alt='' className='h-4 w-4 object-contain opacity-60' loading='lazy' />
                      {motif.name}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Booking flow ─── */}
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
