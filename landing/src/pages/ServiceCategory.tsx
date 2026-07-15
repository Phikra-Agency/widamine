import { Link, useParams } from 'react-router-dom'
import PublicNavbar from '@/components/PublicNavbar'
import { SERVICE_PAGES } from '@/lib/siteContent'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import { C, TYPE, SPACING } from '@/lib/theme'
import { CalendarBlank, PhoneCall } from '@phosphor-icons/react'
import { ServiceIcon } from '@/components/ServiceIcon'

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  visage: {
    title: 'Traitements du visage',
    description: 'Des soins dermatologiques et esthétiques pour sublimer votre visage. Technologies de pointe et expertise médicale pour des résultats naturels et durables.',
  },
  corps: {
    title: 'Traitements du corps',
    description: 'Redessinez votre silhouette avec nos traitements de body contouring non-invasifs et nos programmes silhouette personnalisés.',
  },
  techniques: {
    title: 'Nos techniques',
    description: 'Découvrez les technologies laser et esthétiques de dernière génération que nous utilisons pour vous offrir les meilleurs résultats.',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  visage: '#14B8A6',
  corps: '#2E90C0',
  techniques: '#F59E0B',
}

export default function ServiceCategory() {
  const { category = 'visage' } = useParams<{ category: string }>()
  const { open } = useScheduleModalStore()
  const cat = CATEGORY_LABELS[category]
  const catColor = CATEGORY_COLORS[category] || C.primary
  const services = SERVICE_PAGES.filter((p) => p.category === category)
  const otherCategories = Object.keys(CATEGORY_LABELS).filter((c) => c !== category)

  if (!cat || services.length === 0) {
    return (
      <div className='min-h-screen' style={{ background: C.bg }}>
        <PublicNavbar />
        <section className={`${SPACING.container} pt-32 pb-16 sm:pt-40`}>
          <div className='rounded-2xl bg-white p-8 text-center' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}>
            <p className='text-lg'>Catégorie introuvable.</p>
            <Link to='/' className='mt-4 inline-flex items-center gap-2 text-sm font-medium' style={{ color: C.primary }}>
              ← Retour
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ background: C.bg }}>
      <PublicNavbar />

      {/* ─── Hero: Two-column editorial ─── */}
      <section className='relative overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-14'>
        <div
          className='pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl'
          style={{ background: catColor, opacity: 0.1 }}
        />
        <div className={`${SPACING.container}`}>
          <div className='grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start'>
            <div className='mx-auto max-w-2xl lg:mx-0 text-center lg:text-left'>
              <Link
                to='/'
                className='mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition hover:opacity-65'
                style={{ color: C.primary, fontFamily: TYPE.bodyFamily }}
              >
                ← Retour
              </Link>
              <h1
                className='text-balance leading-[1.1] sm:text-4xl md:text-5xl'
                style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h1, letterSpacing: TYPE.headingSpacing, color: C.secondary }}
              >
                <em style={{ color: C.primary, fontStyle: 'italic' }}>{cat.title.split(' ')[0]}</em>
                {` ${cat.title.split(' ').slice(1).join(' ')}`}
              </h1>
              <p className='mx-auto mt-6 max-w-xl text-sm leading-7 sm:text-base lg:mx-0'>
                {cat.description}
              </p>
            </div>

            <div className='relative mt-10 lg:mt-0 lg:sticky lg:top-28'>
              <div className='relative mx-auto flex h-[320px] w-full max-w-[280px] items-center justify-center lg:mx-0 lg:max-w-[380px]'>
                <div
                  className='absolute left-4 top-0 h-36 w-36 rounded-full'
                  style={{ background: catColor, opacity: 0.14 }}
                />
                <div
                  className='absolute bottom-4 right-2 h-44 w-44 rounded-full'
                  style={{ background: C.primary, opacity: 0.1 }}
                />
                <div className='relative z-10 drop-shadow-[0_18px_26px_rgba(30,30,30,0.10)]'>
                  <ServiceIcon slug={services[0]?.slug || ''} size={180} color={catColor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Treatments: editorial blocks ─── */}
      <section className='relative overflow-hidden py-10 sm:py-12 lg:py-14'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-5xl space-y-4'>
            {services.map((service, i) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className='group grid grid-cols-[auto_1fr] items-start gap-5 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:gap-8 sm:p-7'
                style={{
                  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
                  borderLeft: `3px solid ${service.color}`,
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20'
                  style={{ background: `${service.color}12` }}
                >
                  <ServiceIcon slug={service.slug} size={48} color={service.color} className='sm:h-12 sm:w-12' />
                </div>
                <div className='min-w-0 flex-1 pt-1 sm:pt-2'>
                  <h3
                    className='text-sm font-semibold leading-snug sm:text-base'
                    style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}
                  >
                    {service.title}
                  </h3>
                  <p className='mt-2 text-xs leading-6 line-clamp-2 sm:mt-2.5 sm:text-sm sm:leading-7 sm:line-clamp-none' style={{ fontWeight: 500 }}>
                    {service.intro}
                  </p>
                  <span
                    className='mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-transform group-hover:translate-x-1 sm:mt-4'
                    style={{ color: service.color }}
                  >
                    Découvrir le traitement
                    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M9 3L3 9M3 3L9 9' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust signals ─── */}
      <section className='py-8 sm:py-10'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl'>
            <div className='rounded-2xl p-6 text-center' style={{ background: `#ffffff`, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}>
              <div className='grid grid-cols-3 gap-6'>
                {[
                  { value: '10+', label: "Années d'expertise" },
                  { value: '50+', label: 'Traitements' },
                  { value: '2 000+', label: 'Patient(e)s' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className='font-amoria text-3xl leading-none sm:text-4xl' style={{ color: catColor }}>{s.value}</p>
                    <p className='mt-1.5 text-xs sm:text-sm'>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Other categories: themed cards ─── */}
      <section className='relative overflow-hidden py-10 sm:py-12 lg:py-14'>
        <div className={`${SPACING.container}`}>
          <div className='mx-auto max-w-4xl'>
            <h2
              className='mb-6 text-center leading-tight sm:text-2xl'
              style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h3, letterSpacing: TYPE.headingSpacing, color: C.secondary }}
            >
              <em style={{ color: catColor, fontStyle: 'italic' }}>Autres</em> catégories
            </h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              {otherCategories.map((catSlug) => {
                const catData = CATEGORY_LABELS[catSlug]
                const otherCatColor = CATEGORY_COLORS[catSlug] || C.primary
                const catServices = SERVICE_PAGES.filter((p) => p.category === catSlug)
                return (
                  <Link
                    key={catSlug}
                    to={`/category/${catSlug}`}
                    className='group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg min-h-touch'
                    style={{
                      background: `${otherCatColor}0A`,
                      border: `1px solid ${otherCatColor}20`,
                      boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl' style={{ background: `${otherCatColor}15` }}>
                      <ServiceIcon slug={catServices[0]?.slug || ''} size={28} color={otherCatColor} />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold' style={{ fontFamily: TYPE.headingFamily, color: C.secondary }}>
                        {catData.title}
                      </h3>
                      <p className='mt-0.5 text-xs' style={{ color: otherCatColor }}>
                        Découvrir les traitements →
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className='relative overflow-hidden pb-12 sm:pb-14'>
        <div className={`${SPACING.container}`}>
          <div className='relative overflow-hidden mx-auto max-w-4xl rounded-2xl p-10 text-center sm:p-14'
            style={{ background: C.primary }}
          >
            <div className='relative z-10'>
              <h2
                className='mx-auto max-w-2xl leading-tight sm:text-2xl'
                style={{ fontFamily: TYPE.headingFamily, fontSize: TYPE.h3, letterSpacing: TYPE.headingSpacing, color: '#ffffff' }}
              >
                Ensemble, élaborons un plan de traitement efficace et adapté à votre demande.
              </h2>
              <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
                <button
                  onClick={open}
                  className='inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold min-h-touch'
                  style={{ background: '#ffffff', color: C.primary }}
                >
                  Prendre rendez-vous
                </button>
                <a
                  href='tel:+212535624696'
                  className='inline-flex items-center rounded-full border-2 px-7 py-3.5 text-sm font-semibold transition min-h-touch'
                  style={{ borderColor: '#ffffff', color: '#ffffff' }}
                >
                  +212 (535) 624 696
                </a>
              </div>
            </div>
            <img
              src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ab80d30a331b406dca0b96_cta-visual-bottom-left.png'
              alt='' className='pointer-events-none absolute bottom-0 left-0 z-0 hidden select-none sm:block'
              style={{ width: '8vw', maxWidth: 100 }}
            />
            <img
              src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ab80d3911f5fb82f1302e5_cta-visual-top-right.png'
              alt='' className='pointer-events-none absolute right-0 top-0 z-0 hidden select-none sm:block'
              style={{ width: '8vw', maxWidth: 100 }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
