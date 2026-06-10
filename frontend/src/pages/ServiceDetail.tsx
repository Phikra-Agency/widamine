import PublicNavbar from '@/components/PublicNavbar'
import { getServicePage } from '@/lib/siteContent'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { useParams } from 'react-router-dom'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'

const C = { bg: '#F7F1EB', primary: '#2e90c0', secondary: '#1a3646' }

const SM = {
  hero: {
    topLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3565abad49265e1cb980_header-top-left.avif',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af35669264ecc82de0caaa_header-top-right.avif',
  },
}

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const service = getServicePage(slug)

  if (!service) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className='mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8 sm:pt-40'>
          <div className='rounded-2xl bg-white p-8 text-secondary' style={{ boxShadow: '0 4px 20px -6px rgba(0,0,0,0.06)' }}>
            Service introuvable.
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero (same pattern as SM) ─── */}
      <section className='relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24'>
        <img src={SM.hero.topLeft} alt='' className='absolute left-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />
        <img src={SM.hero.topRight} alt='' className='absolute right-0 top-16 w-36 sm:w-52 lg:w-64 widamine-tint opacity-50' loading='lazy' />

        <div className='relative mx-auto max-w-6xl px-5 sm:px-8'>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start'>
            {/* Left — heading + intro */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.28em]' style={{ color: C.primary }}>{service.eyebrow}</p>
              <h1 className='mt-3 font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                {service.title}
              </h1>
              <p className='mt-6 max-w-md text-sm leading-8 sm:text-base' style={{ color: `${C.secondary}b3` }}>
                {service.intro}
              </p>
            </div>

            {/* Right — image card */}
            <div className='overflow-hidden rounded-2xl' style={{ boxShadow: '0 4px 20px -6px rgba(0,0,0,0.06)' }}>
              <img src={service.image} alt={service.title} className='h-64 w-full object-cover sm:h-80' />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Consult section (orange bg, approach + booking CTA) ─── */}
      <section className='mx-auto max-w-6xl px-5 sm:px-8'>
        <div className='overflow-hidden rounded-2xl p-8 sm:p-10 lg:p-12' style={{ background: C.primary, color: 'white' }}>
          <div className='grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center'>
            <div>
              <p className='text-xs uppercase tracking-[0.26em] text-white/60'>Approche Widamine</p>
              <h2 className='mt-3 font-amoria text-2xl leading-tight sm:text-3xl'>
                {service.title}
              </h2>
              <p className='mt-4 text-sm leading-7 text-white/80'>
                {service.heroDescription}
              </p>
              <BookButton />
            </div>
            <div className='hidden lg:flex justify-center'>
              <div className='relative w-full max-w-[200px] aspect-[2/3] rounded-2xl overflow-hidden' style={{ border: '3px solid white' }}>
                <img src={service.image} alt={service.title} className='h-full w-full object-cover widamine-tint' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlights + Content (2-col) ─── */}
      <section className='mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28'>
        <div className='grid gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-start'>
          {/* Left sticky — highlights */}
          <div className='lg:sticky lg:top-28'>
            <h2 className='font-amoria text-2xl leading-tight sm:text-3xl' style={{ color: C.secondary }}>
              Nos <span style={{ color: C.primary, fontStyle: 'italic' }}>expertises</span>
            </h2>
            <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
              {service.highlights.map((item) => (
                <div key={item} className='flex items-start gap-3 rounded-xl bg-white p-4' style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)' }}>
                  <span className='mt-2 h-2 w-2 shrink-0 rounded-full' style={{ background: C.primary }} />
                  <p className='text-sm leading-7' style={{ color: `${C.secondary}b3` }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — content sections */}
          <div className='space-y-4'>
            {service.sections.map((section) => (
              <div key={section.title} className='rounded-2xl bg-white p-6' style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)' }}>
                <h3 className='text-lg font-semibold' style={{ color: C.secondary }}>{section.title}</h3>
                <p className='mt-3 text-sm leading-8' style={{ color: `${C.secondary}a0` }}>{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function BookButton() {
  const { open } = useScheduleModalStore()
  return (
    <button
      onClick={open}
      className='mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:scale-[0.97]'
      style={{ color: C.primary }}
    >
      Réserver une consultation
      <ArrowUpRightIcon size={16} />
    </button>
  )
}
